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
    </div>
  );
}
