import { NextResponse } from "next/server";
import { extractText } from "unpdf";

// 📝 Modern Voice Resume Extractor (unpdf)
// Using unpdf for faster, more reliable server-side extraction.

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 1. ArrayBuffer converts to Buffer/Uint8Array for unpdf
    const arrayBuffer = await file.arrayBuffer();

    // 2. Extract Text
    const { text } = await extractText(arrayBuffer, { mergePages: true });

    if (!text || (Array.isArray(text) && text.length === 0)) {
      return NextResponse.json(
        { error: "Could not extract text from this PDF (unpdf failure)" },
        { status: 422 }
      );
    }

    // 3. Limit to 20,000 chars for Agent Context
    // Safe to send large text — resume is dispatched via job metadata, not JWT
    const resumeText = text.trim().substring(0, 20000);
    console.log(`--- ✅ Resume Extracted (${resumeText.length} chars) ---`);

    return NextResponse.json({ text: resumeText });

  } catch (error) {
    console.error("❌ Extraction Error:", error);
    return NextResponse.json(
      { error: "Internal error during resume extraction" },
      { status: 500 }
    );
  }
}
