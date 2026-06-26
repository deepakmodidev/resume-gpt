import React from "react";
import {
  MessageCircle,
  Download,
  Palette,
  Zap,
  Target,
  FileText,
  Mic,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* --------------------------------- helpers -------------------------------- */

const Bar = ({ className }: { className?: string }) => (
  <div className={cn("h-1.5 rounded-full bg-muted-foreground/25", className)} />
);

/* ------------------------------ feature visuals --------------------------- */
/* Each visual is a small, token-based mockup of the feature — no images, no
   hardcoded colors. They sit inside a framed area at the top/side of a card. */

// Chat prompt → generated resume lines.
const ResumeGenVisual = () => (
  <div className="w-full max-w-sm space-y-2.5">
    <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-foreground px-3 py-2 text-xs font-medium text-background">
      Build a resume for a senior backend role
    </div>
    <div className="space-y-2 rounded-2xl rounded-bl-sm border border-brand/15 bg-brand/5 p-3">
      <Bar className="h-2 w-1/3 bg-brand/60" />
      <Bar className="w-full" />
      <Bar className="w-5/6" />
      <Bar className="w-2/3" />
      <div className="flex gap-1.5 pt-1">
        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          Node.js
        </span>
        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          AWS
        </span>
        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          Go
        </span>
      </div>
    </div>
  </div>
);

// A single cover-letter page with header + signature.
const CoverLetterVisual = () => (
  <div className="w-28 space-y-1.5 rounded-lg border border-border bg-background p-3 shadow-sm">
    <Bar className="h-2 w-2/3 bg-brand/60" />
    <Bar className="mt-1 w-1/2" />
    <div className="space-y-1 pt-1">
      <Bar className="w-full" />
      <Bar className="w-full" />
      <Bar className="w-11/12" />
      <Bar className="w-full" />
      <Bar className="w-3/4" />
    </div>
    <Bar className="mt-2 h-2 w-1/3 bg-muted-foreground/40" />
  </div>
);

// Three template thumbnails, the middle one selected.
const TemplatesVisual = () => {
  const layouts = [
    { centered: false, lift: "translate-y-1" },
    { centered: true, lift: "-translate-y-1" },
    { centered: false, lift: "translate-y-1" },
  ];
  return (
    <div className="flex items-center justify-center gap-2.5">
      {layouts.map((l, i) => (
        <div
          key={i}
          className={cn(
            "w-16 space-y-1 rounded-md border bg-background p-2 transition-transform",
            l.lift,
            l.centered
              ? "border-brand/50 ring-2 ring-brand/30"
              : "border-border",
          )}
        >
          <div
            className={cn(
              "mb-1.5 flex flex-col gap-1",
              l.centered ? "items-center" : "items-start",
            )}
          >
            <div className="h-3 w-3 rounded-full bg-brand/50" />
            <Bar className="h-1 w-3/4" />
          </div>
          <Bar className="h-1 w-full" />
          <Bar className="h-1 w-5/6" />
          <Bar className="h-1 w-full" />
        </div>
      ))}
    </div>
  );
};

// A resume page with a PDF download badge.
const PdfVisual = () => (
  <div className="relative w-24">
    <div className="space-y-1.5 rounded-lg border border-border bg-background p-3 shadow-sm">
      <Bar className="h-2 w-1/2 bg-brand/60" />
      <Bar className="w-full" />
      <Bar className="w-5/6" />
      <Bar className="w-full" />
      <Bar className="w-2/3" />
    </div>
    <div className="absolute -bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold text-brand-foreground shadow-md">
      <Download className="size-3" />
      PDF
    </div>
  </div>
);

// Split view: editor on the left, live preview on the right.
const PreviewVisual = () => (
  <div className="flex w-full max-w-xs items-stretch gap-2">
    <div className="flex-1 space-y-1.5 rounded-lg bg-muted/60 p-2.5">
      <Bar className="w-3/4" />
      <Bar className="w-full" />
      <Bar className="w-1/2" />
      <Bar className="w-5/6" />
    </div>
    <div className="flex-1 space-y-1.5 rounded-lg border border-border bg-background p-2.5">
      <div className="flex items-center gap-1">
        <span className="size-1.5 animate-pulse rounded-full bg-brand" />
        <span className="text-[9px] font-semibold uppercase tracking-wide text-brand">
          Live
        </span>
      </div>
      <Bar className="h-2 w-2/3 bg-brand/50" />
      <Bar className="w-full" />
      <Bar className="w-3/4" />
    </div>
  </div>
);

// A circular ATS score gauge.
const AtsVisual = () => (
  <div className="relative size-24">
    <svg viewBox="0 0 36 36" className="size-full -rotate-90">
      <circle
        cx="18"
        cy="18"
        r="15.9155"
        className="fill-none stroke-muted"
        strokeWidth="3"
      />
      <circle
        cx="18"
        cy="18"
        r="15.9155"
        className="fill-none stroke-brand"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="92 100"
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-2xl font-bold text-foreground">92</span>
      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        ATS
      </span>
    </div>
  </div>
);

// Mic + live waveform + a transcript bubble.
const VoiceVisual = () => {
  const bars = [40, 70, 100, 60, 85, 45, 75, 55, 90, 50];
  return (
    <div className="flex w-full max-w-sm items-center gap-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-brand/15 bg-brand/10">
        <Mic className="size-5 text-brand" />
      </div>
      <div className="flex h-10 items-center gap-1">
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-1 animate-pulse rounded-full bg-brand/70"
            style={{ height: `${h}%`, animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>
      <div className="hidden rounded-xl rounded-bl-sm border border-border bg-muted/60 px-3 py-2 text-xs text-foreground sm:block">
        “Tell me about a challenging project…”
      </div>
    </div>
  );
};

/* -------------------------------- features -------------------------------- */

type Feature = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  size: "single" | "double";
  Visual: React.ComponentType;
};

const features: Feature[] = [
  {
    title: "AI Resume Generator",
    description:
      "Generate a professional, high-impact resume in minutes, tailored to your industry and experience.",
    icon: MessageCircle,
    size: "double",
    Visual: ResumeGenVisual,
  },
  {
    title: "AI Cover Letter Generator",
    description:
      "Create tailored cover letters in seconds that match your resume to a specific job description.",
    icon: FileText,
    size: "single",
    Visual: CoverLetterVisual,
  },
  {
    title: "Professional Templates",
    description:
      "10+ ATS-friendly templates including Modern, Executive, and Creative designs.",
    icon: Palette,
    size: "single",
    Visual: TemplatesVisual,
  },
  {
    title: "PDF Export",
    description:
      "High-quality PDF generation with proper formatting and print optimization.",
    icon: Download,
    size: "single",
    Visual: PdfVisual,
  },
  {
    title: "Real-time Preview",
    description: "Live editing with an instant preview of every change.",
    icon: Zap,
    size: "single",
    Visual: PreviewVisual,
  },
  {
    title: "ATS Score Analyzer",
    description:
      "Get an instant ATS compatibility score with AI analysis and fixes.",
    icon: Target,
    size: "single",
    Visual: AtsVisual,
  },
  {
    title: "AI Voice Mock Interviews",
    description:
      "Real-time practice sessions powered by LiveKit and Sarvam AI to prepare for your interviews.",
    icon: Mic,
    size: "double",
    Visual: VoiceVisual,
  },
];

/* --------------------------------- card ----------------------------------- */

const FeatureCard = ({ feature }: { feature: Feature }) => {
  const { Visual, icon: Icon, size } = feature;
  const isDouble = size === "double";

  return (
    <div
      className={cn(
        "group relative flex overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-300 hover:border-brand/40",
        isDouble
          ? "flex-col gap-6 p-6 md:col-span-2 sm:flex-row sm:items-center"
          : "flex-col gap-5 p-6 md:col-span-1",
      )}
    >
      {/* Subtle hover wash — single, brand-tinted, top-anchored */}
      <div className="pointer-events-none absolute inset-x-0 -top-16 h-32 bg-brand/5 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Visual */}
      <div
        className={cn(
          "relative z-10 flex items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/30 p-5",
          isDouble ? "min-h-40 sm:w-1/2 sm:self-stretch" : "min-h-40 flex-1",
        )}
      >
        <Visual />
      </div>

      {/* Text */}
      <div className={cn("relative z-10", isDouble && "sm:w-1/2")}>
        <div className="mb-2 flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-brand/15 bg-brand/10">
            <Icon className="size-[18px] text-brand" />
          </div>
          <h3 className="text-lg font-bold text-foreground md:text-xl">
            {feature.title}
          </h3>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          {feature.description}
        </p>
      </div>
    </div>
  );
};

export function FeaturesSection() {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-5">
            Why choose <span className="text-brand">ResumeGPT</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Everything you need to build a resume that reads well to people and
            passes ATS screening.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[minmax(20rem,1fr)]">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
