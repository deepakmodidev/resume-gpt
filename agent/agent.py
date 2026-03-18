import logging
import os
import json
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import AgentServer, AgentSession, Agent
from livekit.plugins import openai, sarvam

load_dotenv(dotenv_path=".env")

logger = logging.getLogger("voice-agent")
logger.setLevel(logging.INFO)

server = AgentServer()

@server.rtc_session(agent_name="interview-agent")
async def interview_agent(ctx: agents.JobContext):
    # Extract the resume context passed from Next.js backend
    resume_text = "No resume provided."
    jd_text = "No job description provided."
    
    if ctx.room.local_participant and ctx.room.local_participant.metadata:
        try:
            metadata = json.loads(ctx.room.local_participant.metadata)
            resume_text = metadata.get("resumeText", resume_text)
            jd_text = metadata.get("jobDescription", jd_text)
        except Exception as e:
            logger.error(f"Failed to parse participant metadata: {e}")

    # Build system instructions
    system_prompt = f"""
    You are ResumeGPT, an expert technical recruiter conducting an interview.
    You must be friendly, concise, and conversational. Speak naturally.
    Do NOT ask multiple questions at once. Ask one question, wait for the response, and then ask the next.
    
    Wait for the user to introduce themselves first.
    
    Candidate's Resume Context:
    {resume_text}
    
    Job Description Context:
    {jd_text}
    
    Your goal is to conduct a 5-minute technical and behavioral interview based strictly on their resume and the job requirements.
    """

    session = AgentSession(
        # Convert audio to text
        stt=sarvam.STT(
            language="en-IN",
            model="saarika:v2.5"
        ),
        # Generative model via OpenAI compatible endpoint
        llm=openai.LLM(
            model="sarvam-m", 
            base_url="https://api.sarvam.ai/v1",
            api_key=os.getenv("SARVAM_API_KEY")
        ),
        # Convert text back to speech
        tts=sarvam.TTS(
            target_language_code="en-IN",
            model="bulbul:v2",
            speaker="anushka" 
        ),
    )

    await session.start(
        room=ctx.room,
        agent=Agent(instructions=system_prompt),
    )

    # Initial greeting trigger
    await session.generate_reply(
        instructions="Greet the candidate and ask them to introduce themselves.",
    )

if __name__ == "__main__":
    agents.cli.run_app(server)
