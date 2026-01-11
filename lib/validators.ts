import { z } from "zod";

/**
 * Zod validation schemas for API requests
 * Lenient validation - just ensure basic types are correct
 */

// Chat API validation - very lenient for AI flexibility
export const ChatRequestSchema = z.object({
  history: z.array(z.any()),
  resumeData: z.any(), // Accept any data shape
  chatId: z.string(),
  userApiKey: z.any(), // Accept string, null, undefined
});

// ATS Analyzer validation - lenient
export const ATSRequestSchema = z.object({
  resumeContent: z.string().min(1),
  jobDescription: z.string().min(1),
  jobTitle: z.string().nullish(),
  company: z.string().nullish(),
  industry: z.string().nullish(),
  resumeId: z.string().nullish(),
});

// PDF Generation validation - lenient
export const PDFRequestSchema = z.object({
  data: z.any(), // Accept any resume data shape
  template: z.string().nullish(),
});

// Cover Letter validation - lenient
export const CoverLetterRequestSchema = z.object({
  resumeData: z.any(),
  resumeContent: z.string().nullish(),
  jobDescription: z.string().nullish(), // Optional - generalized letter if empty
  jobTitle: z.string().nullish(),
  company: z.string().nullish(),
  recipientName: z.string().nullish(),
  tone: z.string().nullish(),
  userApiKey: z.any(),
});

// Interview Chat validation - lenient
export const InterviewChatRequestSchema = z.object({
  messages: z.array(z.any()),
  resumeText: z.string().nullish(),
  jobDescription: z.string().nullish(),
  userApiKey: z.any(),
});

// Validate Gemini Key validation
export const ValidateKeyRequestSchema = z.object({
  apiKey: z.string().min(1),
});

// API Key validation (used by modal components)
export const ApiKeySchema = z.string().min(10);

/**
 * Validation result types for proper TypeScript narrowing
 */
export type ValidationSuccess<T> = { success: true; data: T; error?: never };
export type ValidationError = { success: false; error: string; data?: never };
export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

/**
 * Helper function to validate requests and return typed errors
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
