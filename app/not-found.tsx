import Link from "next/link";
import { ResumeBulletWriter } from "@/components/home/ResumeBulletWriter";

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4 py-16">
      {/* Warm brand blob — same treatment as the landing hero */}
      <div className="pointer-events-none absolute left-1/2 top-[-14rem] -z-10 size-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-brand to-warning opacity-20 blur-[8em] md:size-[40rem]" />

      <div className="text-center max-w-2xl mx-auto">
        {/* Animated 404 Number */}
        <div className="relative mb-6">
          <h1 className="text-[100px] md:text-[150px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-foreground to-primary leading-none">
            404
          </h1>
          <div className="absolute inset-0 text-[120px] md:text-[180px] font-bold text-primary/10 blur-xl leading-none">
            404
          </div>
        </div>

        {/* Heading + subtitle */}
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          This page isn&apos;t on our resume.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          The link you followed doesn&apos;t exist — but while you&apos;re here,
          watch ResumeGPT rewrite a bullet in real time.
        </p>

        {/* Interactive resume-writer — the product magic, on a dead end */}
        <div className="mt-8 flex justify-center">
          <ResumeBulletWriter />
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { href: "/", label: "Home" },
              { href: "/builder", label: "AI Resume" },
              { href: "/voice-interview", label: "AI Interview" },
              { href: "/ats-analyzer", label: "ATS Analyzer" },
              { href: "/cover-letter", label: "Cover Letter" },
              { href: "/recruiter", label: "Talent Search" },
            ].map((link, index) => (
              <div key={link.href} className="flex items-center gap-4">
                {index > 0 && <span className="text-border">•</span>}
                <Link
                  href={link.href}
                  className="text-sm text-primary hover:underline hover:text-primary/80 transition-colors"
                >
                  {link.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
