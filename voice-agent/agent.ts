import {
  type JobContext,
  type JobProcess,
  ServerOptions,
  cli,
  defineAgent,
  voice,
} from '@livekit/agents';
import * as openai from '@livekit/agents-plugin-openai';
import * as sarvam from '@livekit/agents-plugin-sarvam';
import * as silero from '@livekit/agents-plugin-silero';
import 'dotenv/config';

/**
 * 🎙️ Interview GPT - LiveKit AI Agent (Replicated)
 * Flow: Greeting -> Warm-up -> 4-5 Technical Questions -> Feedback
 */

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },

  entry: async (ctx: JobContext) => {
    const roomName = ctx.job.room?.name || "unknown";
    console.log(`--- 🚀 New Job Received (ID: ${ctx.job.id}) ---`);
    console.log(`--- Connecting to room: ${roomName} ---`);
    
    await ctx.connect();
    console.log(`--- ✅ Connected to room: ${ctx.room.name} ---`);

    // 1. Fetch Resume & JD Context from Job Metadata (Official Pattern)
    let resumeText = '';
    let jdText = '';
    try {
      const jobMeta = JSON.parse(ctx.job.metadata || '{}');
      resumeText = jobMeta.resume || '';
      jdText = jobMeta.jd || '';
      
      if (resumeText) console.log(`--- 📄 Resume loaded (${resumeText.length} chars) ---`);
      if (jdText) console.log(`--- 💼 JD loaded (${jdText.length} chars) ---`);
    } catch {
      console.warn('--- ⚠️ No job metadata found ---');
    }

    // 2. LLM: Groq (using OpenAI plugin for compatibility)
    const llm = new openai.LLM({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
    });

    // 3. STT: Sarvam Saaras v3 (English/Hindi auto-detection)
    const stt = new sarvam.STT({
      model: 'saaras:v3',
      languageCode: 'en-IN',
      flushSignal: true,
    });

    // 4. TTS: Sarvam Bulbul v3 (Speaker: Shubh)
    const tts = new sarvam.TTS({
      model: 'bulbul:v3',
      speaker: 'shubh',
      targetLanguageCode: 'en-IN',
    });

    // 5. Agent Instructions (Natural Flow)
    const agent = new voice.Agent({
      instructions: `You are 'Interview GPT', a professional technical interviewer. 
      Your interview should follow this natural flow:
      
      1. Start with a professional greeting and 1-2 light warm-up questions to build rapport.
      2. Transition into a technical deep-dive by asking exactly 4-5 targeted questions based on the candidate's resume and the provided Job Description. Ask exactly ONE question at a time.
      3. After completion, provide a concise summary of performance and 1-2 areas for improvement.
      4. Close the session gracefully.
      
      CORE RULES:
      - Ask exactly one question at a time.
      - Maintain high technical standards.
      - Tailor questions to the Job Description if provided.
      
      ### JOB DESCRIPTION:
      ${jdText || "No job description provided. Focus on the candidate's resume and general industry standards."}
      
      ### USER RESUME CONTEXT:
      ${resumeText}`,
    });

    // 6. Session Orchestration
    const session = new voice.AgentSession({
      stt,
      llm,
      tts,
      vad: ctx.proc.userData.vad as silero.VAD,
      turnHandling: {
        turnDetection: 'vad',
        endpointing: {
          minDelay: 0.5, // 500ms silence before bot starts thinking
        },
      },
    });

    // 7. Start Session
    await session.start({ agent, room: ctx.room });
    
    // 8. Greeting Orchestration: Wait for a human participant to hear us
    const greet = async () => {
      console.log('--- 👋 Triggering Greeting... ---');
      session.generateReply({
        instructions: "Start by saying exactly: 'Hello, I am Interview GPT and I will conduct a mock interview based on your resume.' After that, ask a friendly warm-up question to build rapport.",
      });
    };

    // If a human is already here, greet immediately. Otherwise, wait for someone.
    const humanParticipants = ctx.room.remoteParticipants.values();
    if (Array.from(humanParticipants).length > 0) {
      greet();
    } else {
      ctx.room.on('participantConnected', () => {
        console.log('--- 👤 Participant connected, greeting... ---');
        greet();
      });
    }

    session.on(voice.AgentSessionEventTypes.UserInputTranscribed, (ev) => {
      if (ev.isFinal) console.log('👤 User:', ev.transcript);
    });

    session.on(voice.AgentSessionEventTypes.Error, (err) => {
      console.error('⚠️ Session Error:', err);
    });
  },
});

// 🚀 CLI Runner (Fully Aligned with Official Docs)
cli.runApp(
  new ServerOptions({
    agent: __filename,
    agentName: 'interview-gpt',
  }),
);