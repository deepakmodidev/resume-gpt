import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { RESUME_BUILDER_PROMPT } from "@/lib/prompts";
import { AI_MODELS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { requireAuth, isAuthorized } from "@/lib/auth-middleware";
import db from "@/prisma/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Authentication required
    const authResult = await requireAuth();
    if (!isAuthorized(authResult)) {
      return authResult.response;
    }

    const userId = authResult.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found" },
        { status: 401 }
      );
    }

    // Fetch chats for the authenticated user
    const chats = await db.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ chats });
  } catch (error: any) {
    logger.error("Chat Fetch Error:", error);

    const statusCode = error.status || 500;
    const message = error.message || "An error occurred while fetching chats.";

    return NextResponse.json(
      { error: message },
      { status: statusCode }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authentication required for AI Chat
    const authResult = await requireAuth();
    if (!isAuthorized(authResult)) {
      return authResult.response;
    }

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

export async function PUT(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!isAuthorized(authResult)) {
      return authResult.response;
    }

    const userId = authResult.userId;
    const body = await req.json();
    const { chatId, newName } = body ?? {};

    if (!chatId || typeof chatId !== "string") {
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }

    if (!newName || typeof newName !== "string" || !newName.trim()) {
      return NextResponse.json(
        { error: "newName is required" },
        { status: 400 },
      );
    }

    const existingChat = await db.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
      select: { id: true },
    });

    if (!existingChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const updatedChat = await db.chat.update({
      where: { id: chatId },
      data: { title: newName.trim() },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ chat: updatedChat });
  } catch (error: any) {
    logger.error("Chat Rename Error:", error);

    const statusCode = error.status || 500;
    const message = error.message || "An error occurred while renaming chat.";

    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!isAuthorized(authResult)) {
      return authResult.response;
    }

    const userId = authResult.userId;
    const body = await req.json();
    const { chatId } = body ?? {};

    if (!chatId || typeof chatId !== "string") {
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }

    const existingChat = await db.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
      select: { id: true },
    });

    if (!existingChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    await db.chat.delete({
      where: { id: chatId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Chat Delete Error:", error);

    const statusCode = error.status || 500;
    const message = error.message || "An error occurred while deleting chat.";

    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
