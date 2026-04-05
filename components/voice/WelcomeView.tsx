"use client";

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Mic, Loader2 } from 'lucide-react';

interface WelcomeViewProps {
  onStart: () => void;
  onFileChange: (file: File) => void;
  isConnecting: boolean;
  selectedFile?: File | null;
  isResumeReady: boolean;
}

export function WelcomeView({ 
  onStart, 
  onFileChange, 
  isConnecting, 
  selectedFile,
  isResumeReady
}: WelcomeViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Button should be disabled if:
  // 1. No file selected
  // 2. File is currently being extracted (isConnecting is true in parent during extraction)
  // 3. Resume text is not yet ready/parsed
  const isStartDisabled = !selectedFile || isConnecting || !isResumeReady;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-12 p-12 bg-secondary/5 border border-border/20 rounded-[32px] backdrop-blur-sm shadow-xl animate-in fade-in zoom-in-95 duration-500">
      <div className="relative group">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_40px_rgba(31,213,249,0.1)] transition-transform duration-700 group-hover:scale-110">
          <Mic className="w-10 h-10 text-primary" />
        </div>
        <div className="absolute inset-0 rounded-full border border-primary/10 animate-ping opacity-30" />
      </div>

      <div className="text-center gap-4 max-w-md flex flex-col items-center">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text">
          AI Voice Interview
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Ready to practice? Upload your resume to give the AI agent more context about your experience.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept=".pdf"
          onChange={(e) => e.target.files?.[0] && onFileChange(e.target.files[0])}
        />

        <div className="flex items-center gap-4 w-full">
          <Button 
            variant="outline" 
            className="flex-1 h-12 border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors rounded-2xl"
            onClick={() => fileInputRef.current?.click()}
            disabled={isConnecting}
          >
            <Paperclip className="w-4 h-4 mr-2 text-primary/70" />
            <span className="truncate max-w-[150px] font-medium">
              {selectedFile ? selectedFile.name : "Attach Resume (PDF)"}
            </span>
          </Button>

          <Button 
            className="h-12 px-10 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform"
            onClick={onStart}
            disabled={isStartDisabled}
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Mic className="w-4 h-4 mr-2" />
            )}
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}


