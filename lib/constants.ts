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
  INTERVIEW: "/api/interview/chat",
  VALIDATE_KEY: "/api/validate-gemini-key",
  HEALTH: "/api/health",
  PARSE_RESUME: "/actions/parse-resume",
} as const;

export const EXTERNAL_APIS = {
  CARTESIA_TTS: "https://api.cartesia.ai/tts/bytes",
} as const;

export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  PDF_GENERATION: 60000, // 60 seconds
  AI_RESPONSE: 45000, // 45 seconds
} as const;

export const AI_MODELS = {
  GEMINI_FLASH: "gemini-3-flash-preview",
} as const;

export const LIMITS = {
  MAX_RESUME_SIZE: 100000, // 100KB
  MAX_MESSAGE_LENGTH: 10000, // 10K characters
  MAX_HISTORY_LENGTH: 100, // 100 messages
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_JOB_DESCRIPTION_LENGTH: 50000, // 50K characters
} as const;

export const STORAGE_KEYS = {
  GEMINI_API_KEY: "gemini-api-key",
  CARTESIA_API_KEY: "cartesia-api-key",
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
