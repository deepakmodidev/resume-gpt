"use client";

import type { HTMLAttributes } from 'react';
import { memo } from 'react';
import { Streamdown } from 'streamdown';
import { cn } from '@/lib/utils'; // Adjust if needed

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: 'user' | 'assistant';
};

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      'group flex w-full max-w-[95%] flex-col gap-2 transition-all',
      from === 'user' ? 'is-user ml-auto justify-end' : 'is-assistant',
      className
    )}
    {...props}
  />
);

export const MessageContent = ({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex w-fit max-w-full min-w-0 flex-col gap-2 overflow-hidden text-sm',
      'group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground group-[.is-user]:ml-auto group-[.is-user]:rounded-2xl group-[.is-user]:px-4 group-[.is-user]:py-2.5',
      'group-[.is-assistant]:text-foreground group-[.is-assistant]:rounded-2xl group-[.is-assistant]:bg-secondary group-[.is-assistant]:px-4 group-[.is-assistant]:py-2.5',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const MessageResponse = memo(
  ({ children, className }: { children: string, className?: string }) => (
    <Streamdown
      className={cn('size-full prose prose-sm dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0', className)}
    >
      {children}
    </Streamdown>
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

MessageResponse.displayName = 'MessageResponse';
