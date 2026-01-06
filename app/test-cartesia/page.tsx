"use client";

import { useState } from "react";
import { useCartesiaTTS } from "@/hooks/useCartesiaTTS";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Volume2, Square } from "lucide-react";

export default function TestCartesiaPage() {
  const [text, setText] = useState(
    "Hello! This is a test of Cartesia's ultra-fast voice synthesis. How does it sound?",
  );
  const [status, setStatus] = useState("");

  const { speak, stop, isSpeaking, isInitialized, error } = useCartesiaTTS({
    onStart: () => setStatus("🔊 Speaking..."),
    onEnd: () => setStatus("✅ Finished!"),
    onError: (err) => setStatus(`❌ Error: ${err.message}`),
  });

  const handleSpeak = () => {
    speak(text);
  };

  const handleStop = () => {
    stop();
    setStatus("⏹️ Stopped");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/50 dark:to-purple-950/20 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">🎤 Cartesia Voice Test</h1>
          <p className="text-muted-foreground">
            Test ultra-fast voice synthesis
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Voice Settings</CardTitle>
            <CardDescription>
              {isInitialized ? (
                <span className="text-green-600 dark:text-green-400">
                  ✅ Cartesia Initialized
                </span>
              ) : error ? (
                <span className="text-red-600 dark:text-red-400">
                  ❌ {error}
                </span>
              ) : (
                <span className="text-yellow-600 dark:text-yellow-400">
                  ⏳ Initializing...
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Text to Speak:</label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to speak..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSpeak}
                disabled={!isInitialized || isSpeaking || !text.trim()}
                className="flex-1 gap-2"
                size="lg"
              >
                <Volume2 className="h-5 w-5" />
                {isSpeaking ? "Speaking..." : "Speak"}
              </Button>

              {isSpeaking && (
                <Button
                  onClick={handleStop}
                  variant="destructive"
                  size="lg"
                  className="gap-2"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              )}
            </div>

            {status && (
              <div className="p-3 bg-muted rounded-lg text-center font-medium">
                {status}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setText(
                  "Hello! I'm your AI interviewer. Let's begin the interview.",
                );
                setTimeout(
                  () =>
                    speak(
                      "Hello! I'm your AI interviewer. Let's begin the interview.",
                    ),
                  100,
                );
              }}
              disabled={!isInitialized || isSpeaking}
            >
              Test Interview Greeting
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setText(
                  "Can you tell me about your experience with React and TypeScript?",
                );
                setTimeout(
                  () =>
                    speak(
                      "Can you tell me about your experience with React and TypeScript?",
                    ),
                  100,
                );
              }}
              disabled={!isInitialized || isSpeaking}
            >
              Test Interview Question
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setText(
                  "That's great! Can you describe a challenging project you worked on?",
                );
                setTimeout(
                  () =>
                    speak(
                      "That's great! Can you describe a challenging project you worked on?",
                    ),
                  100,
                );
              }}
              disabled={!isInitialized || isSpeaking}
            >
              Test Follow-up Question
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                💡 Tips:
              </p>
              <ul className="space-y-1 text-blue-800 dark:text-blue-200 list-disc list-inside">
                <li>Make sure your Cartesia API key is configured</li>
                <li>Check your speakers/headphones are working</li>
                <li>Voice should start in &lt;200ms (instant!)</li>
                <li>Compare to browser TTS - much faster!</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="link" asChild>
            <a href="/interview">← Back to Interview</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
