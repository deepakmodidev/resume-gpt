"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { logger } from "@/lib/logger";

import { ResumeForm } from "@/components/resume/ResumeForm";
import { ResumeDisplay } from "@/components/resume/ResumeDisplay";
import { saveResume } from "@/app/actions/save-resume";
import { MessageSquare, Edit, Loader2, Check, CircleCheckBig } from "lucide-react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ApiKeyNotification } from "@/components/ApiKeyNotification";
import { GeminiApiKeyModal } from "@/components/GeminiApiKeyModal";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { useChat } from "@/hooks/useChat";
import { STORAGE_KEYS } from "@/lib/constants";
import { ANIMATION_VARIANTS } from "@/constants/resume";
import { Sparkles, X } from "lucide-react";
import type { Session } from "next-auth";
import type { JsonValue } from "@prisma/client/runtime/library";
import type { ResumeData } from "@/lib/types";

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
  // Note: Auth is already handled in the server component (app/builder/[id]/page.tsx)
  // This is a safety fallback - should never actually render null
  if (!session) {
    return null;
  }

  const { id: paramsId } = params;
  // Only generate fallback ID when actually needed (lazy initialization)
  const [fallbackId, setFallbackId] = useState<string | null>(null);
  const id = paramsId || fallbackId || "";

  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });
  const [inputValue, setInputValue] = useState("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showGenAINotification, setShowGenAINotification] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem(STORAGE_KEYS.GENAI_DISMISSED);
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
    setHasInteracted,
  } = useChat({ initialChatData });

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error" | "idle">(() => {
    // Show "saved" on load if there's existing data
    return initialChatData ? "saved" : "idle";
  });
  const [activeTab, setActiveTab] = useState<"chat" | "edit">("chat");
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);

  useEffect(() => {
    if (!autoSaveEnabled) return;
    if (!id || !resumeData || !hasInteracted) return;

    setSaveStatus("saving");
    const timer = setTimeout(async () => {
      try {
        await saveResume(id, resumeData);
        setSaveStatus("saved");
      } catch (error) {
        logger.error("Auto-save failed:", error);
        setSaveStatus("error");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [resumeData, id, hasInteracted, autoSaveEnabled]);


  // Generate and set fallback ID only when user interacts without an existing ID
  useEffect(() => {
    if (!paramsId && hasInteracted && !fallbackId) {
      const newId = uuidv4();
      setFallbackId(newId);
      router.replace(`/builder/${newId}`, { scroll: false });
    }
  }, [paramsId, hasInteracted, fallbackId, router]);

  const handleSendMessage = useCallback(
    (message: string) => {
      // Generate ID if needed before sending message
      let chatId = id;
      if (!chatId) {
        chatId = uuidv4();
        setFallbackId(chatId);
        router.replace(`/builder/${chatId}`, { scroll: false });
      }

      setAutoSaveEnabled(true);
      sendMessage(message, chatId);
      setInputValue(""); // Clear input after sending
    },
    [sendMessage, id, router]
  );

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputValue(suggestion);
  }, []);

  const handleResumeDataChange = useCallback(
    (updater: (data: ResumeData) => void) => {
      // Mark as interacted when user manually edits the form
      if (!hasInteracted) {
        setHasInteracted(true);
      }
      setAutoSaveEnabled(true);
      updateResumeData(updater);
    },
    [hasInteracted, updateResumeData, setHasInteracted]
  );

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem(
        STORAGE_KEYS.SIDEBAR_COLLAPSED,
        JSON.stringify(newState)
      );
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
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.GENAI_DISMISSED, "true");
    }
  }, []);

  // Add keyboard shortcut for toggling sidebar (Ctrl+\)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "\\") {
        e.preventDefault();
        toggleSidebarCollapse();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebarCollapse]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar - handles both mobile and desktop internally */}
      <ChatSidebar
        session={session}
        currentChatId={id}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-h-0">
        {/* Chat and Resume Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          <div
            className={`flex flex-col h-full min-h-0 transition-all duration-300 ${hasInteracted ? "md:w-2/5" : "md:w-full"}`}
          >
            <div className="flex flex-col h-full">
              {hasInteracted && (
              <div className="px-4 py-2 border-b flex items-center justify-between gap-4">
                <div className="grid flex-1 grid-cols-2 h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === "chat" ? "bg-background text-foreground shadow-sm" : ""
                      }`}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" /> Chat
                  </button>
                  <button
                    onClick={() => setActiveTab("edit")}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === "edit" ? "bg-background text-foreground shadow-sm" : ""
                      }`}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </button>
                </div>
                <div className="flex items-center gap-1 w-[110px] justify-end shrink-0">
                    {saveStatus !== "idle" && (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${saveStatus === "saved"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : saveStatus === "saving"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-red-100 text-red-700"
                    }`}>
                    {saveStatus === "saving" && <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>}
                    {saveStatus === "saved" && <><CircleCheckBig className="w-4 h-4" /> Saved</>}
                    {saveStatus === "error" && "Error"}
                  </div>
                    )}
                </div>
              </div>
              )}

              {!hasInteracted ? (
                <div className="flex-1 flex-col min-h-0 mt-0 overflow-hidden flex">
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
              ) : (
                <>
              <div className={`flex-1 flex-col min-h-0 mt-0 overflow-hidden ${activeTab === "chat" ? "flex" : "hidden"}`}>
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

              <div className={`flex-1 min-h-0 mt-0 overflow-hidden h-full flex-col ${activeTab === "edit" ? "flex" : "hidden"}`}>
                    <ResumeForm data={resumeData} handleDataChange={handleResumeDataChange} />
              </div>
                </>
              )}
            </div>
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
                      handleDataChange={handleResumeDataChange}
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
            <div className="bg-linear-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg border border-white/20">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-white/20 rounded-full">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">
                    🚀 New GenAI Features!
                  </h4>
                  <p className="text-xs opacity-90 mb-2">
                    Check out the new ATS Analysis tab for AI-powered resume
                    optimization with RAG technology!
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
}
