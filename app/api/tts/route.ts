import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * ⚠️ EXPERIMENTAL: AI Interview Feature
 * This route is part of the experimental AI Interview feature.
 * To remove interview feature, delete:
 *   - /app/api/tts/ (this folder)
 *   - /app/api/interview/
 *   - /app/interview/
 *   - /components/interview/
 *   - /hooks/useCartesiaTTS.ts
 *   - /hooks/useSpeech.ts
 *   - TTS endpoint from /lib/constants.ts
 *   - CARTESIA_API_KEY from /lib/env.ts
 *
 * Server-side TTS proxy to keep Cartesia API key hidden
 * Client calls this route → Server calls Cartesia with hidden key
 */

const CARTESIA_TTS_URL = "https://api.cartesia.ai/tts/bytes";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, userApiKey } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Use user's key first, fall back to server key
    const apiKey = userApiKey || process.env.CARTESIA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "No Cartesia API key available. Please add your own key in settings.",
        },
        { status: 400 }
      );
    }

    // Call Cartesia API from server (key is hidden!)
    const response = await fetch(CARTESIA_TTS_URL, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Cartesia-Version": "2024-06-10",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_id: "sonic-english",
        transcript: text,
        voice: {
          mode: "id",
          id: "a0e99841-438c-4a64-b679-ae501e7d6091", // Professional female voice
        },
        output_format: {
          container: "raw",
          encoding: "pcm_f32le",
          sample_rate: 44100,
        },
        language: "en",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Cartesia API error:", errorText);
      return NextResponse.json(
        { error: `TTS failed: ${response.status}` },
        { status: response.status }
      );
    }

    // Return audio data as binary
    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/raw",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    logger.error("TTS proxy error:", error);
    return NextResponse.json(
      { error: "TTS generation failed" },
      { status: 500 }
    );
  }
}
