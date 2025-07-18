import { Bot, NotepadTextDashed } from 'lucide-react';

export function ResumeBuildingSection() {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-linear-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
              <span className="bg-linear-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                Intelligent
              </span>{' '}
              Resume Building
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the power of AI-driven resume creation. Our intelligent
            assistant helps you craft
            <span className="text-foreground font-medium">
              {' '}
              professional resumes
            </span>{' '}
            that stand out to employers and pass ATS screening.
          </p>
        </div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* AI Resume Assistant card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-blue-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-card/80 backdrop-blur-xs border border-border rounded-2xl p-4 sm:p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Bot className="h-4 w-4 text-purple-400" />
                </div>
                <span className="font-semibold text-foreground">
                  AI Resume Assistant
                </span>
              </div>
              <div className="space-y-4">
                {/* User message */}
                <div className="flex gap-3 justify-end">
                  <div className="flex-1 bg-muted/50 rounded-xl p-4 max-w-[80%]">
                    <p className="text-sm text-foreground">
                      Help me improve my software engineer experience section
                      for a senior role at Google. I want to highlight
                      leadership and technical impact.
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    U
                  </div>
                </div>

                {/* AI response */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-linear-to-r from-purple-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-sm text-foreground mb-3">
                      I&apos;ve enhanced your experience section with stronger action
                      verbs and quantified achievements. Here&apos;s what I
                      recommend:
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 text-xs mt-1">✨</span>
                        <span className="text-foreground">
                          Led development of microservices architecture serving
                          10M+ users
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 text-xs mt-1">✨</span>
                        <span className="text-foreground">
                          Improved system performance by 40% and reduced latency
                          by 60%
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 text-xs mt-1">✨</span>
                        <span className="text-foreground">
                          Mentored 5 junior developers and established code
                          review processes
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-green-500 text-sm">✓</span>
                  </div>
                  <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium flex items-center gap-2">
                      <span>
                        Experience section updated and optimized for ATS • Ready
                        for senior-level positions
                      </span>
                    </p>
                  </div>
                </div>

                {/* Typing indicator */}
                <div className="flex gap-3 opacity-60">
                  <div className="w-8 h-8 bg-linear-to-r from-purple-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 bg-muted/30 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"
                          style={{ animationDelay: '0.4s' }}
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
          </div>
          {/* Live Resume Preview card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-blue-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-card/80 backdrop-blur-xs border border-border rounded-2xl p-4 sm:p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <NotepadTextDashed className="h-4 w-4 text-blue-400" />
                </div>
                <span className="font-semibold text-foreground">
                  Live Resume Preview
                </span>
              </div>
              <div className="relative bg-card backdrop-blur-xs border border-border rounded-2xl p-4 sm:p-6  h-full">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">JS</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Sundar Pichai
                  </h3>
                  <p className="text-muted-foreground">
                    Senior Software Engineer
                  </p>
                  <div className="flex justify-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span>📧 sundar.pichai@email.com</span>
                    <span>📱 +91 9876543210</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground border-b border-border pb-2 mb-3">
                      💼 Professional Experience
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
                        Led development of microservices architecture serving
                        10M+ users. Improved system performance by 40% and
                        reduced latency by 60%. Mentored 5 junior developers and
                        established code review processes
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground border-b border-border pb-2 mb-3">
                      🛠️ Technical Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'JavaScript',
                        'TypeScript',
                        'React',
                        'Node.js',
                        'Python',
                        'AWS',
                      ].map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs border border-blue-500/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2 text-green-500 text-sm">
                      <span className="text-xs">✅</span>
                      <span className="font-medium">
                        ATS Optimized • Ready to Download
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
