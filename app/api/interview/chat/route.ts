import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";

const SYSTEM_INSTRUCTION = `
You are an expert technical interviewer conducting a screening interview.
The candidate has provided their resume and a target job description.

YOUR GOAL:
Conduct a professional, friendly, but rigorous interview. Assess the candidate's fit for the specific job description provided.

RULES FOR INTERACTION:
1.  **Conversational Tone**: Speak naturally, like a human on a video call. Avoid robotic phrasing.
2.  **Short Responses**: Keep your responses concise (1-3 sentences suitable for speech synthesis). Do not monologue.
3.  **One Question at a Time**: Ask only ONE question per turn. Wait for the candidate's answer.
4.  **No Markdown**: Output PLAIN TEXT only. Do not use asterisks, bullet points, or bold text. These break text-to-speech.
5.  **Stay in Character**: Never break character. You are the recruiter/hiring manager at the company.
6.  **Follow-up**: If the candidate gives a vague answer, ask for specific examples (STAR method).

INTERVIEW FLOW:
1.  Start by welcoming the candidate and asking them to introduce themselves briefly.
2.  Move to questions about their resume experience relevant to the job.
3.  Ask technical/behavioral questions based on the job requirements.
4.  Wrap up the interview politely.

If the user says "End interview" or "Stop", provide a brief encouraging wrap-up and feedback.
`;

const GENERATION_CONFIG = {
  temperature: 0.7,
  topP: 0.8,
  maxOutputTokens: 500, // Short responses
};

export async function POST(req: NextRequest) {
  try {
    const { messages, resumeText, jobDescription, userApiKey } =
      await req.json();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = userApiKey || process.env.GEMINI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not available" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Fast model for voice interaction
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    // Construct history with context
    // We inject the resume and JD into the first message or system context logic conceptually
    // But since Gemini supports history, we'll prepend context to the first user message if history is empty
    let chatHistory = messages || [];

    // Start Chat
    const chat = model.startChat({
      generationConfig: GENERATION_CONFIG,
      history: chatHistory.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
    });

    // Prepare the message
    // If it's the very first message (start of interview), we might need to trigger the welcome manually
    // or expected the client to send a "Ready" signal.
    // Let's assume the client sends the latest user input.

    // For the very first turn, the client might send "Start interview".
    // We attach context then.

    let currentMessage = messages[messages.length - 1].content;

    if (messages.length === 1) {
      // First message: Attach Resume and JD Context
      currentMessage = `
[CONTEXT START]
RESUME CONTENT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
[CONTEXT END]

${currentMessage}
        `;
    }

    const result = await chat.sendMessage(currentMessage);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Interview API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
