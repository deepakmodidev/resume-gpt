import { z } from "zod";

/**
 * Environment variable validation schema
 * Validates all required environment variables at runtime
 * Provides type-safe access to env vars throughout the app
 */

const envSchema = z.object({
  // Required
  DATABASE_URL: z.string().url("Invalid DATABASE_URL format"),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url("Invalid NEXTAUTH_URL format"),

  // Optional - API Keys
  GEMINI_KEY: z.string().min(1).optional(),
  CARTESIA_API_KEY: z.string().optional(),

  // Optional - Deployment Environment
  AWS_LAMBDA_FUNCTION_NAME: z.string().optional(),
  VERCEL: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment variables
 * Use this instead of process.env for type safety
 *
 * @example
 * import { env } from "@/lib/env";
 * const apiKey = env.GEMINI_KEY;
 */
let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Environment validation failed:");
    error.issues.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    });
    throw new Error("Invalid environment variables. Check the errors above.");
  }
  throw error;
}

export { env };
