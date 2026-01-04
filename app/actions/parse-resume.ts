"use server";

import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function parseResume(
  formData: FormData
): Promise<{ text: string; error?: string }> {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { text: "", error: "No file provided" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type;

    let text = "";

    if (fileType === "application/pdf") {
      const data = await pdf(buffer);
      text = data.text;
    } else if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (
      fileType === "text/plain" ||
      file.name.endsWith(".txt") ||
      file.name.endsWith(".rtf")
    ) {
      // For RTF/TXT, basic text decoding
      text = buffer.toString("utf-8");
    } else {
      return {
        text: "",
        error: "Unsupported file type. Please upload PDF, DOCX, or TXT.",
      };
    }

    // Basic cleaning
    text = text.replace(/\s+/g, " ").trim();

    return { text };
  } catch (error) {
    console.error("Error parsing resume:", error);
    return { text: "", error: "Failed to parse file content." };
  }
}
