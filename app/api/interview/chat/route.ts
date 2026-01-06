import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";

const SYSTEM_INSTRUCTION = `
You are an expert technical interviewer conducting a screening interview.

CRITICAL RULES:
1. **ULTRA SHORT**: Maximum 2 sentences per response. This is for VOICE interview.
2. **ONE QUESTION ONLY**: Ask one simple question, then STOP.
3. **NO MARKDOWN**: Plain text only. No asterisks, bullets, or formatting.
4. **CONVERSATIONAL**: Speak naturally like a real person on a phone call.
5. **FAST PACED**: Keep the interview moving quickly.

INTERVIEW STYLE:
- Welcome briefly, then ask them to introduce themselves
- Ask about their experience related to the job
- Ask one technical or behavioral question at a time
- Keep responses under 20 words when possible

EXAMPLE RESPONSES:
✅ "Great! Tell me about your experience with React."
✅ "Interesting. Can you describe a challenging project you worked on?"
✅ "Thanks for sharing. What interests you about this role?"

❌ "That's wonderful to hear! I'm really impressed by your background. Now, I'd like to ask you several questions about..."

Remember: SHORT and FAST. This is a voice interview, not an essay.
`;

const GENERATION_CONFIG = {
  temperature: 0.7,
  topP: 0.8,
  maxOutputTokens: 150, // Very short responses for faster speech
};

export async function POST(req: NextRequest) {
  try {
    const { messages, resumeText, jobDescription, userApiKey } =
      await req.json();

    // Interview is public - no auth required
    // Optional: Check session for logged-in users
    const session = await auth();
    const userId = session?.user?.id;

    const apiKey = userApiKey || process.env.GEMINI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not available" },
        { status: 500 },
      );
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview", // Latest and fastest
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    // Build chat history - Filter out AI welcome message if it's the only message
    let chatHistory = messages.slice(0, -1); // All except the last message

    // Gemini requires first message to be from user, not model
    // If chat history starts with model message (welcome), skip it
    if (chatHistory.length > 0 && chatHistory[0].role === "model") {
      chatHistory = chatHistory.slice(1);
    }

    // Start Chat
    const chat = model.startChat({
      generationConfig: GENERATION_CONFIG,
      history: chatHistory.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
    });

    // Get current message
    let currentMessage = messages[messages.length - 1].content;

    // Only attach context on first user message (when resumeText is provided)
    if (resumeText && jobDescription) {
      // Extract candidate name from resume
      const extractName = (text: string): string | null => {
        const lines = text.split("\n").filter((line) => line.trim());
        if (lines.length === 0) return null;

        const firstLine = lines[0].trim();
        if (
          firstLine.length > 2 &&
          firstLine.length < 50 &&
          !/[@#$%^&*()_+=\[\]{}|\\:;"'<>,.?\/]/.test(firstLine)
        ) {
          const cleanName = firstLine
            .replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s*/i, "")
            .trim();
          const words = cleanName.split(/\s+/);
          if (words.length >= 2 && words.length <= 4) {
            return words.slice(0, 2).join(" ");
          }
        }
        return null;
      };

      const candidateName = extractName(resumeText);
      const nameContext = candidateName
        ? `\nCANDIDATE NAME: ${candidateName}`
        : "";

      currentMessage = `
[CONTEXT START]
RESUME CONTENT:
${resumeText}

JOB DESCRIPTION:
${jobDescription || "No specific job description provided. Conduct a general interview based on the candidate's resume."}${nameContext}
[CONTEXT END]

IMPORTANT: Address the candidate by their first name naturally during the interview to create a personal connection.

${currentMessage}
      `;
    }

    // Use streaming for faster responses
    const result = await chat.sendMessageStream(currentMessage);

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
            );
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Interview API Error:", error);

    let errorMessage = "Failed to generate response";
    if (error.message?.includes("API key")) {
      errorMessage = "Invalid API key";
    } else if (error.message?.includes("quota")) {
      errorMessage = "API quota exceeded";
    } else if (error.message?.includes("network")) {
      errorMessage = "Network error";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
