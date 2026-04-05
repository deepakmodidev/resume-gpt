"use client";

import React from 'react';
import type { AgentState, ReceivedMessage } from '@livekit/components-react';
import { Conversation, ConversationContent, ConversationScrollButton } from './Conversation';
import { Message, MessageContent, MessageResponse } from './Message';
import { cn } from '@/lib/utils';

export interface AgentChatTranscriptProps {
  /**
   * Array of messages to display in the transcript, sourced from useSessionMessages.
   */
  messages?: ReceivedMessage[];
  /**
   * The current state of the agent ('speaking', 'thinking', etc.)
   */
  agentState?: AgentState;
  /**
   * Additional CSS class names.
   */
  className?: string;
}

export function AgentChatTranscript({ 
  messages = [], 
  agentState, 
  className 
}: AgentChatTranscriptProps) {
  return (
    <div className={cn("relative h-full", className)}>
      <Conversation className="h-full bg-transparent border-none overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]">
        <ConversationContent className="p-8 pt-10 pb-20 transition-all duration-300">
          {messages.map((receivedMessage) => {
            const { id, timestamp, from, message } = receivedMessage;
            const messageOrigin = from?.isLocal ? 'user' : 'assistant';
            const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
            const time = new Date(timestamp).toLocaleTimeString(locale, { timeStyle: 'short' });

            return (
              <Message key={id} from={messageOrigin}>
                <div className="flex items-center gap-2 mb-1 px-1 opacity-80">
                  <span className="text-[10px] uppercase tracking-widest">
                    {messageOrigin === 'user' ? 'Candidate' : 'Interviewer'}
                  </span>
                  <span className="text-[10px] tracking-widest">{time}</span>
                </div>
                <MessageContent>
                  <MessageResponse>{message}</MessageResponse>
                </MessageContent>
              </Message>
            );
          })}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  );
}

