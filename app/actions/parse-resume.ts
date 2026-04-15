"use server";

import { extractText } from "unpdf";
import mammoth from "mammoth";
import { logger } from "@/lib/logger";

/**
 * 📄 Unified File Parser (Internal)
 * Consolidates PDF, DOCX, and Text extraction into a single, reliable utility.
 * Exported so that the Voice API handles everything consistently.
 */
export async function parseFileToText(
  buffer: ArrayBuffer | Buffer,
  fileName: string,
  fileType: string
): Promise<{ text: string; error?: string }> {
  try {
    const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    let text = "";

    // 1. PDF Parsing (unpdf - Modern PDF.js based)
    if (fileType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
      const { text: extracted } = await extractText(buffer, { mergePages: true });
      text = Array.isArray(extracted) ? extracted.join("\n") : (extracted || "");
    } 
    
    // 2. Word Document Parsing (mammoth)
    else if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
      fileName.toLowerCase().endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer: nodeBuffer });
      text = result.value;
    } 
    
    // 3. Plain Text / RTF Fallback
    else if (
      fileType === "text/plain" || 
      fileName.toLowerCase().endsWith(".txt") || 
      fileName.toLowerCase().endsWith(".rtf")
    ) {
      text = nodeBuffer.toString("utf-8");
    } 
    
    // 4. Unsupported
    else {
      return { 
        text: "", 
        error: "Unrecognized file format. Supported: PDF, DOCX, TXT, RTF." 
      };
    }

    // 5. Standardized Text Cleaning
    text = text.replace(/\s+/g, " ").trim();

    if (!text) {
      return { text: "", error: "Could not extract any readable text from this file." };
    }

    return { text };

  } catch (error) {
    logger.error("❌ Unified Parser Error:", error);
    return { 
      text: "", 
      error: `Failed to parse ${fileName}. Please try another file version.` 
    };
  }
}

export async function parseResume(
  formData: FormData,
): Promise<{ text: string; error?: string }> {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { text: "", error: "No file provided" };
    }

    const { text, error } = await parseFileToText(
      await file.arrayBuffer(),
      file.name,
      file.type
    );

    if (error) return { text: "", error };
    return { text };
  } catch (error) {
    logger.error("Error parsing resume:", error);
    return { text: "", error: "Failed to parse file content." };
  }
}
