"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AudioVisualizer } from "./AudioVisualizer";
import { useSpeech } from "@/hooks/useSpeech";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square, MessageSquare, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

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

export const InterviewSession = ({ resumeText, jobDescription, onEnd }: InterviewSessionProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [status, setStatus] = useState<"idle" | "listening" | "processing" | "speaking">("idle");
    const [showTranscript, setShowTranscript] = useState(false);
    const [showEndDialog, setShowEndDialog] = useState(false);

    // Combine custom hook with local logic
    const { isListening, isSpeaking, transcript, volume, startListening, stopListening, speak, cancelSpeech } = useSpeech({
        onSpeechStart: () => setStatus("listening"),
        onError: (e) => {
            console.error("Speech Error", e);
            setStatus("idle");
        }
    });

    // Effect to handle transcript updates and silence detection
    // Since Web Speech API functionality varies, we'll use a manual "Done" button or timeout for now to be safe.
    // Actually, let's use a "Stop & Send" button for the user control.

    const handleSendResponse = async (text: string) => {
        if (!text.trim()) return;

        setStatus("processing");
        const newMessages = [...messages, { role: "user" as const, content: text }];
        setMessages(newMessages);

        try {
            const response = await fetch("/api/interview/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages,
                    resumeText,
                    jobDescription,
                    userApiKey: localStorage.getItem("gemini-api-key"),
                }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            const aiText = data.response;
            setMessages([...newMessages, { role: "model", content: aiText }]);
            setStatus("speaking");

            speak(aiText, () => {
                setStatus("idle");
                // Optionally auto-start listening again?
                // startListening(); // Uncomment for continuous mode
            });

        } catch (error) {
            console.error("Interview Error:", error);
            setStatus("idle");
        }
    };

    const toggleMic = () => {
        if (status === "listening") {
            stopListening();
            // Wait a tiny bit for final transcript update? 
            // Actually, useSpeech updates transcript state. 
            // We'll pass the current transcript to send.
            handleSendResponse(transcript);
        } else {
            if (status === "speaking") {
                cancelSpeech();
            }
            startListening();
            setStatus("listening");
        }
    };

    // Initial Welcome
    useEffect(() => {
        // Only run once on mount
        if (messages.length === 0) {
            const welcome = "Hello! I'm Sarah, your interviewer. I've reviewed your resume. Could you please start by introducing yourself?";
            setMessages([{ role: "model", content: welcome }]);
            setStatus("speaking");
            speak(welcome, () => setStatus("idle"));
        }
    }, []);

    return (
        <div className="flex flex-col h-screen bg-black text-white relative overflow-hidden">
            {/* Header Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
                <Button variant="ghost" className="text-white/70 hover:text-white" onClick={() => setShowEndDialog(true)}>
                    <X className="mr-2 h-5 w-5" /> End Interview
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowTranscript(!showTranscript)}>
                    <MessageSquare className={`h-5 w-5 ${showTranscript ? "text-cyan-400" : "text-white/70"}`} />
                </Button>
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

                {/* Live Transcript Overlay */}
                <AnimatePresence>
                    {(status === "listening" || status === "processing") && transcript && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-32 max-w-2xl text-center px-6"
                        >
                            <p className="text-xl md:text-2xl font-light text-white/90 leading-relaxed">
                                "{transcript}"
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* AI Last Message in Idle/Speaking */}
                <AnimatePresence>
                    {(status === "speaking" || status === "idle") && messages.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute bottom-32 max-w-2xl text-center px-6"
                        >
                            <p className="text-lg md:text-xl font-medium text-cyan-200/90 leading-relaxed">
                                {messages[messages.length - 1].role === 'model' ? messages[messages.length - 1].content : "..."}
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
                        onClick={() => { cancelSpeech(); setStatus("idle"); }}
                    >
                        <Square className="h-6 w-6 fill-current" />
                    </Button>
                )}

                {/* Main Action Button */}
                <Button
                    size="lg"
                    className={`rounded-full h-20 w-20 shadow-2xl transition-all duration-300 ${status === "listening"
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
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                                            ? 'bg-cyan-600 text-white'
                                            : 'bg-gray-800 text-gray-200'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {status === "listening" && transcript && (
                                    <div className="flex justify-end">
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
