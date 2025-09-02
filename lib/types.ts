// libs/types.ts

export interface ChatMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export interface InitialChatData {
  messages: ChatMessage[];
  resumeData: Record<string, unknown>;
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
