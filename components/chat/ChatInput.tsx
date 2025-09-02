"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { ArrowUpFromLine } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isGenerating: boolean;
  inputValue?: string;
  onInputChange?: (value: string) => void;
}

export const ChatInput = ({
  onSendMessage,
  isGenerating,
  inputValue,
  onInputChange,
}: ChatInputProps) => {
  const [inputMessage, setInputMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use controlled input if inputValue and onInputChange are provided
  const currentValue = inputValue !== undefined ? inputValue : inputMessage;
  const handleValueChange = useCallback(
    (value: string) => {
      if (onInputChange) {
        onInputChange(value);
      } else {
        setInputMessage(value);
      }
    },
    [onInputChange],
  );

  // Auto-resize the textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = "80px";

      const scrollHeight = textareaRef.current.scrollHeight;
      // Set new height (clamped between min and max)
      const newHeight = Math.min(Math.max(scrollHeight, 80), 300);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [currentValue]);

  const handleSendMessage = useCallback(() => {
    if (!currentValue.trim() || isGenerating) return;
    onSendMessage(currentValue);
    handleValueChange("");
  }, [currentValue, isGenerating, onSendMessage, handleValueChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  const isInputDisabled = isGenerating || !currentValue.trim();

  return (
    <div className="p-2 bg-background border-t border-border shrink-0">
      <div className="max-w-3xl mx-auto">
        <div className="relative bg-muted rounded-xl border border-border">
          <textarea
            ref={textareaRef}
            placeholder="Paste your resume or describe what you want to improve..."
            className={[
              "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              "min-h-[80px] max-h-[300px] overflow-y-auto px-4 py-3 pr-12 bg-transparent text-foreground placeholder:text-muted-foreground border-0 resize-none focus:ring-0 rounded-xl text-sm",
            ].join(" ")}
            value={currentValue}
            onChange={(e) => handleValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="absolute bottom-6 right-3 flex items-center gap-2">
            <Button
              className="p-2 h-auto rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
              onClick={handleSendMessage}
              disabled={isInputDisabled}
              aria-label="Send message"
            >
              <ArrowUpFromLine className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
