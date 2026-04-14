import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { RESUME_BUILDER_PROMPT } from "@/lib/prompts";
import { AI_MODELS } from "@/lib/constants";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { history, resumeData, userApiKey } = body;

    // API Key resolution logic:
    // 1. x-groq-api-key header
    // 2. userApiKey from request body
    // 3. process.env.GROQ_API_KEY
    const apiKey = 
      req.headers.get("x-groq-api-key") || 
      userApiKey || 
      process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API Key is missing. Please provide one in settings." },
        { status: 401 }
      );
    }

    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    // Format history for OpenAI
    // Frontend history uses { role: "user" | "model", parts: [{ text: string }] }
    const messages = history.map((msg: any) => ({
      role: msg.role === "model" ? "assistant" : msg.role,
      content: msg.parts[0].text,
    }));

    const systemMessage = {
      role: "system",
      content: `${RESUME_BUILDER_PROMPT}\n\nCURRENT RESUME DATA:\n${JSON.stringify(resumeData, null, 2)}`,
    };

    const response = await client.chat.completions.create({
      model: AI_MODELS.GROQ_PRIMARY,
      messages: [systemMessage, ...messages],
      response_format: { type: "json_object" },
      temperature: 0.1, // Keep it precise for resume building
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from Groq");
    }

    const parsedContent = JSON.parse(content);

    // Return in the format expected by useChat.ts
    return NextResponse.json({
      response: parsedContent
    });

  } catch (error: any) {
    logger.error("Groq Chat Error:", error);
    
    const statusCode = error.status || 500;
    const message = error.message || "An error occurred during the chat request.";

    return NextResponse.json(
      { error: message },
      { status: statusCode }
    );
  }
}
