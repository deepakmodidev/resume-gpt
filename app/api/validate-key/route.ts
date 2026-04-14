import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { validateRequest, ValidateKeyRequestSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const rawData = await req.json();

    // Validate request body
    const validation = validateRequest(ValidateKeyRequestSchema, rawData);
    if (!validation.success) {
      const { error } = validation;
      logger.warn("Validate key validation failed:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    const { apiKey } = validation.data;

    if (!apiKey.startsWith("gsk_")) {
      return NextResponse.json(
        { error: "Invalid Groq API key format. Should start with 'gsk_'" },
        { status: 400 },
      );
    }

    // Test the Groq API key by making a simple request
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    // Test with a very simple request
    await client.models.list();

    // If we get here without throwing, the key is valid
    return NextResponse.json({ valid: true });
  } catch (error) {
    logger.error("API key validation error:", error);
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }
}
