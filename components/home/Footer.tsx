'use client';
import React from 'react';
import Link from 'next/link';
import {
  NotepadTextDashed,
  Twitter,
  Linkedin,
  Github,
  Mail,
} from 'lucide-react';

export function Footer() {
  return (
    <section className="relative max-h-fit mt-0">
      <footer className="border-t max-h-fit overflow-hidden bg-background mt-20 z-101 relative">
        <div className="max-w-7xl flex flex-col justify-between mx-auto h-120 sm:h-140 md:h-160 z-30 relative p-4 py-10">
          <div className="flex flex-col mb-12 sm:mb-20 md:mb-0 w-full">
            <div className="w-full flex flex-col items-center">
              <div className="space-y-2 flex flex-col items-center flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-transparent bg-clip-text bg-linear-to-br from-blue-400 via-blue-500 to-blue-600 text-3xl font-bold">
                    ResumeGPT
                  </span>
                </div>
                <p className="text-foreground/90 font-semibold text-center sm:w-96">
                  AI-powered resume builder for modern professionals. Create
                  stunning resumes optimized for ATS systems.
                </p>
              </div>

              <div className="flex mb-8 mt-3 gap-4">
                <Link
                  href="https://twitter.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="w-6 h-6 hover:text-blue-400 duration-300" />
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link
                  href="https://linkedin.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-6 h-6 hover:text-blue-400 duration-300" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
                <Link
                  href="https://github.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-6 h-6 hover:text-blue-400 duration-300" />
                  <span className="sr-only">GitHub</span>
                </Link>
                <Link
                  href="mailto:contact@resumegpt.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="w-6 h-6 hover:text-blue-400 duration-300" />
                  <span className="sr-only">Email</span>
                </Link>
              </div>

              <div className="flex flex-wrap gap-4 text-sm font-medium text-neutral-500 dark:text-neutral-400 max-w-full">
                <Link
                  className="hover:text-foreground duration-300 hover:font-semibold"
                  href="/"
                >
                  Pricing
                </Link>
                <Link
                  className="hover:text-foreground duration-300 hover:font-semibold"
                  href="/"
                >
                  Templates
                </Link>
                <Link
                  className="hover:text-foreground duration-300 hover:font-semibold"
                  href="/"
                >
                  About
                </Link>
                <Link
                  className="hover:text-foreground duration-300 hover:font-semibold"
                  href="/"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-20 md:mt-24 z-25 flex flex-col gap-1 items-center justify-center md:flex-row md:items-center md:justify-between">
            <p className="text-base text-muted-foreground">
              ©{new Date().getFullYear()} ResumeGPT. All rights reserved.
            </p>
            <nav className="flex gap-4">
              <Link
                href="https://deepakmodi.tech"
                target="_blank"
                className="text-base text-muted-foreground hover:text-blue-500 transition-colors duration-300 hover:font-medium"
              >
                Created by Deepak Modi
              </Link>
            </nav>
          </div>
        </div>

        {/* Large background text */}
        <div className="bg-linear-to-b from-foreground/20 via-foreground/10 to-transparent bg-clip-text text-transparent text-[4rem] sm:text-[8rem] md:text-[10rem] lg:text-[13rem] leading-tight absolute left-1/2 -translate-x-1/2 bottom-40 md:bottom-32 z-10 font-extrabold tracking-tighter pointer-events-none">
          RESUME.GPT
        </div>

        {/* Bottom logo */}
        <div className="absolute hover:border-blue-400 duration-400 drop-shadow-[0_0px_20px_rgb(59,130,246)] bottom-24 md:bottom-20 backdrop-blur-xs z-30 rounded-3xl bg-background/60 left-1/2 border-2 border-blue-400/30 flex items-center justify-center p-3 -translate-x-1/2">
          <div className="w-12 sm:w-16 md:w-24 h-12 sm:h-16 md:h-24 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <NotepadTextDashed className="w-8 sm:w-10 md:w-14 h-8 sm:h-10 md:h-14 text-white drop-shadow-lg" />
          </div>
        </div>

        {/* Bottom line */}
        <div className="absolute bottom-32 sm:bottom-34 backdrop-blur-xs z-25 h-1 bg-linear-to-r from-transparent via-blue-500/20 to-transparent w-full left-1/2 -translate-x-1/2"></div>

        {/* Bottom shadow */}
        <div className="bg-linear-to-t from-background via-background/80 blur-[1em] to-background/40 absolute bottom-28 z-22 w-full h-24"></div>
      </footer>
    </section>
  );
}
