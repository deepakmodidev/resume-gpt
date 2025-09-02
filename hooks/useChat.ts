import { useState, useCallback, useMemo } from "react";
import { ChatMessage } from "@/lib/types";
import { ResumeData } from "@/lib/types";
import { EMPTY_RESUME } from "@/constants/resume";

interface UseChatProps {
  initialChatData?: any;
}

export const useChat = ({ initialChatData }: UseChatProps) => {
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
        console.warn("Invalid resume data, using EMPTY_RESUME:", data);
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
      console.log("Raw chatMessages:", chatMessages);

      const flatMessages = chatMessages.flat();
      console.log("Flattened messages:", flatMessages);

      processedMessages = flatMessages.filter(isValidChatMessage);

      // Debug log for invalid messages
      const invalidMessages = flatMessages.filter(
        (msg) => !isValidChatMessage(msg),
      );

      if (invalidMessages.length > 0) {
        console.warn("Found invalid message structures:", invalidMessages);
        console.warn(
          "These messages will be filtered out to prevent rendering errors",
        );
      }

      console.log("Valid processed messages:", processedMessages);
    }

    return {
      messages: processedMessages,
      resumeData: sanitizeResumeData(chatResumeData),
      showResume: processedMessages.length > 0,
      hasInteracted: processedMessages.length > 0,
    };
  }, [initialChatData]);

  const [messages, setMessages] = useState<ChatMessage[]>(
    initialState.messages,
  );
  const [resumeData, setResumeData] = useState<ResumeData>(
    initialState.resumeData,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResume, setShowResume] = useState(initialState.showResume);
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
        console.error("❌ Missing chatId");

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
      if (!showResume) setShowResume(true);

      try {
        // Get user's API key from localStorage
        const userApiKey = localStorage.getItem("gemini-api-key");

        // Create AbortController for timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            history: [...messages, userMessage],
            resumeData,
            chatId,
            userApiKey, // Include user's API key if available
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Status: ${response.status}`);
        }

        const data = await response.json();

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
      } catch (error) {
        console.error("❌ AI message error:", error);
        let errorMessage = "⚠️ AI response parsing failed.";

        if (error.name === "AbortError") {
          errorMessage = "Request timed out. Please try again.";
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        setMessages((prev) => [
          ...prev,
          { role: "model", parts: [{ text: `⚠️ Error: ${errorMessage}` }] },
        ]);
      } finally {
        setIsGenerating(false);
      }
    },
    [
      messages,
      resumeData,
      isGenerating,
      hasInteracted,
      showResume,
      cleanMessage,
    ],
  );

  const updateResumeData = useCallback(
    (updater: (data: ResumeData) => void) => {
      setResumeData((prev) => {
        const updated = { ...prev };
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
    showResume,
    hasInteracted,
    sendMessage,
    updateResumeData,
  };
};
