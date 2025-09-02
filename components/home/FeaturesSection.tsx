"use client";

import React from "react";
import {
  MessageCircle,
  Download,
  Palette,
  Zap,
  Users,
  Shield,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "ATS Score Analyzer",
    description:
      "Get instant ATS compatibility scores with GenAI analysis and optimization suggestions",
    icon: Target,
    color: "text-indigo-500",
    size: "double", // spans 2 columns (positions 1-2)
  },
  {
    title: "AI Resume Assistant",
    description:
      "Powered by Gemini AI for intelligent content suggestions and resume optimization",
    icon: MessageCircle,
    color: "text-blue-500",
    size: "single", // spans 1 column (position 3)
  },
  {
    title: "Professional Templates",
    description:
      "10+ ATS-friendly templates including Modern, Executive, and Creative designs",
    icon: Palette,
    color: "text-purple-500",
    size: "single", // spans 1 column (position 4)
  },
  {
    title: "PDF Export",
    description:
      "High-quality PDF generation with proper formatting and print optimization",
    icon: Download,
    color: "text-green-500",
    size: "single", // spans 1 column (position 5)
  },
  {
    title: "Real-time Preview",
    description: "Live editing with instant preview of your resume changes",
    icon: Zap,
    color: "text-yellow-500",
    size: "double", // spans 2 columns (positions 6-7)
  },
  {
    title: "Chat Management",
    description:
      "Organize resume conversations with search, rename, and delete capabilities",
    icon: Users,
    color: "text-cyan-500",
    size: "single", // spans 1 column (position 8)
  },
  {
    title: "Secure & Private",
    description: "Google OAuth authentication with secure session management",
    icon: Shield,
    color: "text-red-500",
    size: "single", // spans 1 column (position 9)
  },
];

// Feature Card Component
interface FeatureCardProps {
  feature: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    size: string;
  };
  index: number;
}

const FeatureCard = ({ feature, index }: FeatureCardProps) => {
  const getCardSize = (size: string, index: number) => {
    // Bento grid pattern:
    // | 1-2 | 3 |
    // | 4   | 5-6 |
    // | 7   | 8 | 9 |

    if (index === 0 || index === 3) {
      // positions 1-2 and 5-6
      return "md:col-span-2";
    } else {
      return "md:col-span-1";
    }
  };

  const getGradientPosition = (index: number) => {
    const positions = [
      "left-[50%] translate-x-[-50%]", // 1-2 (double)
      "right-[-20%] md:right-[-50%]", // 3 (single)
      "left-[0%] translate-x-[-50%]", // 4 (single)
      "left-[50%] translate-x-[-50%]", // 5-6 (double)
      "left-[0%] translate-x-[-50%]", // 7 (single)
      "right-[-20%] md:right-[-50%]", // 8 (single)
      "left-[50%] translate-x-[-50%]", // 9 (single)
      "right-[-20%] md:right-[-50%]", // 10 (single)
      "left-[0%] translate-x-[-50%]", // 11 (single)
    ];
    return positions[index] || "left-[50%] translate-x-[-50%]";
  };

  return (
    <div
      className={cn(
        "bg-muted/30 hover:bg-muted/50 transition-all duration-700 rounded-2xl p-2 min-h-80 group relative overflow-hidden border border-border/50",
        getCardSize(feature.size, index),
      )}
    >
      <div className="rounded-2xl bg-card backdrop-blur-xs h-full transition-all duration-700 relative overflow-hidden w-full p-8 flex flex-col items-start justify-between">
        {/* Animated gradient background */}
        <div
          className={cn(
            "-bottom-40 md:-bottom-116 group-hover:opacity-100 opacity-0 z-1 absolute bg-linear-to-t from-blue-500/10 to-blue-300/20 blur-[6em] rounded-xl transition-all duration-700 ease-out w-40 md:w-120 h-80 md:h-120 rotate-54",
            getGradientPosition(index),
          )}
        />

        {/* Feature icon with enhanced styling */}
        <div className="flex items-start flex-col gap-4 drop-shadow-lg z-10 relative">
          <div
            className={cn(
              "p-3 rounded-2xl backdrop-blur-xs border border-border/50",
              feature.color === "text-blue-500" && "bg-blue-500/10",
              feature.color === "text-purple-500" && "bg-purple-500/10",
              feature.color === "text-green-500" && "bg-green-500/10",
              feature.color === "text-yellow-500" && "bg-yellow-500/10",
              feature.color === "text-cyan-500" && "bg-cyan-500/10",
              feature.color === "text-red-500" && "bg-red-500/10",
              feature.color === "text-orange-500" && "bg-orange-500/10",
            )}
          >
            <feature.icon className={cn("size-8", feature.color)} />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
              {feature.title}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        </div>

        {/* Feature illustration placeholder */}
        <div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
          <feature.icon className="size-24 text-foreground" />
        </div>
      </div>
    </div>
  );
};

export function FeaturesSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Background elements */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-50/30 via-transparent to-blue-50/30 dark:from-blue-950/10 dark:via-transparent dark:to-blue-950/10"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>

        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-linear-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
              Why Choose{" "}
              <span className="bg-linear-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                ResumeGPT
              </span>
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Everything you need to create{" "}
            <span className="text-foreground font-medium">
              professional resumes
            </span>{" "}
            that get noticed by employers and pass ATS screening.
          </p>
        </div>

        {/* Enhanced Features Grid - Bento Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(20rem,1fr)]">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
