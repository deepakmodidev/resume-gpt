import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { validateRequest, CoverLetterRequestSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";
import { requireAuth, isAuthorized } from "@/lib/auth-middleware";
import { COVER_LETTER_PROMPT } from "@/lib/prompts";
import { AI_GENERATION_CONFIGS, AI_MODELS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    // Authentication required for AI Cover Letter Generation
    const authResult = await requireAuth();
    if (!isAuthorized(authResult)) {
      return authResult.response;
    }

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
      validationData,
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

    // Key Resolution: Headers -> Body -> ENV
    const headerApiKey = req.headers.get("x-groq-api-key");
    const apiKey =
      headerApiKey || rawData.userApiKey || process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 },
      );
    }

    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const hasJobDescription = jobDescription && jobDescription.trim();

    const resumeText =
      resumeData.rawContent ||
      `
Name: ${resumeData.name || "Not provided"}
Skills: ${resumeData.skills?.join(", ") || "Not provided"}
Experience: ${
        resumeData.experience
          ?.map((exp: any) =>
            `${exp.title || ""} at ${exp.company || ""} - ${exp.description || ""}`.trim(),
          )
          .join("; ") || "Not provided"
      }
`.trim();

    const userPrompt = hasJobDescription
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

    const chatCompletion = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `${COVER_LETTER_PROMPT}\n\nAPPLICANT RESUME:\n${resumeText}`,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: AI_MODELS.GROQ_PRIMARY,
      temperature: 0.1, // Low temperature for consistent JSON
      response_format: { type: "json_object" },
    });

    const responseText = chatCompletion.choices[0].message.content;

    if (!responseText) {
      throw new Error("Failed to generate cover letter (empty response)");
    }

    const parsed = JSON.parse(responseText);

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
      { status: 500 },
    );
  }
}
