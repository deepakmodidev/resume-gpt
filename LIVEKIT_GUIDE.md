# 🎙️ LiveKit AI Agent Development & Deployment Guide

This document summarizes the end-to-end architecture, development workflow, and deployment strategies for building a production-grade AI Voice Interview Agent using LiveKit.

---

## 🏗️ 1. Architecture: The "Worker" Model

To avoid breaking your frontend build (Next.js) or hitting dependency conflicts, the AI Agent must live in its own isolated service.

### Recommended Project Structure
```text
resume-gpt/
├── app/             # Next.js (UI + API)
├── prisma/          # Database
└── voice-agent/     # LiveKit Worker Service (Isolated)
    ├── agent.ts     # The actual AI logic
    ├── Dockerfile   # Container definition
    └── package.json # Worker-specific dependencies
```

---

## 🛠️ 2. The Core AI Stack

We use a modular approach allowing you to swap providers easily.

- **Orchestration**: `@livekit/agents`
- **LLM (Brain)**: `Groq` (using `@livekit/agents-plugin-openai` for compatibility)
- **STT/TTS (Hearing/Speech)**: `Sarvam AI` (optimized for India/multilingual)
- **VAD (Silence Detection)**: `Silero`

### Dynamic Provider Secret (Power Feature)
Because we use the OpenAI-compatible plugin, you can swap between **OpenAI** and **Groq** just by updating environment variables—no code changes required.

```typescript
const llm = new openai.LLM({
  model: process.env.LLM_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct',
  baseURL: process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1',
});
```

---

## 🚀 3. Deployment Workflow (`lk` CLI)

Once your code is ready, use the LiveKit CLI to manage your cloud agent.

| Purpose | Command |
| :--- | :--- |
| **First-time Create** | `lk agent create` |
| **Update Code** | `lk agent deploy` |
| **Update Secrets** | `lk agent update-secrets --secrets KEY=VAL` |
| **View Logs** | `lk agent logs` |
| **Check Workers** | `lk agent list-workers` |
| **Delete Agent** | `lk agent delete` |

> **Pro Tip**: Use `--overwrite` when updating secrets to ensure a clean slate, especially if switching providers.

---

## 🔐 4. Secret Management Best Practices

Never hardcode API keys. The agent requires specific environment variables to connect to plugins:

1.  **`LIVEKIT_URL`**: Your project's WebSocket URL.
2.  **`LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET`**: Authentication for the agent.
3.  **`OPENAI_API_KEY`**: Used even for Groq (if using the OpenAI plugin).
4.  **`SARVAM_API_KEY`**: Required for STT/TTS modules.

---

## 📡 5. Context Injection (Resume & JD)

To make the agent "aware" of the user's resume, we pass data during **Dispatch**.

### A. Next.js API (The Dispatcher)
```typescript
await dispatchClient.createDispatch(roomName, "interview-gpt", {
  metadata: JSON.stringify({ resume: userResume, jd: jobDescription }),
});
```

### B. Agent Code (The Receiver)
```typescript
entry: async (ctx: JobContext) => {
  const jobMeta = JSON.parse(ctx.job.metadata || '{}');
  const resume = jobMeta.resume; // Agent now knows who you are!
}
```

---

## ⚠️ Common Pitfalls & Solutions

- **401 Unauthorized**: Usually means your `OPENAI_API_KEY` secret is missing or named incorrectly when using Groq via the OpenAI plugin.
- **Build Errors**: Ensure `tsconfig.json` in root **excludes** the `voice-agent` folder to prevent Next.js from trying to compile it.
- **Cold Boot**: Use `prewarm` in your `defineAgent` to load the VAD model before the job starts to reduce latency.

---
*Created on 2026-04-15*
