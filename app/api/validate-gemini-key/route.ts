import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { validateRequest, ValidateKeyRequestSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";
import { AI_MODELS } from "@/lib/constants";

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

    if (!apiKey.startsWith("AIza")) {
      return NextResponse.json(
        { error: "Invalid API key format" },
        { status: 400 },
      );
    }

    // Test the API key by making a simple request
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: AI_MODELS.GEMINI_FLASH });

    // Test with a simple prompt
    await model.generateContent("Test");

    // If we get here without throwing, the key is valid
    return NextResponse.json({ valid: true });
  } catch (error) {
    logger.error("API key validation error:", error);
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }
}
