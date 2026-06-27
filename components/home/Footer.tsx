"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Globe, Github } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const productLinks = [
  { href: "/builder", label: "Resume Builder" },
  { href: "/ats-analyzer", label: "ATS Analyzer" },
  { href: "/cover-letter", label: "Cover Letter" },
  { href: "/voice-interview", label: "Mock Interview" },
  { href: "/recruiter", label: "Talent Search" },
];

export function Footer() {
  const [currentYear, setCurrentYear] = useState(2025);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="shrink-0 border-t border-border bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-44 relative z-20">
        <div className="flex flex-col items-center text-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <Logo size={18} className="text-background" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              ResumeGPT
            </span>
          </div>
          <p className="text-muted-foreground max-w-md">
            An AI resume builder for modern professionals — draft, tailor, and
            export resumes that read well and pass ATS screening.
          </p>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground">
            {productLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="https://github.com/deepakmodidev/resume-gpt"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-brand/40 transition-colors"
              aria-label="GitHub repository"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.575.106.785-.25.785-.555 0-.274-.01-1.002-.015-1.967-3.197.695-3.872-1.54-3.872-1.54-.523-1.328-1.277-1.682-1.277-1.682-1.044-.713.079-.699.079-.699 1.154.081 1.762 1.185 1.762 1.185 1.026 1.758 2.692 1.25 3.348.956.104-.743.402-1.25.731-1.538-2.553-.29-5.238-1.277-5.238-5.683 0-1.255.448-2.281 1.184-3.086-.119-.29-.513-1.46.112-3.043 0 0 .965-.309 3.163 1.179a11.02 11.02 0 0 1 2.88-.388c.977.005 1.962.132 2.88.388 2.196-1.488 3.16-1.18 3.16-1.18.626 1.584.232 2.754.114 3.044.737.805 1.182 1.831 1.182 3.086 0 4.417-2.689 5.39-5.25 5.674.413.355.78 1.057.78 2.13 0 1.538-.014 2.779-.014 3.157 0 .308.207.667.79.554A11.502 11.502 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
              </svg>
            </Link>
            <Link
              href="https://deepakmodi.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-brand/40 transition-colors"
              aria-label="Portfolio"
            >
              <Globe className="w-4 h-4" />
            </Link>
            <Link
              href="mailto:contact@resumegpt.com"
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-brand/40 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>© {currentYear} ResumeGPT. All rights reserved.</p>
          <Link
            href="https://deepakmodi.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Crafted by Deepak Modi
          </Link>
        </div>
      </div>

      {/* Large editorial wordmark — neutral, not blue */}
      <div className="pointer-events-none select-none absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-[30%] text-[5rem] sm:text-[9rem] md:text-[12rem] lg:text-[15rem] font-extrabold tracking-tighter leading-none text-foreground/[0.04]">
        RESUME.GPT
      </div>
    </footer>
  );
}
