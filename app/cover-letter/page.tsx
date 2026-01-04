import { Metadata } from "next";
import { CoverLetterGenerator } from "@/components/cover-letter/CoverLetterGenerator";
import { Header } from "@/components/home/Header";

export const metadata: Metadata = {
    title: "AI Cover Letter Generator | ResumeGPT",
    description:
        "Generate personalized, professional cover letters with AI. Tailored to your resume and job description.",
    keywords: [
        "cover letter generator",
        "AI cover letter",
        "job application",
        "cover letter writer",
    ],
};

export default function CoverLetterPage() {
    return (
        <div className="h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 min-h-0 overflow-hidden">
                <CoverLetterGenerator />
            </main>
        </div>
    );
}
