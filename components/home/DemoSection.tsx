'use client';
import SafariFrame from '@/components/ui/safari-frame';

export function DemoSection() {
    return (
        <section className="py-20 relative">
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
                    <SafariFrame
                        videoUrl="https://res.cloudinary.com/"
                        url="resumegpt.com"
                    />
                </div>
            </div>
        </section>
    );
}
