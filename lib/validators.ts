import { z } from "zod";

/**
 * Zod validation schemas for API requests
 * Prevents invalid data from reaching API routes
 */

// Experience schema
export const ExperienceSchema = z.object({
  title: z.string().min(1, "Job title required").max(200),
  company: z.string().min(1, "Company required").max(200),
  location: z.string().max(100).optional(),
  period: z.string().max(100),
  description: z.string().max(2000),
});

// Education schema
export const EducationSchema = z.object({
  degree: z.string().min(1, "Degree required").max(200),
  institution: z.string().min(1, "Institution required").max(200),
  year: z.string().max(50),
});

// Project schema
export const ProjectSchema = z.object({
  name: z.string().min(1, "Project name required").max(200),
  description: z.string().max(1000),
  techStack: z.array(z.string()).optional(),
});

// Certification schema
export const CertificationSchema = z.object({
  name: z.string().min(1, "Certification name required").max(200),
  issuer: z.string().max(200).optional(),
  date: z.string().max(50).optional(),
});

// Chat API validation
export const ChatRequestSchema = z.object({
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        parts: z.array(
          z.object({
            text: z.string().min(1).max(10000),
          })
        ),
      })
    )
    .max(100),
  resumeData: z.object({
    name: z.string().max(100).optional(),
    title: z.string().max(100).optional(),
    contact: z
      .object({
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().max(20).optional(),
        location: z.string().max(100).optional(),
        linkedin: z.string().url().optional().or(z.literal("")),
        github: z.string().url().optional().or(z.literal("")),
        website: z.string().url().optional().or(z.literal("")),
      })
      .optional(),
    summary: z.string().max(1000).optional(),
    experience: z.array(ExperienceSchema).optional(),
    education: z.array(EducationSchema).optional(),
    skills: z.array(z.string()).optional(),
    projects: z.array(ProjectSchema).optional(),
    certifications: z.array(CertificationSchema).optional(),
  }),
  chatId: z.string().uuid(),
  userApiKey: z.string().optional(),
});

// ATS Analyzer validation
export const ATSRequestSchema = z.object({
  resumeContent: z.string().min(10).max(50000),
  jobDescription: z.string().min(10).max(50000),
  jobTitle: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  resumeId: z.string().uuid().optional(),
});

// PDF Generation validation
export const PDFRequestSchema = z.object({
  data: z.object({
    name: z.string().min(1).max(100),
    title: z.string().max(100).optional(),
    contact: z
      .object({
        email: z.string().optional(),
        phone: z.string().optional(),
        location: z.string().optional(),
        linkedin: z.string().optional(),
        github: z.string().optional(),
        website: z.string().optional(),
      })
      .optional(),
    summary: z.string().optional(),
    experience: z.array(ExperienceSchema).optional(),
    education: z.array(EducationSchema).optional(),
    skills: z.array(z.string()).optional(),
    projects: z.array(ProjectSchema).optional(),
    certifications: z.array(CertificationSchema).optional(),
  }),
  template: z.enum(["classic", "modern", "minimal"]).optional(),
});

// Cover Letter validation
export const CoverLetterRequestSchema = z.object({
  resumeData: z.object({
    name: z.string().min(1).max(100),
    experience: z.array(ExperienceSchema).optional(),
    skills: z.array(z.string()).optional(),
  }),
  jobDescription: z.string().min(10).max(50000),
  jobTitle: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
  userApiKey: z.string().optional(),
});

// Interview Chat validation
export const InterviewChatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        content: z.string().min(1).max(10000),
      })
    )
    .min(1)
    .max(100),
  resumeText: z.string().max(50000).optional(),
  jobDescription: z.string().max(50000).optional(),
  userApiKey: z.string().optional(),
});

// Validate Gemini Key validation
export const ValidateKeyRequestSchema = z.object({
  apiKey: z.string().min(1),
});

// API Key validation
export const ApiKeySchema = z
  .string()
  .min(20, "API key too short")
  .max(500, "API key too long")
  .regex(/^[A-Za-z0-9_-]+$/, "Invalid API key format");

/**
 * Validation result types for proper TypeScript narrowing
 */
export type ValidationSuccess<T> = { success: true; data: T; error?: never };
export type ValidationError = { success: false; error: string; data?: never };
export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

/**
 * Helper function to validate requests and return typed errors
 *
 * @example
 * const validation = validateRequest(ChatRequestSchema, data);
 * if (!validation.success) {
 *   return NextResponse.json({ error: validation.error }, { status: 400 });
 * }
 * // validation.data is now typed!
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: `${firstError.path.join(".")}: ${firstError.message}`,
      };
    }
    return { success: false, error: "Validation failed" };
  }
}
