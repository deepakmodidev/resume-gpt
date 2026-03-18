import json
import logging
import os
from typing import AsyncIterable

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import Agent, AgentServer, AgentSession, llm
from livekit.plugins import openai, sarvam, silero

load_dotenv(dotenv_path=".env")
logger = logging.getLogger("interview-agent")

# ---------------------------------------------------------------------------
# Monkey patch: Sarvam STT returns None for language_code which crashes
# LiveKit's _normalize_language — guard until fixed upstream
# ---------------------------------------------------------------------------
import livekit.agents.language as _lang
_orig = _lang._normalize_language
_lang._normalize_language = lambda code: _orig(code or "")


# ---------------------------------------------------------------------------
# InterviewAgent
# Filters <think>...</think> reasoning tokens that Sarvam-M emits
# Without this the TTS would speak the internal reasoning out loud
# ---------------------------------------------------------------------------
class InterviewAgent(Agent):
    async def llm_node(
        self,
        chat_ctx: llm.ChatContext,
        tools: list[llm.FunctionTool],
        model_settings: llm.ModelSettings,
    ) -> AsyncIterable[llm.ChatChunk]:
        buf = ""
        last_chunk = None

        async for chunk in Agent.default.llm_node(self, chat_ctx, tools, model_settings):
            content = chunk.choices[0].delta.content if chunk.choices else None
            if not content:
                yield chunk
                continue

            last_chunk = chunk
            buf += content
            buf = buf.replace("<think>", "").replace("</think>", "")

            # Hold back partial tags at stream boundary e.g. "<thi" could be "<think>"
            lt = buf.rfind("<")
            if lt != -1 and ("<think>".startswith(buf[lt:]) or "</think>".startswith(buf[lt:])):
                out, buf = buf[:lt], buf[lt:]
            else:
                out, buf = buf, ""

            if out:
                chunk.choices[0].delta.content = out
                yield chunk

        # Flush remaining buffer at end of stream
        if buf and last_chunk:
            buf = buf.replace("<think>", "").replace("</think>", "")
            if buf:
                last_chunk.choices[0].delta.content = buf
                yield last_chunk


# ---------------------------------------------------------------------------
# Server + Entrypoint
# ---------------------------------------------------------------------------
server = AgentServer()

@server.rtc_session(agent_name="interview-agent")
async def entrypoint(ctx: agents.JobContext):
    # Read resume + JD from job metadata sent by Next.js on dispatch
    resume = "No resume provided."
    jd = "No job description provided."
    try:
        meta = json.loads(ctx.job.metadata or "{}")
        resume = meta.get("resumeText", resume)
        jd = meta.get("jobDescription", jd)
    except Exception:
        logger.warning("Could not parse job metadata — using defaults")

    # AgentSession — connects automatically on session.start()
    session = AgentSession(
        vad=silero.VAD.load(),
        stt=sarvam.STT(
            language="en-IN",
            model="saaras:v3",
        ),
        llm=openai.LLM(
            model="sarvam-m",
            base_url="https://api.sarvam.ai/v1",
            api_key=os.environ["SARVAM_API_KEY"],
            temperature=0.5,
        ),
        tts=sarvam.TTS(
            target_language_code="en-IN",
            model="bulbul:v3",
            speaker="ishita",
        ),
    )

    # NOTE: No initial_ctx with assistant role — Sarvam-M strictly requires
    # the first message to be from user (or after system message).
    # Resume + JD context goes entirely in system instructions instead.
    await session.start(
        room=ctx.room,
        agent=InterviewAgent(
            instructions=f"""
            You are ResumeGPT, a friendly and professional technical recruiter conducting a mock interview.

            RULES:
            - Ask ONE question at a time. Wait for the full answer before asking the next.
            - You are the INTERVIEWER only — never respond as the candidate.
            - Keep all responses short and conversational — this is a voice call, not a chat.
            - No bullet points, markdown, or lists in your spoken responses.
            - Base all your questions strictly on the resume and job description provided.

            CANDIDATE RESUME:
            {resume}

            JOB DESCRIPTION:
            {jd}
            """,
        ),
    )

    # generate_reply injects a system-level instruction and triggers the first response
    # This does NOT add an assistant message first — safe for Sarvam-M
    await session.generate_reply(
        instructions="Greet the candidate warmly, introduce yourself as ResumeGPT, and ask them to briefly introduce themselves."
    )


if __name__ == "__main__":
    agents.cli.run_app(server)