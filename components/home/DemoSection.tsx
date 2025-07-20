
'use client';
import { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
// import SafariFrame from '@/components/ui/safari-frame';

export function DemoSection() {
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    });
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 0.8]);

    return (
        <section ref={sectionRef} className="py-20 relative">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        <span className="bg-linear-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
                            See{' '}
                            <span className="bg-linear-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                                ResumeGPT
                            </span>{' '}
                            in Action
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Watch how our AI-powered resume builder helps you create
                        <span className="text-foreground font-medium">
                            {' '}
                            professional resumes
                        </span>{' '}
                        in minutes, just by natural language prompts.
                    </p>
                </div>
                <div className="flex justify-center">
                    {/* <motion.div style={{ scale }}>
                        <SafariFrame
                            videoUrl="https://res.cloudinary.com/ddotbkkt7/video/upload/cursorful-video-1753013955771_ufa6dx.mp4"
                            url="tryresumegpt.vercel.app"
                        />
                    </motion.div> */}
                    <motion.div style={{ scale }}>
                        <video
                            src="https://res.cloudinary.com/ddotbkkt7/video/upload/cursorful-video-1753013955771_ufa6dx.mp4"
                            controls
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="rounded-3xl shadow-xl w-full max-w-5xl border-8 border-blue-200"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
