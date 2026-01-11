import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import db from "@/prisma/prisma";
import { validateRequest, ChatRequestSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";
import { AI_MODELS } from "@/lib/constants";
import { env } from "@/lib/env";

import { SYSTEM_INSTRUCTION } from "@/lib/prompts";
import { deepMerge } from "@/lib/utils";

// Types
interface ParsedResponse {
  acknowledgement: string;
  updatedSection: Record<string, unknown>;
}

const GENERATION_CONFIG = {
  temperature: 0.6,
  topP: 0.9,
  maxOutputTokens: 2048,
  responseMimeType: "application/json",
};

const parseResponse = (text: string): ParsedResponse => {
  const cleanAndParse = (input: string) => {
    try {
      // Remove markdown and trim
      const cleaned = input
        .replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, "$1")
        .trim();
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  };

  // 1. Attempt standard parsing
  let parsed = cleanAndParse(text);

  // 2. Fallback: Try regex extraction if standard parse failed
  if (!parsed) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = cleanAndParse(jsonMatch[0]);
  }

  // 3. Construct result
  if (parsed) {
    let ack = parsed.acknowledgement || parsed.response;

    // Handle edge case: acknowledgement is an object/array
    if (typeof ack === "object") {
      try {
        ack = JSON.stringify(ack);
      } catch {
        ack = "";
      }
    }

    // Handle edge case: acknowledgement is empty
    if (!ack || typeof ack !== "string" || !ack.trim()) {
      ack = "Error: AI response text was empty.";
    }

    return {
      acknowledgement: ack,
      updatedSection: parsed.updatedSection || parsed.data || {},
    };
  }

  // 4. Final Fallback: Return raw text (assuming AI failed to JSON-ify)
  // If it looks like code/malformed JSON, show error
  if (text.trim().startsWith("{") || text.includes('{"')) {
    return {
      acknowledgement: "Error: Invalid JSON response from AI.",
      updatedSection: {},
    };
  }

  return { acknowledgement: text, updatedSection: {} };
};

const upsertChat = async (
  chatId: string,
  userId: string,
  message: string,
  userMsg: unknown,
  modelMsg: unknown,
  resumeData: unknown
) => {
  const chat = await db.chat.findUnique({ where: { id: chatId, userId } }); // 🎯 RAG: Database Retrieval - Gets stored conversation context

  if (chat) {
    await db.chat.update({
      where: { id: chatId, userId },
      data: {
        messages: { push: [userMsg, modelMsg] as never }, // 🎯 RAG: Memory Extension - Appends to conversation history
        resumeData: resumeData as never, // 🎯 RAG: Context Update - Updates stored resume context
      },
    });
  } else {
    await db.chat.create({
      data: {
        id: chatId,
        userId,
        title: message.slice(0, 30) || "New ResumeGPT Chat",
        messages: [userMsg, modelMsg] as never,
        resumeData: resumeData as never,
        resumeTemplate: "classic",
      },
    });
  }
};

const handleError = (error: unknown, defaultStatus = 500) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  const status = [
    "Invalid history",
    "Missing chat ID",
    "Missing message or resume data",
  ].includes(message)
    ? 400
    : defaultStatus;
  return NextResponse.json({ error: message }, { status });
};

// Handlers
export async function POST(req: NextRequest) {
  try {
    const rawData = await req.json();

    // Validate request with Zod
    const validation = validateRequest(ChatRequestSchema, rawData);
    if (!validation.success) {
      const { error } = validation;
      logger.warn("Chat validation failed", { error });
      return NextResponse.json({ error }, { status: 400 });
    }

    // TypeScript now knows validation.data exists
    const { history, resumeData, chatId, userApiKey } = validation.data;
    const message = history[history.length - 1]?.parts?.[0]?.text;

    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

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
      model: AI_MODELS.GEMINI_FLASH,
      systemInstruction: `${SYSTEM_INSTRUCTION}\n\nCURRENT RESUME DATA:\n${JSON.stringify(resumeData)}`,
    });
    const chat = model.startChat({
      generationConfig: GENERATION_CONFIG,
      history,
    });
    const result = await chat.sendMessage(message);
    const response = parseResponse(result.response.text());

    const acknowledgement =
      response?.acknowledgement || "Error: AI response empty.";
    const updatedSection = response?.updatedSection || {};

    const mergedData = deepMerge(resumeData, updatedSection); // 🎯 RAG: Context Merging - Combines retrieved data with new updates

    const userMsg = { role: "user", parts: [{ text: message }] };
    const modelMsg = { role: "model", parts: [{ text: acknowledgement }] };

    await upsertChat(
      chatId,
      session.user.id,
      message,
      userMsg,
      modelMsg,
      mergedData // 🎯 RAG: Database Storage - Stores context for future retrieval
    );
    return NextResponse.json({ response });
  } catch (error) {
    return handleError(error);
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const chats = await db.chat.findMany({
      where: { userId: session.user.id },
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ chats });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { chatId } = await req.json();
    if (!chatId)
      return NextResponse.json({ error: "Chat ID required" }, { status: 400 });

    const deleted = await db.chat.deleteMany({
      where: { id: chatId, userId: session.user.id },
    });
    if (!deleted.count)
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });

    return NextResponse.json({ message: "Chat deleted successfully" });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { chatId, newName } = await req.json();
    if (!chatId || !newName)
      return NextResponse.json(
        { error: "Chat ID and name required" },
        { status: 400 }
      );

    const updated = await db.chat.updateMany({
      where: { id: chatId, userId: session.user.id },
      data: { title: newName },
    });

    if (!updated.count)
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    return NextResponse.json({ message: "Chat updated successfully" });
  } catch (error) {
    return handleError(error);
  }
}
