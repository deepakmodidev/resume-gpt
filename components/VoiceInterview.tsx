"use client";

import React, { useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  BarVisualizer,
} from "@livekit/components-react";
import { Mic, FileUp, Loader2, Sparkles, AlertCircle, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * 🎙️ SIMPLIFIED VOICE INTERVIEW
 * Clean, card-based interface matching the application's design system.
 */

export default function VoiceInterview() {
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [roomData, setRoomData] = useState<{ token: string; url: string } | null>(null);

  // 1. Resume Extraction Logic
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF.");
      return;
    }

    setIsExtracting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/voice/resume-extract", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to parse PDF");
      const data = await res.json();
      setResumeText(data.text);
    } catch (err) {
      toast.error("Extraction failed.");
    } finally {
      setIsExtracting(false);
    }
  };

  const startSession = async () => {
    if (!resumeText) return;
    setSessionActive(true);
    try {
      const res = await fetch("/api/voice/token", {
        method: "POST",
        body: JSON.stringify({ resume: resumeText, room_config: {} }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setRoomData({ token: data.token, url: data.serverUrl });
    } catch (e) {
      toast.error("Connection failed.");
      setSessionActive(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <AnimatePresence mode="wait">
        {!sessionActive ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-slate-200 dark:border-slate-800 shadow-none bg-transparent">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold">AI Voice Interview</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className={`relative border border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-colors ${resumeText ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200' : 'bg-slate-50 dark:bg-slate-900 border-slate-200'}`}>
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    disabled={isExtracting}
                  />
                  {isExtracting ? (
                    <Loader2 className="animate-spin text-blue-500 w-6 h-6" />
                  ) : (
                    <div className="text-center">
                      <p className="font-medium text-sm">
                        {resumeText ? "Resume uploaded" : "Upload Resume (PDF)"}
                      </p>
                    </div>
                  )}
                </div>

                <Button 
                  size="lg" 
                  disabled={!resumeText || isExtracting} 
                  onClick={startSession} 
                  className="w-full font-bold"
                >
                  Start Interview
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
            <Card className="border-slate-200 dark:border-slate-800 shadow-none min-h-[400px] flex flex-col items-center justify-center relative">
              {!roomData ? (
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              ) : (
                <LiveKitRoom 
                  token={roomData.token} 
                  serverUrl={roomData.url} 
                  connect={true} 
                  audio={true} 
                  onDisconnected={() => {
                    setSessionActive(false);
                    setRoomData(null);
                  }}
                  className="flex flex-col items-center p-6 w-full gap-6"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                      <Mic className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-emerald-500">Live</p>
                    <BarVisualizer className="h-6 w-48 text-blue-500" />
                  </div>
                  
                  <VoiceAssistantControlBar />
                  <RoomAudioRenderer />
                </LiveKitRoom>
              )}

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSessionActive(false);
                  setRoomData(null);
                }} 
                className="absolute top-2 right-2 text-xs opacity-50 hover:opacity-100"
              >
                Exit
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
