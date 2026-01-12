// libs/types.ts

export interface ChatMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export interface InitialChatData {
  messages: ChatMessage[] | unknown[];
  resumeData?: Record<string, unknown> | unknown;
}

export type ResumeData = {
  name: string;
  title: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    blogs?: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    period: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    techStack: string[];
  }>;
  achievements: string[];
};

export type TemplateOption = {
  id: string;
  name: string;
  preview: string;
};

export type ResumePreviewProps = {
  data: ResumeData;
  className?: string;
  onChange?: (data: ResumeData) => void;
};

// Cover Letter Types
export type CoverLetterData = {
  recipientName: string;
  recipientTitle?: string;
  companyName: string;
  companyAddress?: string;
  jobTitle: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  senderAddress?: string;
  date: string;
  greeting: string;
  opening: string;
  body: string;
  closing: string;
  signature: string;
};

export type CoverLetterGenerationInput = {
  resumeData: ResumeData;
  jobDescription: string;
  companyName: string;
  jobTitle: string;
  recipientName?: string;
  tone?: "professional" | "friendly" | "enthusiastic";
};

// ATS Analysis Types
export interface ATSAnalysisResult {
  scores: {
    overall: number;
    keyword: number;
    format: number;
    content: number;
    semantic: number;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  criticalMissingKeywords: string[];
  suggestions: string[];
  industryFit: number;
  readabilityScore: number;
  semanticSimilarity: number;
  keywordDensity: number;
}