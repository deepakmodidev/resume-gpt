"use client";

import React from "react";
import VoiceInterview from "@/components/VoiceInterview";
import { Header } from "@/components/home/Header";

/**
 * 🎙️ AI Voice Interview Landing Page
 * Simplified layout matching the design system of other pages.
 */

export default function VoiceInterviewPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 container mx-auto px-4 overflow-hidden">
        <VoiceInterview />
      </main>
    </div>
  );
}
