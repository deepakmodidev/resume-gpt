"use client";

import React, { useRef, useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Mic,
  ArrowRight,
  FileText,
  Loader2,
  Upload,
  Lock
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { WelcomeViewProps } from '@/types/voice';

export function WelcomeView({
  onStart,
  onFileChange,
  isConnecting,
  isExtracting = false,
  selectedFile,
  isResumeReady,
  resumeText,
  setResumeText,
  jdText,
  setJdText,
  isAuthenticated
}: WelcomeViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeTab, setResumeTab] = useState<"upload" | "paste">("upload");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileChange(file);
    e.target.value = ""; // Reset input
  };

  return (
    <div className="w-full flex items-center justify-center">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12">

        {/* Left Side: Pitch */}
        <div className="space-y-6 flex flex-col justify-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Ace Your Next <br />
              <span className="text-blue-600 dark:text-blue-400">
                Interview
              </span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Practice with an AI recruiter that speaks, listens, and adapts to
              your specific job role. Prepare for behavioral and technical
              questions in a realistic voice environment.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: FileText, title: "Context-Aware", desc: "Tailored questions based on your resume", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30" },
              { icon: Mic, title: "Voice Interaction", desc: "Speak naturally, no typing required", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border">
                <div className={cn(feature.bg, "p-3 rounded-full")}>
                  <feature.icon className={cn("h-6 w-6", feature.color)} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <Card className="border-2 relative overflow-hidden bg-card">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-2xl">Setup Interview Context</CardTitle>
            <CardDescription className="text-base">
              Provide your details so the AI can simulate a relevant interview.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {/* Resume Section with Tabs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  1. Resume Context
                </Label>
                <div className="flex bg-muted/50 p-1 rounded-lg">
                  <button
                    onClick={() => setResumeTab("upload")}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md",
                      resumeTab === "upload"
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Upload
                  </button>
                  <button
                    onClick={() => setResumeTab("paste")}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md",
                      resumeTab === "paste"
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Paste Text
                  </button>
                </div>
              </div>

              <div className="min-h-[8px]">
                {resumeTab === "upload" ? (
                  <div className="relative group h-full">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="resume-upload"
                      ref={fileInputRef}
                      disabled={isConnecting}
                    />
                    <label
                      htmlFor="resume-upload"
                      className={cn(
                        "flex flex-row items-center justify-start gap-4 px-4 h-full min-h-[80px] border-2 border-dashed rounded-xl",
                        isConnecting
                          ? "cursor-not-allowed opacity-50 bg-muted/50 border-muted-foreground/25"
                          : selectedFile
                            ? "border-green-500/50 bg-green-50/50 dark:bg-green-900/10 cursor-pointer hover:bg-green-100/50 dark:hover:bg-green-900/20"
                            : "border-muted-foreground/25 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:border-blue-500/50"
                      )}
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                          <span className="text-sm font-medium text-muted-foreground">
                            Processing Resume...
                          </span>
                        </>
                      ) : selectedFile ? (
                        <>
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {selectedFile.name}
                            </p>
                            <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                              Ready for interview
                            </p>
                          </div>
                          <div className="bg-background/50 p-1.5 rounded-md text-xs text-muted-foreground border">
                            Replace
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Upload className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-foreground">
                              Click to Upload
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              PDF (Max 5MB)
                            </p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <Textarea
                    id="resume"
                    placeholder="Paste your full resume content here..."
                    className="h-full min-h-[80px] resize-none text-sm bg-muted/30 focus:bg-background transition-colors"
                    value={resumeText}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      setResumeText(e.target.value)
                    }
                  />
                )}
              </div>
            </div>

            {/* Job Description Section */}
            <div className="space-y-2">
              <Label
                htmlFor="jd"
                className="block mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                2. Job Description (Optional)
              </Label>
              <Textarea
                id="jd"
                placeholder="Paste the job description..."
                className="min-h-[80px] h-[80px] resize-none text-sm bg-muted/30 focus:bg-background transition-colors"
                value={jdText}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setJdText(e.target.value)
                }
              />
            </div>

            <div className="space-y-3">
              <Button
                className="w-full text-lg font-semibold gap-2 transition-colors py-6"
                onClick={onStart}
                disabled={(!resumeText.trim() && !isResumeReady) || isConnecting}
              >
                Start Interview
                {isConnecting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isAuthenticated ? (
                  <ArrowRight className="h-5 w-5" />
                ) : (
                  <Lock className="h-5 w-5 opacity-80" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


