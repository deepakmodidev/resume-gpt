"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Globe } from "lucide-react";
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
    <footer className="border-t border-border bg-background relative overflow-hidden">
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
