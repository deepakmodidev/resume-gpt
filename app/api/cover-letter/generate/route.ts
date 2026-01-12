import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { validateRequest, CoverLetterRequestSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";
import { COVER_LETTER_PROMPT } from "@/lib/prompts";
import { AI_GENERATION_CONFIGS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const rawData = await req.json();

    // Build validation data - handle undefined/null and field name mapping
    const validationData = {
      resumeData: rawData.resumeData || {},
      jobDescription: rawData.jobDescription?.trim() || "",
      jobTitle: rawData.jobTitle || "",
      company: rawData.companyName || "",
      userApiKey: rawData.userApiKey || null,
    };

    const validation = validateRequest(
      CoverLetterRequestSchema,
      validationData
    );
    if (!validation.success) {
      const { error } = validation;
      logger.warn("Cover letter validation failed:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    const {
      resumeData,
      jobDescription,
      jobTitle,
      company: companyName,
    } = validation.data;
    const recipientName = rawData.recipientName;
    const tone = rawData.tone || "professional";

    const apiKey = process.env.GEMINI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Build prompt based on whether job description is provided
    const hasJobDescription = jobDescription && jobDescription.trim();

    // Use rawContent if available, otherwise format resume data cleanly
    const resumeText = resumeData.rawContent || `
Name: ${resumeData.name || 'Not provided'}
Skills: ${resumeData.skills?.join(', ') || 'Not provided'}
Experience: ${resumeData.experience?.map((exp: any) =>
      `${exp.title || ''} at ${exp.company || ''} - ${exp.description || ''}`.trim()
    ).join('; ') || 'Not provided'}
`.trim();

    const prompt = hasJobDescription
      ? `
Generate a cover letter with the following details:

JOB DETAILS:
- Company: ${companyName}
- Position: ${jobTitle}
- Hiring Manager: ${recipientName || "Not specified"}
- Current Date: ${currentDate}

JOB DESCRIPTION:
${jobDescription}

TONE PREFERENCE: ${tone}

Generate a tailored, compelling cover letter that matches the applicant's experience with the job requirements.
`
      : `
Generate a GENERALIZED cover letter with the following details:

JOB DETAILS:
- Company: ${companyName}
- Position: ${jobTitle}
- Hiring Manager: ${recipientName || "Not specified"}
- Current Date: ${currentDate}

TONE PREFERENCE: ${tone}

NOTE: No specific job description was provided. Generate a generalized cover letter that:
1. Highlights the applicant's key skills and experience from their resume
2. Shows enthusiasm for the ${jobTitle} role at ${companyName}
3. Emphasizes transferable skills and achievements
4. Remains professional and compelling without referencing specific job requirements
`;

    // Put resume data in systemInstruction like chat does (more reliable)
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: `${COVER_LETTER_PROMPT}\n\nAPPLICANT RESUME:\n${resumeText}`,
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        ...AI_GENERATION_CONFIGS.COVER_LETTER,
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();

    // Parse the JSON response
    const cleaned = responseText.replace(/```json\n?|\n?```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json(parsed);
  } catch (error) {
    logger.error("Cover Letter Generation Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate cover letter",
      },
      { status: 500 }
    );
  }
}

