"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Chrome, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BrowserInfo {
  isSupported: boolean;
  browser: string;
  hasWebSpeech: boolean;
  hasMicrophone: boolean;
  isMobile: boolean;
}

export const BrowserCompatibilityCheck = ({ onContinue }: { onContinue: () => void }) => {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo>({
    isSupported: true,
    browser: "Unknown",
    hasWebSpeech: false,
    hasMicrophone: false,
    isMobile: false,
  });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkCompatibility = async () => {
      const userAgent = navigator.userAgent;
      let browser = "Unknown";
      
      if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
        browser = "Chrome";
      } else if (userAgent.includes("Edg")) {
        browser = "Edge";
      } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
        browser = "Safari";
      } else if (userAgent.includes("Firefox")) {
        browser = "Firefox";
      }

      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      const hasWebSpeech = !!(
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition
      );

      let hasMicrophone = false;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        hasMicrophone = devices.some(device => device.kind === "audioinput");
      } catch (e) {
        console.error("Failed to check microphone:", e);
      }

      const isSupported = hasWebSpeech && hasMicrophone && !isMobile;

      setBrowserInfo({
        isSupported,
        browser,
        hasWebSpeech,
        hasMicrophone,
        isMobile,
      });
      setChecking(false);
    };

    checkCompatibility();
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-blue-50/50 dark:to-blue-950/20">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-muted-foreground">Checking browser compatibility...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!browserInfo.isSupported) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-blue-50/50 dark:to-blue-950/20 p-4">
        <Card className="w-full max-w-2xl border-red-200 dark:border-red-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <CardTitle className="text-red-600">Browser Compatibility Issues</CardTitle>
            </div>
            <CardDescription>
              Your current setup may not support all features of the AI Interview Practice.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Browser:</span>
                <span className={browserInfo.browser === "Firefox" ? "text-red-600" : "text-green-600"}>
                  {browserInfo.browser}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Speech Recognition:</span>
                <span className={browserInfo.hasWebSpeech ? "text-green-600" : "text-red-600"}>
                  {browserInfo.hasWebSpeech ? "✓ Supported" : "✗ Not Supported"}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Microphone:</span>
                <span className={browserInfo.hasMicrophone ? "text-green-600" : "text-red-600"}>
                  {browserInfo.hasMicrophone ? "✓ Detected" : "✗ Not Detected"}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Device Type:</span>
                <span className={browserInfo.isMobile ? "text-yellow-600" : "text-green-600"}>
                  {browserInfo.isMobile ? "⚠ Mobile (Limited Support)" : "✓ Desktop"}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-semibold text-blue-900 dark:text-blue-100">Recommended Setup:</p>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc">
                    <li>Use <strong>Google Chrome</strong>, <strong>Microsoft Edge</strong>, or <strong>Safari</strong></li>
                    <li>Use a <strong>desktop or laptop</strong> computer</li>
                    <li>Connect a <strong>working microphone</strong></li>
                    <li>Grant <strong>microphone permissions</strong> when prompted</li>
                    <li>Use a <strong>quiet environment</strong> for best results</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.location.href = "/"}
              >
                Go Back
              </Button>
              <Button
                className="flex-1"
                onClick={onContinue}
                variant={browserInfo.hasWebSpeech ? "default" : "destructive"}
              >
                {browserInfo.hasWebSpeech ? "Continue Anyway" : "Try Anyway (Not Recommended)"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All good - show success and continue
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-blue-50/50 dark:to-blue-950/20">
      <Card className="w-full max-w-md border-green-200 dark:border-green-900">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Chrome className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">All Systems Ready!</h3>
              <p className="text-muted-foreground">Your browser supports all required features.</p>
            </div>
            <Button onClick={onContinue} className="w-full mt-2">
              Start Interview Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

