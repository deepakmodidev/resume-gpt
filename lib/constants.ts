/**
 * Centralized constants to eliminate magic strings and numbers
 * Usage: import { API_ENDPOINTS, LIMITS } from "@/lib/constants"
 */

export const API_ENDPOINTS = {
  CHAT: "/api/chat",
  ATS: "/api/ats",
  COVER_LETTER: "/api/cover-letter/generate",
  COVER_LETTER_PDF: "/api/generate-cover-letter-pdf",
  PDF: "/api/generate-pdf",
  VALIDATE_KEY: "/api/validate-key",
  HEALTH: "/api/health",
  PARSE_RESUME: "/actions/parse-resume",
} as const;

export const EXTERNAL_APIS = {} as const;

export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  PDF_GENERATION: 60000, // 60 seconds
  AI_RESPONSE: 45000, // 45 seconds
} as const;

export const AI_MODELS = {
  GROQ_PRIMARY: "meta-llama/llama-4-scout-17b-16e-instruct",
} as const;

export const AI_GENERATION_CONFIGS = {
  RESUME_CHAT: {
    temperature: 0.1, // Groq works better with low temperature for JSON
    maxOutputTokens: 2048,
    responseMimeType: "application/json",
  },
  COVER_LETTER: {
    temperature: 0.7,
    topP: 0.9,
    maxOutputTokens: 2048,
  },
} as const;

export const LIMITS = {
  MAX_RESUME_SIZE: 100000, // 100KB
  MAX_MESSAGE_LENGTH: 10000, // 10K characters
  MAX_HISTORY_LENGTH: 100, // 100 messages
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_JOB_DESCRIPTION_LENGTH: 50000, // 50K characters
} as const;

export const SESSION_CONFIG = {
  MAX_AGE: 30 * 24 * 60 * 60, // 30 days in seconds
} as const;

export const STORAGE_KEYS = {

  GROQ_API_KEY: "groq-api-key",
  SIDEBAR_COLLAPSED: "sidebar-collapsed",
  GENAI_DISMISSED: "genai-notification-dismissed",
  RESUME_TEMPLATE: "resume-template",
  COVER_LETTER_TEMPLATE: "cover-letter-template",
  API_KEY_NOTIFICATION_DISMISSED: "api-key-notification-dismissed",
} as const;

export const TEMPLATE_TYPES = {
  CLASSIC: "classic",
  MODERN: "modern",
  MINIMAL: "minimal",
} as const;
