import { UseSessionReturn } from "@livekit/components-react";

export interface WelcomeViewProps {
  onStart: () => void;
  onFileChange: (file: File) => void;
  isConnecting: boolean;
  isExtracting?: boolean;
  selectedFile?: File | null;
  isResumeReady: boolean;
  resumeText: string;
  setResumeText: (text: string) => void;
  jdText: string;
  setJdText: (text: string) => void;
}

export type SessionState = "idle" | "connecting" | "connected" | "disconnected" | "error";

export interface VoiceSessionMetadata {
  resumeText?: string;
  jdText?: string;
  timestamp: string;
}
