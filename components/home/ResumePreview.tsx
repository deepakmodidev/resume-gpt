"use client";

import {
  CheckCircle,
  Target,
  Zap,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  FolderOpen,
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  Shield,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const skillGroups = [
  { label: "Programming", items: ["JavaScript", "Java", "TypeScript", "Python"] },
  { label: "Web Development", items: ["React", "Next.js", "Node.js", "Express"] },
  {
    label: "Databases & Tools",
    items: ["MongoDB", "Firebase", "PostgreSQL", "Git"],
    desktopOnly: true,
  },
];

const qualityIndicators = [
  { icon: CheckCircle, label: "ATS Optimized" },
  { icon: Shield, label: "No Errors" },
  { icon: Target, label: "Keyword Optimized" },
  { icon: Zap, label: "AI Enhanced" },
  { icon: FileText, label: "Professional Format" },
  { icon: Award, label: "Industry Standard" },
];

export function ResumePreview() {
  const { scrollY } = useScroll();
  const [windowHeight, setWindowHeight] = useState(800);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  const scale = useTransform(scrollY, [0, windowHeight], [1.3, 0.85]);

  return (
    <div className="flex justify-center">
      <motion.div className="relative max-w-5xl w-full" style={{ scale }}>
        <div className="relative bg-card border border-border rounded-3xl p-6 md:p-12 shadow-[0_24px_70px_-30px_hsl(24_30%_12%/0.35)]">
          {/* Resume Header */}
          <div className="border-b border-border pb-6 md:pb-8 mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-4 md:mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-foreground text-background rounded-2xl flex items-center justify-center mx-auto md:mx-0">
                <span className="font-bold text-2xl md:text-3xl tracking-tight">
                  DM
                </span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-2xl md:text-3xl mb-1 md:mb-2">
                  Deepak Modi
                </h3>
                <p className="text-muted-foreground text-lg md:text-xl mb-1 md:mb-2">
                  Software Engineer
                </p>
                <p className="text-muted-foreground text-sm md:text-base">
                  2+ years experience in full-stack development
                </p>
              </div>
              <div className="text-center md:text-right">
                <div className="text-muted-foreground text-xs md:text-sm space-y-1">
                  <div className="flex items-center gap-1.5 justify-center md:justify-end">
                    <Mail className="h-3 w-3" />
                    <span>deepakmodidev@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-center md:justify-end">
                    <Phone className="h-3 w-3" />
                    <span>+91 98745 63210</span>
                  </div>
                  <div className="hidden md:flex items-center gap-1.5 justify-end">
                    <MapPin className="h-3 w-3" />
                    <span>Gurugram, IN</span>
                  </div>
                  <div className="hidden md:flex items-center gap-1.5 justify-end">
                    <Globe className="h-3 w-3" />
                    <span>deepakmodi.dev</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Content Preview */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-10 mb-6 md:mb-8">
            {/* Left Column */}
            <div className="space-y-6 md:space-y-8">
              {/* Experience */}
              <div>
                <h4 className="font-bold mb-4 md:mb-6 text-foreground text-base md:text-lg border-b border-border pb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-brand" />
                  EXPERIENCE
                </h4>
                <div className="space-y-4 md:space-y-6">
                  <div className="border-l-2 border-brand/40 pl-3 md:pl-4">
                    <h5 className="font-semibold text-sm md:text-base mb-1">
                      Software Developer
                    </h5>
                    <p className="text-xs md:text-sm text-muted-foreground mb-2">
                      Notesneo • July 2025 - Present
                    </p>
                    <ul className="text-xs md:text-sm text-muted-foreground space-y-1 hidden md:block">
                      <li>
                        • Built responsive websites using HTML, CSS, and
                        JavaScript
                      </li>
                      <li>
                        • Enhanced UI/UX leading to 20% boost in user
                        interaction
                      </li>
                      <li>• Collaborated with design, QA, and product teams</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="hidden md:block">
                <h4 className="font-bold mb-6 text-foreground text-lg border-b border-border pb-2 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-brand" />
                  EDUCATION
                </h4>
                <div className="border-l-2 border-brand/40 pl-4">
                  <h5 className="font-semibold text-base mb-1">
                    B.Tech Computer Science Engineering
                  </h5>
                  <p className="text-sm text-muted-foreground mb-2">
                    MDU Rohtak • 2022 - 2026
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Percentage: 76% • DSA 300+ problems
                  </p>
                </div>
              </div>

              {/* Achievements */}
              <div className="hidden md:block">
                <h4 className="font-bold mb-6 text-foreground text-lg border-b border-border pb-2 flex items-center gap-2">
                  <Award className="h-4 w-4 text-brand" />
                  ACHIEVEMENTS
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-brand shrink-0" />
                    <span>Innoviz 2023 - First Prize Winner</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-brand shrink-0" />
                    <span>Led 4-member team for Tech Exhibition</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-brand shrink-0" />
                    <span>300+ DSA problems solved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6 md:space-y-8">
              {/* Skills */}
              <div>
                <h4 className="font-bold mb-4 md:mb-6 text-foreground text-base md:text-lg border-b border-border pb-2 flex items-center gap-2">
                  <Code className="h-4 w-4 text-brand" />
                  SKILLS
                </h4>
                <div className="space-y-3 md:space-y-4">
                  {skillGroups.map((group) => (
                    <div
                      key={group.label}
                      className={group.desktopOnly ? "hidden md:block" : ""}
                    >
                      <p className="text-xs md:text-sm font-medium mb-2">
                        {group.label}
                      </p>
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {group.items.map((skill) => (
                          <span
                            key={skill}
                            className="bg-muted text-foreground/80 border border-border/70 text-xs px-2.5 md:px-3 py-1 rounded-md font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div className="hidden md:block">
                <h4 className="font-bold mb-6 text-foreground text-lg border-b border-border pb-2 flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-brand" />
                  KEY PROJECTS
                </h4>
                <div className="space-y-4">
                  <div className="border-l-2 border-brand/40 pl-4">
                    <h5 className="font-semibold text-base mb-1">NotesNeo</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      Online study notes platform used by 1000+ students
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {["React", "TypeScript", "Firebase"].map((tag) => (
                        <span
                          key={tag}
                          className="bg-muted text-foreground/70 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="border-l-2 border-brand/40 pl-4">
                    <h5 className="font-semibold text-base mb-1">NeoCompiler</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      Multi-language code editor with AI help and sharing
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {["React", "Groq API", "Node.js"].map((tag) => (
                        <span
                          key={tag}
                          className="bg-muted text-foreground/70 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quality Indicators */}
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-6 pt-4 md:pt-6 border-t border-border">
            {qualityIndicators.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 md:gap-2">
                <Icon className="h-4 w-4 md:h-5 md:w-5 text-brand" />
                <span className="font-medium text-xs md:text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating badges */}
        <div className="absolute -top-4 -left-4 md:-top-5 md:-left-5 bg-brand text-brand-foreground px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-semibold shadow-lg text-xs md:text-sm">
          10+ templates
        </div>

        <div className="absolute -top-4 -right-4 md:-top-5 md:-right-5 bg-card border border-border text-foreground px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-semibold shadow-lg text-xs md:text-sm">
          ATS-ready
        </div>
      </motion.div>
    </div>
  );
}
