"use client";
import { logger } from "@/lib/logger";

import { useState, useEffect, useCallback, useRef } from "react";
import { AudioVisualizer } from "./AudioVisualizer";
import { useSpeech } from "@/hooks/useSpeech";
import { useCartesiaTTS } from "@/hooks/useCartesiaTTS";
import { Button } from "@/components/ui/button";
import { STORAGE_KEYS, API_ENDPOINTS } from "@/lib/constants";
import { apiRequest } from "@/lib/api-client";
import {
  Mic,
  MicOff,
  Square,
  MessageSquare,
  X,
  Download,
  Clock,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Message {
  role: "user" | "model";
  content: string;
}

interface InterviewSessionProps {
  resumeText: string;
  jobDescription: string;
  onEnd: () => void;
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const InterviewSession = ({
  resumeText,
  jobDescription,
  onEnd,
}: InterviewSessionProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<
    "idle" | "listening" | "processing" | "speaking"
  >("idle");
  const [showTranscript, setShowTranscript] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Speech Recognition (for listening)
  const {
    isListening,
    transcript,
    volume,
    isSupported,
    error: speechError,
    startListening,
    stopListening,
    getFinalTranscript,
  } = useSpeech({
    onSpeechStart: () => setStatus("listening"),
    onSpeechEnd: (text) => {
      // Auto-send when speech ends
      if (text.trim()) {
        handleSendResponse(text);
      }
    },
    onError: (e) => {
      logger.error("Speech Error", e);
      setStatus("idle");
    },
  });

  // Cartesia TTS (for speaking) - Ultra-fast!
  const {
    speak: cartesiaSpeak,
    stop: cartesiaStop,
    isSpeaking: cartesiaIsSpeaking,
    isInitialized: cartesiaInitialized,
    error: cartesiaError,
  } = useCartesiaTTS({
    onStart: () => {
      logger.debug("🔊 Cartesia started speaking");
    },
    onEnd: () => {
      logger.debug("✅ Cartesia finished speaking");
      setStatus("idle");
      // Auto-start listening after AI speaks
      setTimeout(() => startListening(), 1000);
    },
    onError: (error) => logger.error("Cartesia error:", error),
  });

  // Use Cartesia if available, fallback to browser TTS
  const speak = cartesiaInitialized
    ? cartesiaSpeak
    : () => {
        logger.warn("Cartesia not initialized");
      };
  const isSpeaking = cartesiaIsSpeaking;
  const cancelSpeech = cartesiaStop;

  const handleSendResponse = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setStatus("processing");
      setApiError(null);
      const newMessages = [
        ...messages,
        { role: "user" as const, content: text },
      ];
      setMessages(newMessages);

      try {
        const userApiKey = localStorage.getItem(STORAGE_KEYS.GEMINI_API_KEY);

        const data = await apiRequest<{ response: string }>(
          API_ENDPOINTS.INTERVIEW,
          {
            method: "POST",
            body: JSON.stringify({
              messages: newMessages,
              resumeText: messages.length === 0 ? resumeText : undefined,
              jobDescription:
                messages.length === 0 ? jobDescription : undefined,
              userApiKey,
            }),
          }
        );

        const aiText = data.response;
        setMessages([...newMessages, { role: "model", content: aiText }]);
        setStatus("speaking");

        speak(aiText, () => {
          setStatus("idle");
          // Auto-start listening for continuous conversation
          setTimeout(() => {
            if (status !== "speaking") {
              startListening();
            }
          }, 500);
        });
      } catch (error) {
        logger.error("Interview Error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to get response. Please try again.";
        setApiError(errorMessage);
        setStatus("idle");

        // Add error message to chat
        setMessages([
          ...newMessages,
          {
            role: "model",
            content: `I apologize, but I encountered an error: ${errorMessage}. Please try speaking again.`,
          },
        ]);
      }
    },
    [messages, resumeText, jobDescription, speak, startListening, status]
  );

  const toggleMic = useCallback(() => {
    if (status === "listening") {
      logger.debug("🛑 Stopping listening, transcript:", transcript);
      stopListening();
      // Use current transcript state
      if (transcript && transcript.trim()) {
        logger.debug("📤 Sending transcript:", transcript);
        handleSendResponse(transcript);
      } else {
        logger.debug("⚠️ No transcript to send");
        setStatus("idle");
        toast.error("No speech detected. Please try speaking again.");
      }
    } else {
      if (status === "speaking") {
        logger.debug("⏹️ Canceling speech");
        cancelSpeech();
      }
      logger.debug("▶️ Starting listening");
      startListening();
      setStatus("listening");
    }
  }, [
    status,
    stopListening,
    transcript,
    handleSendResponse,
    cancelSpeech,
    startListening,
  ]);

  // Timer for elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Extract candidate name from resume
  const extractName = useCallback((text: string): string | null => {
    // Try to extract name from common patterns
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length === 0) return null;

    // First non-empty line is often the name
    const firstLine = lines[0].trim();

    // Check if it looks like a name (not too long, no special chars)
    if (
      firstLine.length > 2 &&
      firstLine.length < 50 &&
      !/[@#$%^&*()_+=\[\]{}|\\:;"'<>,.?\/]/.test(firstLine)
    ) {
      // Remove common titles
      const cleanName = firstLine
        .replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s*/i, "")
        .trim();

      // Check if it has at least 2 words (first and last name)
      const words = cleanName.split(/\s+/);
      if (words.length >= 2 && words.length <= 4) {
        return words.slice(0, 2).join(" "); // Return first two words
      }
    }

    return null;
  }, []);

  // Initial Welcome - Fixed with proper dependencies
  useEffect(() => {
    if (!hasInitialized && messages.length === 0) {
      setHasInitialized(true);

      const candidateName = extractName(resumeText);
      const greeting = candidateName
        ? `Hi ${candidateName}! I'm Sarah.`
        : "Hi! I'm Sarah.";

      const welcome = `${greeting} Let's start. Please introduce yourself briefly.`;

      logger.debug("👋 Welcome message:", welcome);
      setMessages([{ role: "model", content: welcome }]);
      setStatus("speaking");

      // Try to speak, but continue even if it fails
      speak(welcome, () => {
        logger.debug("✅ Welcome complete, starting to listen");
        setStatus("idle");
        // Auto-start listening after welcome
        setTimeout(() => {
          logger.debug("🎤 Auto-starting microphone");
          startListening();
        }, 1500);
      });
    }
  }, [
    hasInitialized,
    messages.length,
    speak,
    startListening,
    resumeText,
    extractName,
  ]);

  // Export transcript function
  const exportTranscript = useCallback(() => {
    const transcript = messages
      .map(
        (msg) =>
          `${msg.role === "user" ? "You" : "Interviewer"}: ${msg.content}`
      )
      .join("\n\n");

    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-transcript-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Transcript downloaded!");
  }, [messages]);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white relative overflow-hidden">
      {/* Browser Compatibility Warning */}
      {!isSupported && (
        <div className="absolute top-0 left-0 right-0 bg-red-600 text-white p-4 z-50 text-center">
          <p className="font-semibold">⚠️ Browser Not Supported</p>
          <p className="text-sm mt-1">
            Speech recognition is not available in your browser. Please use
            Chrome, Edge, or Safari for the best experience.
          </p>
        </div>
      )}

      {/* Error Banner */}
      {(speechError || apiError) && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-yellow-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg z-50 max-w-md text-center shadow-lg">
          <p className="text-sm font-medium">{speechError || apiError}</p>
          {speechError && speechError.includes("Text-to-speech") && (
            <p className="text-xs mt-1 opacity-90">
              The interview will continue. Read the AI responses on screen.
            </p>
          )}
        </div>
      )}

      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="text-white/70 hover:text-white"
            onClick={() => setShowEndDialog(true)}
          >
            <X className="mr-2 h-5 w-5" /> End Interview
          </Button>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <Clock className="h-4 w-4 text-white/70" />
            <span className="text-sm font-mono text-white/90">
              {formatTime(elapsedTime)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={exportTranscript}
              title="Download Transcript"
            >
              <Download className="h-5 w-5 text-white/70 hover:text-white" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowTranscript(!showTranscript)}
            title="Toggle Transcript"
          >
            <MessageSquare
              className={`h-5 w-5 ${showTranscript ? "text-cyan-400" : "text-white/70"}`}
            />
          </Button>
        </div>
      </div>

      {/* End Confirmation Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>End Interview?</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to end this interview session? Your progress
              will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={() => setShowEndDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={onEnd}>
              End Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Visualizer Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <AudioVisualizer mode={status} volume={volume} />

        {/* Status Indicator */}
        <div className="absolute top-24 text-center">
          <p className="text-sm uppercase tracking-wider text-white/60 font-semibold">
            {status === "idle" && "Ready to listen"}
            {status === "listening" && "🎤 Listening..."}
            {status === "processing" && "⚙️ Processing..."}
            {status === "speaking" && "🗣️ Speaking..."}
          </p>
        </div>

        {/* Live Transcript Overlay - You Speaking */}
        <AnimatePresence>
          {status === "listening" && !transcript && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-32 max-w-2xl text-center px-6"
            >
              <p className="text-lg text-white/60 italic">
                Speak now... (Click mic button when done)
              </p>
            </motion.div>
          )}
          {(status === "listening" || status === "processing") &&
            transcript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-32 max-w-2xl text-center px-6"
              >
                <div className="inline-block bg-green-500/20 backdrop-blur-sm rounded-lg px-4 py-2 mb-2">
                  <p className="text-sm font-semibold text-green-400 uppercase tracking-wider">
                    You:
                  </p>
                </div>
                <p className="text-xl md:text-2xl font-light text-white/90 leading-relaxed mt-2">
                  "{transcript}"
                </p>
              </motion.div>
            )}
        </AnimatePresence>

        {/* AI Last Message in Idle/Speaking */}
        <AnimatePresence>
          {(status === "speaking" || status === "idle") &&
            messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-32 max-w-2xl text-center px-6"
              >
                <div className="inline-block bg-blue-500/20 backdrop-blur-sm rounded-lg px-4 py-2 mb-2">
                  <p className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                    AI Interviewer:
                  </p>
                </div>
                <p className="text-lg md:text-xl font-medium text-cyan-200/90 leading-relaxed mt-2">
                  {messages[messages.length - 1].role === "model"
                    ? messages[messages.length - 1].content
                    : "..."}
                </p>
              </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="p-8 flex items-center justify-center gap-6 z-10">
        {/* Mute/Stop Button */}
        {status === "speaking" && (
          <Button
            size="lg"
            variant="outline"
            className="rounded-full h-16 w-16 border-red-500/50 hover:bg-red-950/30 text-red-500"
            onClick={() => {
              cancelSpeech();
              setStatus("idle");
            }}
          >
            <Square className="h-6 w-6 fill-current" />
          </Button>
        )}

        {/* Main Action Button */}
        <Button
          size="lg"
          className={`rounded-full h-20 w-20 shadow-2xl transition-all duration-300 ${
            status === "listening"
              ? "bg-red-600 hover:bg-red-700 animate-pulse"
              : "bg-white text-black hover:bg-gray-200"
          }`}
          onClick={toggleMic}
          disabled={status === "processing"}
        >
          {status === "listening" ? (
            <MicOff className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>
      </div>

      {/* Sidebar Transcript (Optional) */}
      <AnimatePresence>
        {showTranscript && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="absolute right-0 top-16 bottom-0 w-80 md:w-96 bg-gray-900/95 border-l border-white/10 backdrop-blur-xl z-20"
          >
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <span
                      className={`text-xs font-semibold mb-1 px-2 ${msg.role === "user" ? "text-cyan-400" : "text-blue-400"}`}
                    >
                      {msg.role === "user" ? "You" : "AI Interviewer"}
                    </span>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        msg.role === "user"
                          ? "bg-cyan-600 text-white"
                          : "bg-gray-800 text-gray-200"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {status === "listening" && transcript && (
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold mb-1 px-2 text-cyan-400">
                      You (speaking...)
                    </span>
                    <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-cyan-600/50 text-white/50 animate-pulse">
                      {transcript}...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
