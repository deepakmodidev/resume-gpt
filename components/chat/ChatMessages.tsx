'use client';

import { useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Bot, Loader2 } from 'lucide-react';
import { ChatMessage } from '@/lib/types';
import { ANIMATION_VARIANTS } from '@/constants/resume';

const WelcomeOverlay = memo(
  ({
    onSuggestionClick,
  }: {
    onSuggestionClick?: (suggestion: string) => void;
  }) => (
    <motion.div
      {...ANIMATION_VARIANTS.welcome}
      className="absolute inset-0 flex items-center justify-center z-10"
    >
      <div className="text-center space-y-8 max-w-2xl p-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-8">
            Ready to build your perfect resume?
          </h1>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-3 mt-12"
        >
          {[
            'Build a Resume for Backend Developer',
            'Build a resume for an AI/ML Engineer',
            'Build a resume for a Full Stack Engineer',
          ].map((prompt, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick?.(prompt)}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm border border-border transition-colors flex items-center gap-2"
            >
              {prompt}
              <span className="text-muted-foreground">↗</span>
            </button>
          ))}
        </motion.div>
      </div>
    </motion.div>
  ),
);

WelcomeOverlay.displayName = 'WelcomeOverlay';

const MessageBubble = memo(
  ({ message, index }: { message: ChatMessage; index: number }) => (
    <motion.div
      key={index}
      {...ANIMATION_VARIANTS.message}
      className={`w-full max-w-[85%] flex items-start gap-3 ${
        message.role === 'user'
          ? 'ml-auto flex-row-reverse text-right'
          : 'mr-auto flex-row text-left'
      }`}
    >
      <div
        className={`flex items-center justify-center rounded-full w-8 h-8 shrink-0 ${
          message.role === 'user'
            ? 'bg-blue-100 dark:bg-blue-900'
            : 'bg-gray-100 dark:bg-gray-800'
        }`}
      >
        {message.role === 'user' ? (
          <User className="h-4 w-4 text-blue-600 dark:text-blue-300" />
        ) : (
          <Bot className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        )}
      </div>
      <div>
        {message.parts.map((part, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap text-sm backdrop-blur-md p-4 rounded-2xl shadow-xs ${
              message.role === 'user'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                : 'bg-card text-card-foreground border border-border'
            }`}
          >
            {part.text}
          </div>
        ))}
      </div>
    </motion.div>
  ),
);

MessageBubble.displayName = 'MessageBubble';

const LoadingMessage = memo(() => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card text-card-foreground border border-border shadow-xs p-4 rounded-2xl max-w-[80%] mr-auto flex items-center gap-3 text-sm"
  >
    <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
      <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-300" />
    </div>
    <span className="text-muted-foreground">Generating response...</span>
  </motion.div>
));

LoadingMessage.displayName = 'LoadingMessage';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  hasInteracted: boolean;
  onSuggestionClick?: (suggestion: string) => void;
}

export const ChatMessages = ({
  messages,
  isGenerating,
  hasInteracted,
  onSuggestionClick,
}: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages.length]);

  return (
    <div className="flex-1 relative bg-background min-h-0 overflow-hidden">
      <AnimatePresence>
        {!hasInteracted && (
          <WelcomeOverlay onSuggestionClick={onSuggestionClick} />
        )}
      </AnimatePresence>

      <ScrollArea className="h-full w-full">
        <div className="p-6 space-y-6 pb-4 min-h-full">
          {messages?.map((message, index) => (
            <MessageBubble key={index} message={message} index={index} />
          ))}
          {isGenerating && <LoadingMessage />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};
