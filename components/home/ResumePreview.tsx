'use client';

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
  Star,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export function ResumePreview() {
  const { scrollY } = useScroll();
  const [windowHeight, setWindowHeight] = useState(800); // Default fallback

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  const scale = useTransform(scrollY, [0, windowHeight], [1.3, 0.8]);

  return (
    <div className="flex justify-center">
      <motion.div className="relative max-w-5xl w-full" style={{ scale }}>
        <div className="relative bg-card/80 backdrop-blur-xl border border-border/90 rounded-3xl p-6 md:p-12 shadow-2xl">
          {/* Resume Header */}
          <div className="border-b border-border/50 pb-6 md:pb-8 mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-4 md:mb-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-linear-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto md:mx-0">
                <span className="text-white font-bold text-2xl md:text-3xl">
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
                <p className="text-muted-foreground/80 text-sm md:text-base">
                  2+ years experience in full-stack development
                </p>
              </div>
              <div className="text-center md:text-right">
                <div className="text-muted-foreground text-xs md:text-sm space-y-1">
                  <div className="flex items-center gap-1 justify-center md:justify-end">
                    <Mail className="h-3 w-3" />
                    <span>deepakmodidev@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-1 justify-center md:justify-end">
                    <Phone className="h-3 w-3" />
                    <span>+91 9874563210</span>
                  </div>
                  <div className="hidden md:flex items-center gap-1 justify-end">
                    <MapPin className="h-3 w-3" />
                    <span>Gurugram, IN</span>
                  </div>
                  <div className="hidden md:flex items-center gap-1 justify-end">
                    <Globe className="h-3 w-3" />
                    <span>deepakmodi.tech</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Content Preview - Responsive Layout */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-10 mb-6 md:mb-8">
            {/* Left Column */}
            <div className="space-y-6 md:space-y-8">
              {/* Experience Section */}
              <div>
                <h4 className="font-bold mb-4 md:mb-6 text-foreground/90 text-base md:text-lg border-b border-border/30 pb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  EXPERIENCE
                </h4>
                <div className="space-y-4 md:space-y-6">
                  <div className="border-l-2 border-blue-500/30 pl-3 md:pl-4">
                    <h5 className="font-semibold text-sm md:text-base mb-1">
                      Software Developer{' '}
                    </h5>
                    <p className="text-xs md:text-sm text-muted-foreground mb-2">
                      Notesneo • July 2025 - Present
                    </p>
                    <ul className="text-xs md:text-sm text-muted-foreground/90 space-y-1 hidden md:block">
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

              {/* Education Section - Hidden on mobile */}
              <div className="hidden md:block">
                <h4 className="font-bold mb-6 text-foreground/90 text-lg border-b border-border/30 pb-2 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  EDUCATION
                </h4>
                <div className="border-l-2 border-green-500/30 pl-4">
                  <h5 className="font-semibold text-base mb-1">
                    B.Tech Computer Science Engineering
                  </h5>
                  <p className="text-sm text-muted-foreground mb-2">
                    MDU Rohtak • 2022 - 2026
                  </p>
                  <p className="text-sm text-muted-foreground/90">
                    Percentage: 76% • DSA 300+ problems
                  </p>
                </div>
              </div>

              {/* Achievements Section - Moved from right column */}
              <div className="hidden md:block">
                <h4 className="font-bold mb-6 text-foreground/90 text-lg border-b border-border/30 pb-2 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  ACHIEVEMENTS
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground/90">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span>Innoviz 2023 - First Prize Winner</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-500" />
                    <span>Led 4-member team for Tech Exhibition</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-blue-500" />
                    <span>300+ DSA problems solved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6 md:space-y-8">
              {/* Skills Section */}
              <div>
                <h4 className="font-bold mb-4 md:mb-6 text-foreground/90 text-base md:text-lg border-b border-border/30 pb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  SKILLS
                </h4>
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <p className="text-xs md:text-sm font-medium mb-2">
                      Programming
                    </p>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 md:px-3 py-1 rounded-full font-medium">
                        JavaScript
                      </span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 md:px-3 py-1 rounded-full font-medium">
                        Java
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 md:px-3 py-1 rounded-full font-medium">
                        TypeScript
                      </span>
                      <span className="bg-orange-100 text-orange-800 text-xs px-2 md:px-3 py-1 rounded-full font-medium">
                        Python
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-medium mb-2">
                      Web Development
                    </p>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      <span className="bg-cyan-100 text-cyan-800 text-xs px-2 md:px-3 py-1 rounded-full font-medium">
                        React
                      </span>
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 md:px-3 py-1 rounded-full font-medium">
                        Next.js
                      </span>
                      <span className="bg-red-100 text-red-800 text-xs px-2 md:px-3 py-1 rounded-full font-medium">
                        Node.js
                      </span>
                      <span className="bg-indigo-100 text-indigo-800 text-xs px-2 md:px-3 py-1 rounded-full font-medium">
                        Express
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium mb-2">
                      Databases & Tools
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-medium">
                        MongoDB
                      </span>
                      <span className="bg-pink-100 text-pink-800 text-xs px-3 py-1 rounded-full font-medium">
                        Firebase
                      </span>
                      <span className="bg-teal-100 text-teal-800 text-xs px-3 py-1 rounded-full font-medium">
                        PostgreSQL
                      </span>
                      <span className="bg-violet-100 text-violet-800 text-xs px-3 py-1 rounded-full font-medium">
                        Git
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Projects Section - Simplified on mobile */}
              <div className="hidden md:block">
                <h4 className="font-bold mb-6 text-foreground/90 text-lg border-b border-border/30 pb-2 flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  KEY PROJECTS
                </h4>
                <div className="space-y-4">
                  <div className="border-l-2 border-cyan-500/30 pl-4">
                    <h5 className="font-semibold text-base mb-1">NotesNeo</h5>
                    <p className="text-sm text-muted-foreground/90 mb-2">
                      Online study notes platform used by 1000+ students
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        React
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        TypeScript
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        Firebase
                      </span>
                    </div>
                  </div>
                  <div className="border-l-2 border-orange-500/30 pl-4">
                    <h5 className="font-semibold text-base mb-1">
                      NeoCompiler
                    </h5>
                    <p className="text-sm text-muted-foreground/90 mb-2">
                      Multi-language code editor with AI help and sharing
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        React
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        Gemini API
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        Node.js
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Quality Indicators */}
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-6 pt-4 md:pt-6 border-t border-border/50">
            <div className="flex items-center gap-1 md:gap-2">
              <CheckCircle className="h-4 w-4 md:h-6 md:w-6 text-green-500" />
              <span className="font-semibold text-xs md:text-sm">
                ATS Optimized
              </span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Shield className="h-4 w-4 md:h-6 md:w-6 text-green-500" />
              <span className="font-semibold text-xs md:text-sm">
                No Errors
              </span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Target className="h-4 w-4 md:h-6 md:w-6 text-blue-500" />
              <span className="font-semibold text-xs md:text-sm">
                Keyword Optimized
              </span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Zap className="h-4 w-4 md:h-6 md:w-6 text-yellow-500" />
              <span className="font-semibold text-xs md:text-sm">
                AI Enhanced
              </span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <FileText className="h-4 w-4 md:h-6 md:w-6 text-purple-500" />
              <span className="font-semibold text-xs md:text-sm">
                Professional Format
              </span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Star className="h-4 w-4 md:h-6 md:w-6 text-emerald-500" />
              <span className="font-semibold text-xs md:text-sm">
                Industry Standard
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Floating badge*/}
        <div className="absolute -top-4 -left-4 md:-top-6 md:-left-6 bg-linear-to-r from-blue-500 to-cyan-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold shadow-lg text-xs md:text-sm flex items-center gap-1 md:gap-2">
          10+ Templates
        </div>

        <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 bg-linear-to-r from-green-500 to-emerald-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg md:rounded-xl font-semibold shadow-lg text-xs md:text-sm flex items-center gap-1 md:gap-2">
          Perfect Score
        </div>
      </motion.div>
    </div>
  );
}
