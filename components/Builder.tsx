'use client';

import { useCallback, useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResumeDisplay } from '@/components/resume/ResumeDisplay';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ApiKeyNotification } from '@/components/ApiKeyNotification';
import { GeminiApiKeyModal } from '@/components/GeminiApiKeyModal';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChat } from '@/hooks/useChat';
import { ANIMATION_VARIANTS } from '@/constants/resume';
import { Sparkles, X } from 'lucide-react';
import type { Session } from 'next-auth';
import type { JsonValue } from '@prisma/client/runtime/library';

export interface BuilderProps {
  session: Session;
  params: { id: string };
  initialChatData: {
    id: string;
    title: string;
    messages: JsonValue[];
    resumeData?: JsonValue;
    resumeTemplate?: string | null;
  } | null;
}

export function Builder({ session, params, initialChatData }: BuilderProps) {
  if (!session) redirect('/');

  const { id: paramsId } = params;
  const [fallbackId] = useState(() => uuidv4()); // Generate a fallback ID if params.id is missing
  const id = paramsId || fallbackId;

  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebar-collapsed');
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });
  const [inputValue, setInputValue] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showGenAINotification, setShowGenAINotification] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('genai-notification-dismissed');
    }
    return true;
  });

  const {
    messages,
    resumeData,
    isGenerating,
    showResume,
    hasInteracted,
    sendMessage,
    updateResumeData,
  } = useChat({ initialChatData });

  const handleNewChat = useCallback(() => {
    const newChatId = uuidv4();
    router.push(`/builder/${newChatId}`);
  }, [router]);

  // If we don't have an ID from params, update the URL with the fallback ID
  useEffect(() => {
    if (id === fallbackId && paramsId !== id) {
      router.replace(`/builder/${id}`, { scroll: false });
    }
  }, [id, fallbackId, paramsId, router]);

  const handleSendMessage = useCallback(
    (message: string) => {
      if (!id) {
        console.error('Missing ID in Builder component');
        return;
      }

      sendMessage(message, id);
      setInputValue(''); // Clear input after sending
    },
    [sendMessage, id],
  );

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputValue(suggestion);
  }, []);

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
      return newState;
    });
  }, []);

  const handleApiKeyModal = useCallback(() => {
    setShowApiKeyModal(true);
  }, []);

  const handleApiKeyModalClose = useCallback(() => {
    setShowApiKeyModal(false);
  }, []);

  const dismissGenAINotification = useCallback(() => {
    setShowGenAINotification(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('genai-notification-dismissed', 'true');
    }
  }, []);

  // Add keyboard shortcut for toggling sidebar (Ctrl+\)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '\\') {
        e.preventDefault();
        toggleSidebarCollapse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebarCollapse]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <ChatSidebar
          session={session}
          onNewChat={handleNewChat}
          currentChatId={id}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-h-0">
        {/* Mobile Header with Sidebar */}
        <div className="md:hidden">
          <ChatSidebar
            session={session}
            onNewChat={handleNewChat}
            currentChatId={id}
            isCollapsed={false}
            onToggleCollapse={undefined}
          />
        </div>

        {/* Chat and Resume Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          <div
            className={`flex flex-col h-full min-h-0 transition-all duration-300 ${hasInteracted ? 'md:w-2/5' : 'md:w-full'}`}
          >
            <ChatMessages
              messages={messages}
              isGenerating={isGenerating}
              hasInteracted={hasInteracted}
              onSuggestionClick={handleSuggestionClick}
            />
            <ChatInput
              onSendMessage={handleSendMessage}
              isGenerating={isGenerating}
              inputValue={inputValue}
              onInputChange={setInputValue}
            />
          </div>

          <AnimatePresence>
            {hasInteracted && (
              <motion.div
                {...ANIMATION_VARIANTS.resume}
                className="hidden md:flex flex-col h-full min-h-0 overflow-hidden bg-card border-l border-border md:w-3/5"
              >
                <ScrollArea className="flex-1 min-h-0">
                  {showResume ? (
                    <ResumeDisplay
                      data={resumeData}
                      handleDataChange={updateResumeData}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-center p-10 text-muted-foreground">
                      <p>Your resume will appear here once generated</p>
                    </div>
                  )}
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* API Key Notification */}
      <ApiKeyNotification onManageKey={handleApiKeyModal} />

      {/* Gemini API Key Modal */}
      <GeminiApiKeyModal
        isOpen={showApiKeyModal}
        onClose={handleApiKeyModalClose}
      />

      {/* GenAI Feature Notification */}
      <AnimatePresence>
        {showGenAINotification && hasInteracted && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-4 right-4 z-50 max-w-sm"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg border border-white/20">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-white/20 rounded-full">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">🚀 New GenAI Features!</h4>
                  <p className="text-xs opacity-90 mb-2">
                    Check out the new ATS Analysis tab for AI-powered resume optimization with RAG technology!
                  </p>
                </div>
                <button
                  onClick={dismissGenAINotification}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
