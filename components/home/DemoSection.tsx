"use client";
import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

const highlights = [
  "Full-context AI analysis",
  "Semantic pattern matching",
  "Context-aware retrieval",
  "Groq AI integration",
  "Real-time ATS scoring",
];

export function DemoSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.05, 0.9]);

  return (
    <section ref={sectionRef} className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-5">
            See it match your resume to the job
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            ResumeGPT reads your resume against a job description and returns an
            ATS score, semantic matches, and concrete suggestions — in real
            time.
          </p>

          {/* Capability chips */}
          <div className="flex flex-wrap justify-center gap-2.5 mt-8">
            {highlights.map((label) => (
              <span
                key={label}
                className="bg-secondary border border-border px-4 py-1.5 rounded-full text-sm font-medium text-secondary-foreground"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <motion.div style={{ scale }}>
            <video
              src="https://res.cloudinary.com/ddotbkkt7/video/upload/cursorful-video-1753013955771_ufa6dx.mp4"
              autoPlay
              loop
              muted
              playsInline
              controls
              aria-label="ResumeGPT product walkthrough"
              className="rounded-2xl shadow-xl w-full max-w-5xl border border-border"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
