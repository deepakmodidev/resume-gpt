import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { validateRequest, CoverLetterRequestSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";

const SYSTEM_INSTRUCTION = `
You are a professional cover letter writer. Generate personalized, compelling cover letters based on the user's resume and job description.

RESPONSE FORMAT - CRITICAL:
Your response MUST be valid JSON with EXACTLY this structure:
{
  "coverLetterData": {
    "recipientName": "Hiring Manager name or 'Hiring Manager' if not provided",
    "recipientTitle": "Their title if known",
    "companyName": "Target company name",
    "companyAddress": "",
    "jobTitle": "Position being applied for",
    "senderName": "Applicant's name from resume",
    "senderEmail": "Applicant's email from resume",
    "senderPhone": "Applicant's phone from resume",
    "senderAddress": "Applicant's location from resume",
    "date": "Current date in format: January 4, 2026",
    "greeting": "Dear [Recipient Name or Hiring Manager],",
    "opening": "A compelling opening paragraph that expresses interest and mentions the position",
    "body": "2-3 paragraphs highlighting relevant experience, skills, and achievements that match the job requirements. Use specific examples from the resume that align with the job description.",
    "closing": "Sincerely,",
    "signature": "Applicant's name"
  }
}

WRITING GUIDELINES:
- Be specific and reference actual skills/experience from the resume
- Match keywords and requirements from the job description
- Keep it concise (3-4 paragraphs for body)
- Show enthusiasm without being over-the-top
- Highlight quantifiable achievements when possible
- Adapt tone based on the specified tone preference

TONE GUIDELINES:
- professional: Formal, business-like language. Focus on qualifications and experience.
- friendly: Warm but still professional. Show personality while maintaining respect.
- enthusiastic: Energetic and passionate. Express genuine excitement about the opportunity.

DO NOT include any text before or after the JSON object.
`;

const GENERATION_CONFIG = {
  temperature: 0.7,
  topP: 0.9,
  maxOutputTokens: 2048,
};

export async function POST(req: NextRequest) {
  try {
    const rawData = await req.json();

    // Validate required fields first
    if (!rawData.companyName || !rawData.jobTitle) {
      return NextResponse.json(
        { error: "Company name and job title are required" },
        { status: 400 }
      );
    }

    // Build validation data
    const validationData = {
      resumeData: rawData.resumeData,
      jobDescription: rawData.jobDescription || "",
      jobTitle: rawData.jobTitle,
      company: rawData.companyName,
      userApiKey: rawData.userApiKey,
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
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Build prompt based on whether job description is provided
    const hasJobDescription = jobDescription && jobDescription.trim();

    const prompt = hasJobDescription
      ? `
Generate a cover letter with the following details:

APPLICANT RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

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

APPLICANT RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB DETAILS:
- Company: ${companyName}
- Position: ${jobTitle}
- Hiring Manager: ${recipientName || "Not specified"}
- Current Date: ${currentDate}

NOTE: No specific job description was provided. Generate a generalized cover letter that:
1. Highlights the applicant's key skills and experience from their resume
2. Shows enthusiasm for the ${jobTitle} role at ${companyName}
3. Emphasizes transferable skills and achievements
4. Remains professional and compelling without referencing specific job requirements

TONE PREFERENCE: ${tone}

Generate a compelling, professional cover letter based solely on the applicant's resume.
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: GENERATION_CONFIG,
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
    console.error("Cover Letter Generation Error:", error);
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

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
