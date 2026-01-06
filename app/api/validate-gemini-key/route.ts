import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey || !apiKey.startsWith("AIza")) {
      return NextResponse.json(
        { error: "Invalid API key format" },
        { status: 400 },
      );
    }

    // Test the API key by making a simple request
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // Test with a simple prompt
    await model.generateContent("Test");

    // If we get here without throwing, the key is valid
    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("API key validation error:", error);
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }
}

export const dynamic = "force-dynamic";
