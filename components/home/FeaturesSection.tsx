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

const features = [
  {
    title: "AI Resume Generator",
    description:
      "Generate a professional, high-impact resume in minutes, tailored to your industry and experience.",
    icon: MessageCircle,
    size: "double",
  },
  {
    title: "AI Cover Letter Generator",
    description:
      "Create tailored cover letters in seconds that match your resume to a specific job description.",
    icon: FileText,
    size: "single",
  },
  {
    title: "Professional Templates",
    description:
      "10+ ATS-friendly templates including Modern, Executive, and Creative designs.",
    icon: Palette,
    size: "single",
  },
  {
    title: "PDF Export",
    description:
      "High-quality PDF generation with proper formatting and print optimization.",
    icon: Download,
    size: "single",
  },
  {
    title: "Real-time Preview",
    description: "Live editing with an instant preview of every change.",
    icon: Zap,
    size: "single",
  },
  {
    title: "ATS Score Analyzer",
    description:
      "Get an instant ATS compatibility score with AI analysis and fixes.",
    icon: Target,
    size: "single",
  },
  {
    title: "AI Voice Mock Interviews",
    description:
      "Real-time practice sessions powered by LiveKit and Sarvam AI to prepare for your interviews.",
    icon: Mic,
    size: "double",
  },
];

interface FeatureCardProps {
  feature: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    size: string;
  };
}

const FeatureCard = ({ feature }: FeatureCardProps) => {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-8 min-h-72 flex flex-col justify-between transition-colors duration-300 hover:border-brand/40",
        feature.size === "double" ? "md:col-span-2" : "md:col-span-1",
      )}
    >
      {/* Subtle hover wash — single, brand-tinted, top-anchored */}
      <div className="pointer-events-none absolute inset-x-0 -top-16 h-32 bg-brand/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/15 flex items-center justify-center">
          <feature.icon className="size-6 text-brand" />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            {feature.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
            {feature.description}
          </p>
        </div>
      </div>

      {/* Watermark icon */}
      <feature.icon className="absolute bottom-5 right-5 size-20 text-foreground/[0.04] group-hover:text-foreground/[0.07] transition-colors duration-500" />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[minmax(18rem,1fr)]">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
