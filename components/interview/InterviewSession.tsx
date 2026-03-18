"use client";
import { useState, useCallback, useEffect } from "react";
import { AudioVisualizer } from "./AudioVisualizer";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square, MessageSquare, X, Download, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Message {
  role: "user" | "model";
  content: string;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<"idle" | "listening" | "processing" | "speaking">("idle");
  const [showTranscript, setShowTranscript] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [volume, setVolume] = useState(0);

  const toggleMic = useCallback(() => {
    if (status === "listening") {
      setStatus("processing");
      setTimeout(() => {
        setMessages((prev) => [...prev, 
          { role: "user", content: "..." },
          { role: "model", content: "The AI interview functionality is currently under maintenance." }
        ]);
        setStatus("speaking");
        setTimeout(() => setStatus("idle"), 2000);
      }, 1000);
    } else {
      setStatus("listening");
    }
  }, [status]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    if (!hasInitialized && messages.length === 0) {
      setHasInitialized(true);
      setMessages([{ role: "model", content: "Hi! I'm Sarah. Let's start. Please introduce yourself briefly." }]);
      setStatus("speaking");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }, [hasInitialized, messages.length]);

  const exportTranscript = useCallback(() => {
    toast.success("Transcript downloaded!");
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white relative overflow-hidden">
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
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={exportTranscript} title="Download Transcript">
              <Download className="h-5 w-5 text-white/70 hover:text-white" />
            </Button>
          )}
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

        {/* AI Last Message in Idle/Speaking */}
        <AnimatePresence>
          {(status === "speaking" || status === "idle") && messages.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-32 max-w-2xl text-center px-6">
              <div className="inline-block bg-blue-500/20 backdrop-blur-sm rounded-lg px-4 py-2 mb-2">
                <p className="text-sm font-semibold text-blue-400 uppercase tracking-wider">AI Interviewer:</p>
              </div>
              <p className="text-lg md:text-xl font-medium text-cyan-200/90 leading-relaxed mt-2">
                {messages[messages.length - 1].role === "model" ? messages[messages.length - 1].content : "..."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="p-8 flex items-center justify-center gap-6 z-10">
        <Button
          size="lg"
          className={`rounded-full h-20 w-20 shadow-2xl transition-all duration-300 ${
            status === "listening" ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-white text-black hover:bg-gray-200"
          }`}
          onClick={toggleMic}
          disabled={status === "processing"}
        >
          {status === "listening" ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
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
                  <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <span className={`text-xs font-semibold mb-1 px-2 ${msg.role === "user" ? "text-cyan-400" : "text-blue-400"}`}>
                      {msg.role === "user" ? "You" : "AI Interviewer"}
                    </span>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-cyan-600 text-white" : "bg-gray-800 text-gray-200"}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

