'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { checkSession } from '@/actions/session-actions';
import { handleGoogleSignIn } from '@/actions/auth-actions';

interface FinalCTASectionProps {
  chatId: string;
}

export function FinalCTASection({ chatId }: FinalCTASectionProps) {
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const router = useRouter();

  const handleStartBuilding = async () => {
    try {
      setIsCheckingSession(true);
      const hasSession = await checkSession();

      if (hasSession) {
        router.push(`/builder/${chatId}`);
      } else {
        await handleGoogleSignIn();
      }
    } catch (error) {
      console.error('Error checking session:', error);
      await handleGoogleSignIn();
    } finally {
      setIsCheckingSession(false);
    }
  };
  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
        <div className="relative flex justify-center items-center">
          {/* CTA Card with Feature Card Design */}
          <div className="bg-muted/30 hover:bg-muted/50 transition-all duration-700 rounded-2xl p-2 group relative overflow-hidden border border-border/50 w-full max-w-5xl">
            <div className="rounded-2xl bg-card backdrop-blur-xs h-full transition-all duration-700 relative overflow-hidden w-full p-6 md:p-12 flex flex-col items-center justify-center">
              {/* Animated gradient background */}
              <div className="absolute -bottom-40 left-[50%] translate-x-[-50%] group-hover:opacity-100 opacity-0 z-1 bg-linear-to-t from-blue-500/10 to-blue-300/20 blur-[6em] rounded-xl transition-all duration-700 ease-out w-40 md:w-120 h-80 md:h-120 rotate-12" />

              {/* Content */}
              <div className="relative z-10 w-full">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-2">
                    <ArrowRight className="h-8 w-8 text-blue-500" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold">
                    <span className="bg-linear-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
                      Ready to build your perfect resume?
                    </span>
                  </h2>
                </div>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of professionals who have landed their dream jobs
                  with AI-optimized resumes.
                </p>
                <Button
                  onClick={handleStartBuilding}
                  disabled={isCheckingSession}
                  size="lg"
                  className="bg-linear-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 font-semibold text-lg px-8 py-4 h-auto rounded-xl shadow-lg"
                >
                  {isCheckingSession ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    <>
                      Start Building Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
