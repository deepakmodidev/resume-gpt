import { Metadata } from "next";
import { CoverLetterGenerator } from "@/components/cover-letter/CoverLetterGenerator";
import { AppShell } from "@/components/AppShell";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
    <ErrorBoundary>
      <AppShell scroll={false}>
        <main className="flex-1 min-h-0 h-full overflow-hidden">
          <CoverLetterGenerator />
        </main>
      </AppShell>
    </ErrorBoundary>
  );
}
