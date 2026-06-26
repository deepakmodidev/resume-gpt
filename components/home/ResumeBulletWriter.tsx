"use client";

import { useEffect, useState } from "react";
import { Sparkles, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* Polished, AI-rewritten resume bullets — strong verbs, quantified impact.
   These stand in for what ResumeGPT produces, so the 404 still shows off the
   core product: type naturally, watch the resume write itself in real time. */
const BULLETS = [
  "Led a 6-engineer team to ship a payments platform serving 2M+ users.",
  "Cut page load time by 43% by rebuilding the rendering pipeline.",
  "Grew monthly active users from 10K to 250K in under a year.",
  "Automated deployments, dropping release time from 3 hours to 9 minutes.",
  "Drove $1.2M in new revenue with a self-serve onboarding flow.",
  "Mentored 5 junior developers — 3 were promoted within 12 months.",
];

const TYPE_MS = 26;

/* A small interactive card that "types" a resume bullet character by character,
   mirroring ResumeGPT's real-time writing. Click Rewrite to generate another. */
export function ResumeBulletWriter() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const full = BULLETS[index];

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setText(full);
      setDone(true);
      return;
    }

    setText("");
    setDone(false);

    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setText(full.slice(0, i));
      if (i >= full.length) {
        window.clearInterval(id);
        setDone(true);
      }
    }, TYPE_MS);

    return () => window.clearInterval(id);
  }, [index]);

  const rewrite = () => setIndex((i) => (i + 1) % BULLETS.length);

  return (
    <div className="group relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card/80 p-5 text-left shadow-[0_20px_50px_-20px_hsl(24_30%_12%/0.4)] md:p-6">

      {/* Header — looks like a resume section, signals the AI is writing */}
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-warning text-brand-foreground">
          <Sparkles className="size-4" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          ResumeGPT is writing
        </span>
        <span className="ml-auto rounded-full border border-border bg-card/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          Experience
        </span>
      </div>

      {/* The bullet being typed */}
      <div className="flex min-h-[5rem] items-start rounded-xl bg-muted/40 p-4">
        <p className="flex gap-2.5 text-[15px] leading-relaxed text-foreground">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
          <span>
            <span aria-hidden="true">{text}</span>
            <span
              aria-hidden="true"
              className={cn(
                "ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] rounded-full bg-brand align-baseline",
                done && "animate-caret-blink",
              )}
            />
            <span className="sr-only" aria-live="polite">
              {BULLETS[index]}
            </span>
          </span>
        </p>
      </div>

      {/* Footer — progress + the interactive control */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          Bullet {index + 1} of {BULLETS.length}
        </span>
        <Button
          onClick={rewrite}
          size="sm"
          className="rounded-lg font-semibold"
        >
          <RotateCw className="size-4" />
          Rewrite
        </Button>
      </div>
    </div>
  );
}
