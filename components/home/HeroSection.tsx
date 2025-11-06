"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, Target } from "lucide-react";
import { checkSession } from "@/actions/session-actions";
import { handleGoogleSignIn } from "@/actions/auth-actions";
import { ResumePreview } from "./ResumePreview";
import { DotPattern } from "@/components/ui/dot-pattern";

interface HeroSectionProps {
  chatId: string;
}

export function HeroSection({ chatId }: HeroSectionProps) {
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const router = useRouter();

  const handleGetStarted = async () => {
    try {
      setIsCheckingSession(true);
      const hasSession = await checkSession();

      if (hasSession) {
        router.push(`/builder/${chatId}`);
      } else {
        await handleGoogleSignIn();
      }
    } catch (error) {
      console.error("Error checking session:", error);
      await handleGoogleSignIn();
    } finally {
      setIsCheckingSession(false);
    }
  };
  return (
    <section className="relative pb-20 pt-12 overflow-hidden min-h-screen flex items-center">
      {/* Dot Pattern Background */}
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className="fill-blue-500/30 dark:fill-blue-400/30"
      />

      {/* Enhanced gradient orbs */}
      <div className="absolute top-0 left-1/4 w-160 h-160 bg-linear-to-r from-blue-500/10 to-blue-600/10 rounded-full blur-3xl animate-pulse"></div>

      <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative">
        {/* Upper Section - Text Content */}
        <div className="text-center space-y-8 mb-48">
          {/* Premium Badge */}
          {/* <div className="inline-flex items-center gap-3 bg-linear-to-r from-background/80 to-background/60 backdrop-blur-xl border border-border/50 rounded-2xl px-6 py-3 shadow-lg">
            <div className="w-2 h-2 bg-linear-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm font-semibold text-foreground/90">
              1000+ custom resumes generated so far.
            </span>
            <div className="w-2 h-2 bg-linear-to-r from-blue-500 to-blue-600 rounded-full animate-pulse delay-500"></div>
          </div> */}

          {/* Product Hunt Badge */}
          <div className="flex justify-center items-center gap-8 py-4">
            <a
              href="https://www.producthunt.com/products/resumegpt?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-resumegpt-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                // src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=998447&theme=light&t=1753679970261"
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=998447&theme=neutral&t=1753680271015"
                alt="ResumeGPT - AI-powered resume builder for fast, professional results. | Product Hunt"
                width={250}
                height={54}
                style={{ width: "250px", height: "44px" }}
                priority // Add this for above-the-fold content
              />
            </a>
            <a
              href="https://peerlist.io/deepakmodi/project/resumegpt"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="https://peerlist.io/images/Launch_Badge_Light.svg"
                alt="ResumeGPT Launch on Peerlist"
                className="block dark:hidden"
                width={200}
                height={44}
                style={{ width: "200px", height: "44px" }}
              />
              <Image
                src="https://peerlist.io/images/Launch_Badge_Dark.svg"
                alt="ResumeGPT Launch on Peerlist (Dark)"
                className="hidden dark:block"
                width={200}
                height={44}
                style={{ width: "200px", height: "44px" }}
              />
            </a>
          </div>
          {/* Main Headline with better spacing */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none">
              <span className="bg-linear-to-b from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent block pb-4">
                Automate Resume Tailoring
              </span>
              <span className="bg-linear-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent block">
                with Generative AI
              </span>
            </h1>
            <div className="h-1 w-24 bg-linear-to-r from-blue-400 to-blue-600 rounded-full mx-auto"></div>
          </div>

          {/* Enhanced Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground/90 leading-relaxed font-medium max-w-3xl mx-auto">
            Create world-class resumes with AI optimization, seamless export,
            and professional templates.
            <span className="text-foreground/80 font-semibold">
              {" "}
              Built for success.
            </span>
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button
              onClick={handleGetStarted}
              disabled={isCheckingSession}
              size="lg"
              className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-base md:text-xl px-8 py-4 md:px-12 md:py-6 h-auto rounded-xl md:rounded-2xl shadow-2xl transition-all duration-300"
            >
              {isCheckingSession ? (
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-4 h-4 md:w-5 md:h-5 border-2 md:border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm md:text-base">Loading...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-sm md:text-base">Build Resume</span>
                  <ArrowRight className="h-4 w-4 md:h-6 md:w-6" />
                </div>
              )}
            </Button>

            <Button
              onClick={() => router.push("/ats-analyzer")}
              variant="outline"
              size="lg"
              className="border-2 border-blue-500/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:bg-blue-50/80 dark:hover:bg-slate-800/80 font-bold text-base md:text-xl px-8 py-4 md:px-12 md:py-6 h-auto rounded-xl md:rounded-2xl shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-sm md:text-base text-blue-600 dark:text-blue-400">
                  Analyze ATS Score
                </span>
              </div>
            </Button>
          </div>

          {/* Enhanced Trust indicators */}
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground/80 font-medium">
              Trusted by professionals at leading companies
            </p>
            <div className="flex items-center justify-center gap-6 sm:gap-10 opacity-70">
              <div className="text-muted-foreground font-bold text-lg">
                Google
              </div>
              <div className="text-muted-foreground font-bold text-lg">
                Microsoft
              </div>
              <div className="text-muted-foreground font-bold text-lg">
                Amazon
              </div>
              <div className="text-muted-foreground font-bold text-lg">
                Meta
              </div>
              <div className="text-muted-foreground font-bold text-lg">
                Apple
              </div>
            </div>
          </div>
        </div>

        {/* Lower Section - Resume Preview */}
        <ResumePreview />
      </div>
    </section>
  );
}
