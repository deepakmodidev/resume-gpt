"use client";

import { cn } from '@/lib/utils';

export function AgentChatIndicator({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeMap = {
    sm: 'size-1.5',
    md: 'size-2.5',
    lg: 'size-4'
  };

  return (
    <div className="flex items-center gap-2 p-2 px-4 rounded-full bg-secondary/50 w-fit backdrop-blur-sm border border-border/50">
      <div className="flex gap-1.5">
        <span className={cn("bg-primary rounded-full animate-pulse", sizeMap[size], className)} style={{ animationDelay: '0ms' }} />
        <span className={cn("bg-primary rounded-full animate-pulse", sizeMap[size], className)} style={{ animationDelay: '200ms' }} />
        <span className={cn("bg-primary rounded-full animate-pulse", sizeMap[size], className)} style={{ animationDelay: '400ms' }} />
      </div>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/80 font-bold">Agent Thinking</span>
    </div>
  );
}
