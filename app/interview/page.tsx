"use client";

import { useState } from "react";
import { InterviewSetup } from "@/components/interview/InterviewSetup";
import { InterviewSession } from "@/components/interview/InterviewSession";
import { BrowserCompatibilityCheck } from "@/components/interview/BrowserCompatibilityCheck";
import { Header } from "@/components/home/Header";

export default function InterviewPage() {
    const [hasCheckedCompatibility, setHasCheckedCompatibility] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [resumeData, setResumeData] = useState({ text: "", jd: "" });

    const handleStart = (text: string, jd: string) => {
        setResumeData({ text, jd });
        setHasStarted(true);
    };

    const handleEnd = () => {
        setHasStarted(false);
        setResumeData({ text: "", jd: "" });
    };

    // Show compatibility check first
    if (!hasCheckedCompatibility) {
        return (
            <BrowserCompatibilityCheck 
                onContinue={() => setHasCheckedCompatibility(true)} 
            />
        );
    }

    // Show interview session
    if (hasStarted) {
        return (
            <InterviewSession
                resumeText={resumeData.text}
                jobDescription={resumeData.jd}
                onEnd={handleEnd}
            />
        );
    }

    // Show setup
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <div className="flex-1">
                <InterviewSetup onStart={handleStart} />
            </div>
        </div>
    );
}
