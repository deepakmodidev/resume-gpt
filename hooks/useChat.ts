import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { ChatMessage, InitialChatData } from "@/lib/types";
import { ResumeData } from "@/lib/types";
import { EMPTY_RESUME } from "@/lib/constants/templates";
import { apiRequest } from "@/lib/api-client";
import { API_ENDPOINTS, STORAGE_KEYS, TIMEOUTS } from "@/lib/constants";
import { logger } from "@/lib/logger";

interface UseChatProps {
  initialChatData?: InitialChatData;
  onApiKeyError?: () => void;
}

export const useChat = ({ initialChatData, onApiKeyError }: UseChatProps) => {
  const initialState = useMemo(() => {
    if (!initialChatData) {
      return {
        messages: [],
        resumeData: EMPTY_RESUME,
        showResume: false,
        hasInteracted: false,
      };
    }

    const { messages: chatMessages, resumeData: chatResumeData } =
      initialChatData;

    // Helper function to sanitize resume data
    const sanitizeResumeData = (data: any): ResumeData => {
      if (!data || typeof data !== "object") {
        logger.warn("Invalid resume data, using EMPTY_RESUME:", data);
        return EMPTY_RESUME;
      }

      // Ensure all required fields exist and are proper types
      const sanitized = {
        name: typeof data.name === "string" ? data.name : "",
        title: typeof data.title === "string" ? data.title : "",
        contact:
          data.contact && typeof data.contact === "object"
            ? {
                email:
                  typeof data.contact.email === "string"
                    ? data.contact.email
                    : "",
                phone:
                  typeof data.contact.phone === "string"
                    ? data.contact.phone
                    : "",
                location:
                  typeof data.contact.location === "string"
                    ? data.contact.location
                    : "",
                linkedin:
                  typeof data.contact.linkedin === "string"
                    ? data.contact.linkedin
                    : "",
                github:
                  typeof data.contact.github === "string"
                    ? data.contact.github
                    : "",
                blogs:
                  typeof data.contact.blogs === "string"
                    ? data.contact.blogs
                    : "",
              }
            : EMPTY_RESUME.contact,
        summary: typeof data.summary === "string" ? data.summary : "",
        experience: Array.isArray(data.experience)
          ? data.experience.map((exp: any) => ({
              title: typeof exp?.title === "string" ? exp.title : "",
              company: typeof exp?.company === "string" ? exp.company : "",
              location: typeof exp?.location === "string" ? exp.location : "",
              period: typeof exp?.period === "string" ? exp.period : "",
              description:
                typeof exp?.description === "string"
                  ? exp.description
                  : exp?.description
                    ? JSON.stringify(exp.description)
                    : "",
            }))
          : EMPTY_RESUME.experience,
        education: Array.isArray(data.education)
          ? data.education.map((edu: any) => ({
              degree: typeof edu?.degree === "string" ? edu.degree : "",
              institution:
                typeof edu?.institution === "string" ? edu.institution : "",
              year: typeof edu?.year === "string" ? edu.year : "",
            }))
          : EMPTY_RESUME.education,
        skills: Array.isArray(data.skills)
          ? data.skills.map((skill: any) =>
              typeof skill === "string" ? skill : String(skill),
            )
          : EMPTY_RESUME.skills,
        projects: Array.isArray(data.projects)
          ? data.projects.map((proj: any) => ({
              name: typeof proj?.name === "string" ? proj.name : "",
              description:
                typeof proj?.description === "string"
                  ? proj.description
                  : proj?.description
                    ? JSON.stringify(proj.description)
                    : "",
              techStack: Array.isArray(proj?.techStack)
                ? proj.techStack.map((tech: any) =>
                    typeof tech === "string" ? tech : String(tech),
                  )
                : [],
            }))
          : EMPTY_RESUME.projects,
        achievements: Array.isArray(data.achievements)
          ? data.achievements.map((ach: any) =>
              typeof ach === "string" ? ach : String(ach),
            )
          : EMPTY_RESUME.achievements,
      };

      return sanitized;
    };

    // Helper function to validate ChatMessage structure
    const isValidChatMessage = (msg: any): msg is ChatMessage => {
      return (
        msg &&
        typeof msg === "object" &&
        "role" in msg &&
        "parts" in msg &&
        (msg.role === "user" || msg.role === "model") &&
        Array.isArray(msg.parts) &&
        msg.parts.length > 0 &&
        msg.parts.every(
          (part) =>
            part &&
            typeof part === "object" &&
            "text" in part &&
            typeof part.text === "string",
        )
      );
    };

    // Safely process messages with proper type checking
    let processedMessages: ChatMessage[] = [];
    if (Array.isArray(chatMessages)) {
      logger.debug("Raw chatMessages:", chatMessages);

      const flatMessages = chatMessages.flat();
      logger.debug("Flattened messages:", flatMessages);

      processedMessages = flatMessages.filter(isValidChatMessage);

      // Debug log for invalid messages
      const invalidMessages = flatMessages.filter(
        (msg) => !isValidChatMessage(msg),
      );

      if (invalidMessages.length > 0) {
        logger.warn("Found invalid message structures:", invalidMessages);
        logger.warn(
          "These messages will be filtered out to prevent rendering errors",
        );
      }

      logger.debug("Valid processed messages:", processedMessages);
    }

    return {
      messages: processedMessages,
      resumeData: sanitizeResumeData(chatResumeData),
      hasInteracted: false, // Always false on load - only true after user action in this session
    };
  }, [initialChatData]);

  const [messages, setMessages] = useState<ChatMessage[]>(
    initialState.messages,
  );
  const [resumeData, setResumeData] = useState<ResumeData>(
    initialState.resumeData,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(
    initialState.hasInteracted,
  );

  const cleanMessage = useCallback((text: string) => {
    return text.replace(/Resume Data: {.*}/s, "").trim();
  }, []);

  const sendMessage = useCallback(
    async (message: string, chatId: string) => {
      if (!message.trim() || isGenerating) return;

      // Validate chatId
      if (!chatId) {
        logger.error("❌ Missing chatId");

        // Add error message to the chat instead of silently failing
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            parts: [
              {
                text: "⚠️ Error: Session ID is missing. Please refresh the page and try again.",
              },
            ],
          },
        ]);
        return;
      }

      const cleanedText = cleanMessage(message);
      const userMessage: ChatMessage = {
        role: "user",
        parts: [{ text: cleanedText }],
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsGenerating(true);

      if (!hasInteracted) setHasInteracted(true);
      if (!hasInteracted) setHasInteracted(true);

      try {
        // Get user's API key from localStorage
        const userApiKey = localStorage.getItem(STORAGE_KEYS.GROQ_API_KEY);

        const data = await apiRequest<any>(API_ENDPOINTS.CHAT, {
          method: "POST",
          body: JSON.stringify({
            history: [...messages, userMessage],
            resumeData,
            chatId,
            userApiKey, // Include user's API key if available
          }),
          timeout: TIMEOUTS.AI_RESPONSE,
        });

        if (!data.response) {
          throw new Error("Invalid response format from server");
        }

        const { response: botRaw } = data;
        const parsed = botRaw;

        if (!parsed || !parsed.acknowledgement) {
          throw new Error("Missing acknowledgement in response");
        }

        const botMessage: ChatMessage = {
          role: "model",
          parts: [{ text: parsed.acknowledgement }],
        };

        setMessages((prev) => [...prev, botMessage]);

        // Only update resume data if updatedSection exists and is an object
        if (
          parsed.updatedSection &&
          typeof parsed.updatedSection === "object"
        ) {
          setResumeData((prev) => ({
            ...prev,
            ...parsed.updatedSection,
          }));
        }
      } catch (error: unknown) {
        logger.error("AI message error", error as Error);
        let errorMessage = "⚠️ AI response parsing failed.";

        if (error instanceof Error) {
          if (error.name === "AbortError") {
            errorMessage = "Request timed out. Please try again.";
          } else {
            // Use the actual error message for better debugging
            errorMessage = error.message || "An unexpected error occurred.";
          }
        }

        // Check for specific API Key errors to trigger the modal
        const errorString =
          errorMessage.toLowerCase() +
          (error instanceof Error ? error.message.toLowerCase() : "");

        if (
          errorString.includes("api key") ||
          errorString.includes("expired") ||
          errorString.includes("quota") ||
          errorString.includes("429") ||
          errorString.includes("400 bad request")
        ) {
          errorMessage =
            "The AI service is currently unavailable due to an API key or quota issue.";
          if (onApiKeyError) onApiKeyError();

          // Add a persistent message to the chat history so it saves to the DB
          setMessages((prev) => [
            ...prev,
            {
              role: "model",
              parts: [
                {
                  text: "⚠️ API limit reached or key is invalid. Please add your own Groq API key in settings and try again.",
                },
              ],
            },
          ]);
        }

        // Show toast for immediate visibility
        toast.error(errorMessage);

        // Optional: Remove the user's last message if you want to "undo" the failed attempt?
        // For now, keeping it is better so they can copy-paste it again.
      } finally {
        setIsGenerating(false);
      }
    },
    [
      messages,
      resumeData,
      isGenerating,
      hasInteracted,
      hasInteracted,
      cleanMessage,
    ],
  );

  const updateResumeData = useCallback(
    (updater: (data: ResumeData) => void) => {
      setResumeData((prev) => {
        const updated = JSON.parse(JSON.stringify(prev));
        updater(updated);
        return updated;
      });
    },
    [],
  );

  return {
    messages,
    resumeData,
    isGenerating,
    hasInteracted,
    sendMessage,
    updateResumeData,
    setHasInteracted,
  };
};
