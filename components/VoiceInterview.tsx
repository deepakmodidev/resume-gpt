"use client";

import React, { useState, useMemo } from "react";
import {
  useSession,
} from "@livekit/components-react";
import { TokenSource } from "livekit-client";
import { toast } from "sonner";
import { WelcomeView } from "./voice/WelcomeView";
import { SessionView } from "./voice/SessionView";
import { AgentSessionProvider } from "./voice/AgentSessionProvider";

/**
 * 🎙️ MODULAR VOICE INTERVIEW CONTROLLER
 * Orchestrates the transition between Welcome (Setup) and Session (Active Interview) views.
 * Cleanup Phase 2: Complete removal of framer-motion for native responsiveness.
 * Fix 1: Added AgentSessionProvider to resolve SessionContext error.
 */

export default function VoiceInterview() {
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 1. Resume Extraction Logic
  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setIsExtracting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/voice/resume-extract", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to parse PDF");
      const data = await res.json();
      setResumeText(data.text);
      toast.success("Resume attached successfully!");
    } catch (err) {
      toast.error("Failed to extract resume text.");
      setSelectedFile(null);
    } finally {
      setIsExtracting(false);
    }
  };

  // 2. Token Source for useSession - Matching Reference Architecture
  const tokenSource = useMemo(() => {
    return TokenSource.custom(async () => {
      const res = await fetch("/api/voice/token", {
        method: "POST",
        body: JSON.stringify({ resume: resumeText || "", room_config: {} }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch token");
      return res.json(); // Returning the object (ConnectionDetails) is required for AgentSession
    });
  }, [resumeText]);

  // 3. Official useSession hook
  const session = useSession(tokenSource);

  return (
    <AgentSessionProvider session={session}>
      <div className="w-full max-w-6xl mx-auto px-4">
        {/* View Switcher based on Connection State - Alignment with Reference */}
        {!session.isConnected ? (
          <div key="welcome" className="opacity-100 transition-all duration-500 transform-gpu">
            {session.connectionState !== 'disconnected' ? (
              // Show connecting overlay over Welcome or as full-screen
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-pulse">
                <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground text-xs font-bold tracking-[.2em] uppercase opacity-50">Establishing Secure Connection</p>
              </div>
            ) : (
              <WelcomeView 
                onStart={session.start}
                onFileChange={handleFileChange}
                isConnecting={isExtracting}
                selectedFile={selectedFile}
                isResumeReady={!!resumeText}
              />
            )}
          </div>
        ) : (
          <div key="session" className="w-full opacity-100 transition-all duration-500 transform-gpu">
            <SessionView />
          </div>
        )}
      </div>
    </AgentSessionProvider>
  );
}





