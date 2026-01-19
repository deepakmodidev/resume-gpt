import { z } from "zod";

/**
 * Zod validation schemas for API requests
 * Prevents invalid data from reaching API routes
 */

// Experience schema - all fields optional for incremental building
export const ExperienceSchema = z.object({
  title: z.string().max(200).optional().default(""),
  company: z.string().max(200).optional().default(""),
  location: z.string().max(200).optional().default(""),
  period: z.string().max(100).optional().default(""),
  description: z.string().max(5000).optional().default(""),
});

// Education schema - all fields optional for incremental building
export const EducationSchema = z.object({
  degree: z.string().max(200).optional().default(""),
  institution: z.string().max(200).optional().default(""),
  year: z.string().max(50).optional().default(""),
});

// Project schema - all fields optional for incremental building
export const ProjectSchema = z.object({
  name: z.string().max(200).optional().default(""),
  description: z.string().max(2000).optional().default(""),
  techStack: z.array(z.string()).optional().default([]),
});

// Certification schema - all fields optional for incremental building
export const CertificationSchema = z.object({
  name: z.string().max(200).optional().default(""),
  issuer: z.string().max(200).optional().default(""),
  date: z.string().max(50).optional().default(""),
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
    name: z.string().max(200).optional().default(""),
    title: z.string().max(200).optional().default(""),
    contact: z
      .object({
        email: z.string().max(100).optional().default(""),
        phone: z.string().max(30).optional().default(""),
        location: z.string().max(200).optional().default(""),
        linkedin: z.string().max(200).optional().default(""),
        github: z.string().max(200).optional().default(""),
        website: z.string().max(200).optional().default(""),
      })
      .optional()
      .default({
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        website: "",
      }),
    summary: z.string().max(2000).optional().default(""),
    experience: z.array(ExperienceSchema).optional().default([]),
    education: z.array(EducationSchema).optional().default([]),
    skills: z.array(z.string()).optional().default([]),
    projects: z.array(ProjectSchema).optional().default([]),
    certifications: z.array(CertificationSchema).optional().default([]),
  }),
  chatId: z.string().uuid(),
  userApiKey: z.string().optional().nullable(),
});

// ATS Analyzer validation
export const ATSRequestSchema = z.object({
  resumeContent: z.string().min(10, "Resume content is required").max(50000),
  jobDescription: z.string().min(10, "Job description is required").max(50000),
  jobTitle: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  resumeId: z.string().uuid().optional(),
});

// PDF Generation validation - name can be empty, will use default
export const PDFRequestSchema = z.object({
  data: z.object({
    name: z.string().max(200).optional().default("Resume"),
    title: z.string().max(200).optional().default(""),
    contact: z
      .object({
        email: z.string().max(100).optional().default(""),
        phone: z.string().max(30).optional().default(""),
        location: z.string().max(200).optional().default(""),
        linkedin: z.string().max(200).optional().default(""),
        github: z.string().max(200).optional().default(""),
        website: z.string().max(200).optional().default(""),
      })
      .optional()
      .default({
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        website: "",
      }),
    summary: z.string().max(2000).optional().default(""),
    experience: z.array(ExperienceSchema).optional().default([]),
    education: z.array(EducationSchema).optional().default([]),
    skills: z.array(z.string()).optional().default([]),
    projects: z.array(ProjectSchema).optional().default([]),
    certifications: z.array(CertificationSchema).optional().default([]),
  }),
  template: z.enum(["classic", "modern", "minimal"]).optional().default("classic"),
});

// Cover Letter validation - flexible for various input formats
export const CoverLetterRequestSchema = z.object({
  resumeData: z.object({
    name: z.string().max(200).optional().default(""),
    experience: z.array(ExperienceSchema).optional().default([]),
    skills: z.array(z.string()).optional().default([]),
    rawContent: z.string().max(50000).optional(), // For uploaded resume text
  }),
  jobDescription: z.string().max(50000).optional().default(""),
  jobTitle: z.string().max(200).optional().default(""),
  company: z.string().max(200).optional().default(""),
  userApiKey: z.string().optional().nullable(),
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
  userApiKey: z.string().optional().nullable(),
});

// Validate Gemini Key validation
export const ValidateKeyRequestSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
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
