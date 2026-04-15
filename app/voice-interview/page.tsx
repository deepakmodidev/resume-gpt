"use client";

import { useSession as useLiveKitSession, SessionProvider, useAgent } from "@livekit/components-react";
import { useSession as useAuthSession, signIn } from "next-auth/react";
import { TokenSource } from "livekit-client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Header } from "@/components/home/Header";
import { WelcomeView } from "@/components/voice/WelcomeView";
import { SessionView } from "@/components/voice/SessionView";
import { parseResume } from "@/app/actions/parse-resume";

/**
 * 🎙️ AI Voice Interview - Unified Landing Page
 */
export default function VoiceInterviewPage() {
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [jdText, setJdText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 1. Resume Extraction Logic
  const handleFileChange = useCallback(async (file: File) => {
    setSelectedFile(file);
    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { text, error } = await parseResume(formData);
      if (error) throw new Error(error);
      setResumeText(text);
      toast.success("Resume attached successfully!");
    } catch (err) {
      console.error("❌ Extraction Error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to extract resume text.");
      setSelectedFile(null);
    } finally {
      setIsExtracting(false);
    }
  }, []);

  // 2. Token Source for useSession
  const tokenSource = useMemo(() => {
    return TokenSource.custom(async () => {
      const res = await fetch("/api/voice/token", {
        method: "POST",
        body: JSON.stringify({ resume: resumeText || "", jd: jdText, room_config: {} }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch token");
      return res.json();
    });
  }, [resumeText, jdText]);

  const session = useLiveKitSession(tokenSource);
  const { status } = useAuthSession();
  const isAuthenticated = status === "authenticated";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 container mx-auto px-4 overflow-hidden">
        <SessionProvider session={session}>
          <VoiceInterviewContent
            session={session}
            isExtracting={isExtracting}
            selectedFile={selectedFile}
            resumeText={resumeText}
            setResumeText={setResumeText}
            jdText={jdText}
            setJdText={setJdText}
            onFileChange={handleFileChange}
            isAuthenticated={isAuthenticated}
          />
        </SessionProvider>
      </main>
    </div>
  );
}

/**
 * 🛰️ Internal component to handle transition from Welcome -> Session
 * Only switches when the AGENT is actually detected in the room.
 */
function VoiceInterviewContent({
  session, isExtracting, selectedFile, resumeText, setResumeText, jdText, setJdText, onFileChange, isAuthenticated
}: any) {
  const { isConnected: isInterviewerReady, state: agentState } = useAgent();
  const [isTimedOut, setIsTimedOut] = useState(false);

  // Connection timeout: 12 seconds to find an agent
  useEffect(() => {
    if (session.connectionState === 'connected' && !isInterviewerReady) {
      const timeout = setTimeout(() => {
        setIsTimedOut(true);
        toast.error("Interviewer process not detected. Check your terminal.");
        session.leave();
      }, 15000);
      return () => clearTimeout(timeout);
    }
  }, [session.connectionState, isInterviewerReady, session]);

  // View Switching Logic: Stay in WelcomeView until agent is TRULY READY
  // The button should only spin if we are NOT timed out and still waiting
  const isTransitioning = (session.connectionState !== 'disconnected' && !isInterviewerReady && !isTimedOut);

  if (!isInterviewerReady) {
    return (
      <div key="welcome" className="opacity-100 transition-all duration-500 transform-gpu w-full max-w-7xl mx-auto px-4">
        <WelcomeView
          onStart={() => {
            if (!isAuthenticated) {
              toast.info("Please sign in to start the interview.");
              signIn("google", { callbackUrl: window.location.href });
              return;
            }
            setIsTimedOut(false); // Reset timeout on new attempt
            session.start();
          }}
          onFileChange={onFileChange}
          isExtracting={isExtracting}
          isConnecting={isTransitioning}
          selectedFile={selectedFile}
          isResumeReady={!!resumeText}
          resumeText={resumeText || ""}
          setResumeText={setResumeText}
          jdText={jdText}
          setJdText={setJdText}
          isAuthenticated={isAuthenticated}
        />
      </div>
    );
  }

  return (
    <div key="session" className="w-full max-w-7xl mx-auto px-4 opacity-100 transition-all duration-500 transform-gpu animate-in fade-in slide-in-from-bottom-4">
      <SessionView />
    </div>
  );
}
