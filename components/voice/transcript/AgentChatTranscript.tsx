"use client";

import React from 'react';
import type { AgentState, ReceivedMessage } from '@livekit/components-react';
import { Conversation, ConversationContent, ConversationScrollButton } from './Conversation';
import { Message, MessageContent, MessageResponse } from './Message';
import { AgentChatIndicator } from './AgentChatIndicator';

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
    <div className={className}>
      <Conversation className="h-full bg-secondary/5 border border-border/50 rounded-2xl shadow-inner overflow-hidden">
        <ConversationContent className="p-6 transition-all duration-300">
          {messages.map((receivedMessage) => {
            const { id, timestamp, from, message } = receivedMessage;
            const messageOrigin = from?.isLocal ? 'user' : 'assistant';
            const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
            const time = new Date(timestamp).toLocaleTimeString(locale, { timeStyle: 'short' });

            return (
              <Message key={id} from={messageOrigin}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                    {messageOrigin === 'user' ? 'Candidate' : 'Interviewer'}
                  </span>
                  <span className="text-[10px] opacity-20">{time}</span>
                </div>
                <MessageContent>
                  <MessageResponse>{message}</MessageResponse>
                </MessageContent>
              </Message>
            );
          })}
          
          {agentState === 'thinking' && (
            <div className="mt-4 px-1 opacity-100">
              <AgentChatIndicator size="sm" />
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  );
}

