
'use client';
import { useRef, useState } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
// import SafariFrame from '@/components/ui/safari-frame';

export function DemoSection() {
    const sectionRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    });
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 0.8]);

    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showOverlay, setShowOverlay] = useState(false);

    // Handle play/pause toggle
    const handlePlayPause = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
        setShowOverlay(true);
        setTimeout(() => setShowOverlay(false), 900);
    };

    // Sync state if user uses native controls
    const handlePlay = () => {
        setIsPlaying(true);
        setShowOverlay(true);
        setTimeout(() => setShowOverlay(false), 900);
    };
    const handlePause = () => {
        setIsPlaying(false);
        setShowOverlay(true);
        setTimeout(() => setShowOverlay(false), 900);
    };

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
                    <motion.div style={{ scale }} className="relative">
                        <video
                            ref={videoRef}
                            src="https://res.cloudinary.com/ddotbkkt7/video/upload/cursorful-video-1753013955771_ufa6dx.mp4"
                            controls
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="rounded-3xl shadow-xl w-full max-w-5xl border-8 border-blue-200 cursor-pointer"
                            onClick={handlePlayPause}
                            onPlay={handlePlay}
                            onPause={handlePause}
                        />
                        {/* Center Play/Pause Button Overlay */}
                        {(showOverlay || !isPlaying) && (
                            <button
                                type="button"
                                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                                onClick={handlePlayPause}
                                className="absolute inset-0 flex items-center justify-center z-10 focus:outline-none"
                                tabIndex={-1}
                                style={{ pointerEvents: 'auto' }}
                            >
                                <span
                                    className={`bg-black/60 rounded-full p-4 shadow-lg transition-all duration-300 ${isPlaying ? 'scale-100' : 'scale-110'}`}
                                >
                                    {isPlaying ? (
                                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="13" y="12" width="7" height="24" rx="2" fill="#fff" />
                                            <rect x="28" y="12" width="7" height="24" rx="2" fill="#fff" />
                                        </svg>
                                    ) : (
                                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18 12V36L36 24L18 12Z" fill="#fff" />
                                        </svg>
                                    )}
                                </span>
                            </button>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
