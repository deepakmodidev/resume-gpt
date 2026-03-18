"use client";
import { useState, useCallback, useEffect } from "react";
import { 
  LiveKitRoom, 
  RoomAudioRenderer, 
  VoiceAssistantControlBar, 
  useRoomContext,
  useVoiceAssistant,
  useTranscriptions,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import { AudioVisualizer } from "./AudioVisualizer";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, MessageSquare, X, Download, Clock, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TranscriptMessage {
  id: string;
  name: string;
  text: string;
  isAgent: boolean;
  timestamp: number;
}

interface InterviewSessionProps {
  resumeText: string;
  jobDescription: string;
  onEnd: () => void;
}

export const InterviewSession = ({
  resumeText,
  jobDescription,
  onEnd,
}: InterviewSessionProps) => {
  const [token, setToken] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch LiveKit access token on mount
  useEffect(() => {
    let mounted = true;

    async function getToken() {
      try {
        const response = await fetch("/api/room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText, jobDescription }),
        });

        if (!response.ok) {
          throw new Error("Failed to authenticate with interview server");
        }

        const data = await response.json();
        
        if (mounted) {
          setToken(data.token);
          setUrl(data.url);
        }
      } catch (e: any) {
        if (mounted) {
          setError(e.message);
          toast.error("Could not connect to the interview room.");
        }
      }
    }

    getToken();

    return () => {
      mounted = false;
    };
  }, [resumeText, jobDescription]);

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-black text-white items-center justify-center p-4">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={onEnd} variant="secondary">Go Back</Button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col h-screen bg-black text-white items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-white/70 animate-pulse">Connecting to your interviewer...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={url}
      connect={true}
      audio={true}
      video={false}
      onDisconnected={onEnd}
      className="flex flex-col h-screen bg-black text-white relative overflow-hidden"
    >
      <InterviewRoomUI onEnd={onEnd} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
};


// Separated UI component that has access to LiveKit room context
function InterviewRoomUI({ onEnd }: { onEnd: () => void }) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const room = useRoomContext();
  const { state, audioTrack } = useVoiceAssistant();

  // Gather all transcriptions in the room
  const transcriptions = useTranscriptions();

  // Simple timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const exportTranscript = useCallback(() => {
    toast.success("Transcript downloading will be added soon!");
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Convert livekit agent state conceptually to our old visualizer states
  const visualizerMode = state === "speaking" ? "speaking" 
                       : state === "listening" ? "listening" 
                       : state === "thinking" ? "processing"
                       : "idle";

  return (
    <>
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="text-white/70 hover:text-white" onClick={() => setShowEndDialog(true)}>
            <X className="mr-2 h-5 w-5" /> End Interview
          </Button>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <Clock className="h-4 w-4 text-white/70" />
            <span className="text-sm font-mono text-white/90">{formatTime(elapsedTime)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowTranscript(!showTranscript)} title="Toggle Transcript">
            <MessageSquare className={`h-5 w-5 ${showTranscript ? "text-cyan-400" : "text-white/70"}`} />
          </Button>
        </div>
      </div>

      {/* End Confirmation Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>End Interview?</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to end this interview session? Your progress will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800" onClick={() => setShowEndDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => {
              room.disconnect();
              onEnd();
            }}>
              End Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Visualizer Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <AudioVisualizer mode={visualizerMode} volume={0} />

        {/* Status Indicator */}
        <div className="absolute top-24 text-center">
          <p className="text-sm uppercase tracking-wider text-white/60 font-semibold">
            {state === "disconnected" && "Agent Disconnected"}
            {state === "initializing" && "Agent Connecting..."}
            {state === "listening" && "🎤 Listening..."}
            {state === "thinking" && "⚙️ Processing..."}
            {state === "speaking" && "🗣️ Speaking..."}
            {state === "idle" && "Ready"}
          </p>
        </div>
      </div>

      {/* Bottom Controls (Using LiveKit native component) */}
      <div className="w-full flex items-center justify-center p-8 z-10">
        <VoiceAssistantControlBar controls={{ leave: false }} />
      </div>

      {/* Sidebar Live Transcript */}
      <AnimatePresence>
        {showTranscript && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="absolute right-0 top-16 bottom-0 w-80 md:w-96 bg-gray-900/95 border-l border-white/10 backdrop-blur-xl z-20 flex flex-col"
          >
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white/90 font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Live Transcript
              </h3>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {transcriptions.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center mt-20">
                    <p className="text-white/40 text-sm">Waiting for someone to speak...</p>
                  </div>
                ) : (
                  transcriptions.map((segment: any) => {
                    const isAgent = !segment.participant?.isLocal;
                    return (
                      <div key={segment.id} className={`flex flex-col ${!isAgent ? "items-end" : "items-start"}`}>
                        <span className={`text-xs font-semibold mb-1 px-2 ${!isAgent ? "text-cyan-400" : "text-blue-400"}`}>
                          {!isAgent ? "You" : "AI Interviewer"}
                        </span>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                          !isAgent ? "bg-cyan-600/90 text-white" : "bg-gray-800/90 text-gray-200"
                        }`}>
                          {segment.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
