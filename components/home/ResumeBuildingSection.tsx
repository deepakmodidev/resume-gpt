import { Bot, Sparkles, Check, Briefcase, Wrench } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const aiSuggestions = [
  "Led development of microservices architecture serving 10M+ users",
  "Improved system performance by 40% and reduced latency by 60%",
  "Mentored 5 junior developers and established code review processes",
];

const previewSkills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "AWS",
];

export function ResumeBuildingSection() {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-5">
            <span className="text-brand">Intelligent</span> resume building
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Chat with an assistant that understands your experience, rewrites
            it with stronger wording, and keeps everything ATS-ready as you go.
          </p>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          {/* AI Resume Assistant card */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 h-full transition-shadow duration-300 hover:shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-brand/10 rounded-lg flex items-center justify-center">
                <Bot className="h-4 w-4 text-brand" />
              </div>
              <span className="font-semibold text-foreground">
                AI Resume Assistant
              </span>
            </div>
            <div className="space-y-4">
              {/* User message */}
              <div className="flex gap-3 justify-end">
                <div className="bg-muted rounded-xl p-4 max-w-[80%]">
                  <p className="text-sm text-foreground">
                    Help me improve my software engineer experience section for
                    a senior role at Google. I want to highlight leadership and
                    technical impact.
                  </p>
                </div>
                <div className="w-8 h-8 shrink-0 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold">
                  D
                </div>
              </div>

              {/* AI response */}
              <div className="flex gap-3">
                <div className="w-8 h-8 shrink-0 bg-brand rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-brand-foreground" />
                </div>
                <div className="flex-1 bg-brand/5 border border-brand/15 rounded-xl p-4">
                  <p className="text-sm text-foreground mb-3">
                    I&apos;ve rewritten your experience with stronger action
                    verbs and quantified results. Here&apos;s what I recommend:
                  </p>
                  <div className="space-y-2 text-sm">
                    {aiSuggestions.map((line) => (
                      <div key={line} className="flex items-start gap-2">
                        <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0 text-brand" />
                        <span className="text-foreground">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 shrink-0 bg-muted rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-foreground" />
                </div>
                <div className="flex-1 bg-muted/60 border border-border rounded-xl p-4">
                  <p className="text-sm text-foreground font-medium">
                    Experience section updated and optimized for ATS — ready for
                    senior-level roles.
                  </p>
                </div>
              </div>

              {/* Typing indicator */}
              <div className="flex gap-3 opacity-70">
                <div className="w-8 h-8 shrink-0 bg-brand rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-brand-foreground" />
                </div>
                <div className="flex-1 bg-muted/40 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ResumeGPT is analyzing your skills...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Resume Preview card */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 h-full transition-shadow duration-300 hover:shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-brand/10 rounded-lg flex items-center justify-center">
                <Logo size={16} className="text-brand" />
              </div>
              <span className="font-semibold text-foreground">
                Live Resume Preview
              </span>
            </div>
            <div className="bg-background border border-border rounded-2xl p-4 sm:p-6 h-full">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-foreground text-background rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="font-bold text-lg">MR</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">
                  Maya Rodriguez
                </h3>
                <p className="text-muted-foreground">Senior Software Engineer</p>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
                  <span>maya.rodriguez@email.com</span>
                  <span>+1 (415) 318-2204</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground border-b border-border pb-2 mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-brand" />
                    Professional Experience
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-foreground">
                          Senior Software Engineer
                        </h5>
                        <p className="text-muted-foreground text-sm">
                          Google Inc. • 2022 - Present
                        </p>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        Current
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Led development of microservices architecture serving 10M+
                      users. Improved system performance by 40% and reduced
                      latency by 60%. Mentored 5 junior developers and
                      established code review processes.
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground border-b border-border pb-2 mb-3 flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-brand" />
                    Technical Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {previewSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-muted text-foreground/80 rounded-md text-xs border border-border/70"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t border-border flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-brand" />
                  <span className="font-medium text-foreground">
                    ATS optimized • Ready to download
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
