"use server";

import { auth } from "@/lib/auth";
import db from "@/prisma/prisma";
import { ResumeData } from "@/lib/types";
import { logger } from "@/lib/logger";

const DEFAULT_CHAT_TITLE = "New Resume";

function getStructuredTitle(resumeData: ResumeData) {
  const name = resumeData.name?.trim();
  const roleTitle = resumeData.title?.trim();

  if (name) {
    return `${name}'s Resume`;
  }

  if (roleTitle) {
    return `Resume for ${roleTitle}`;
  }

  return null;
}

function getFirstUserSnippet(messages?: any[]) {
  const firstUserText = messages
    ?.find((msg: any) => msg?.role === "user")
    ?.parts?.find((part: any) => typeof part?.text === "string")?.text
    ?.replace(/\s+/g, " ")
    ?.trim();

  if (!firstUserText) {
    return null;
  }

  const snippet = firstUserText.slice(0, 48).trim();
  return snippet.length < firstUserText.length ? `${snippet}...` : snippet;
}

function buildChatTitle(resumeData: ResumeData, messages?: any[]) {
  const structuredTitle = getStructuredTitle(resumeData);
  if (structuredTitle) {
    return structuredTitle;
  }

  const snippetTitle = getFirstUserSnippet(messages);
  if (snippetTitle) {
    return snippetTitle;
  }

  return DEFAULT_CHAT_TITLE;
}

export async function saveResume(
  chatId: string,
  resumeData: ResumeData,
  messages?: any[],
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    // Check if chat exists and belongs to user
    const existingChat = await db.chat.findFirst({
      where: { id: chatId, userId: session.user.id },
    });

    if (existingChat) {
      const nextTitle = buildChatTitle(resumeData, messages);
      const structuredTitle = getStructuredTitle(resumeData);
      const currentSnippetTitle = getFirstUserSnippet(messages);
      const shouldUpdateTitle =
        (existingChat.title === DEFAULT_CHAT_TITLE &&
          nextTitle !== DEFAULT_CHAT_TITLE) ||
        (Boolean(structuredTitle) &&
          Boolean(currentSnippetTitle) &&
          existingChat.title === currentSnippetTitle);

      // Update existing chat
      await db.chat.update({
        where: { id: chatId },
        data: {
          resumeData: resumeData as any,
          ...(messages ? { messages: messages as any } : {}),
          ...(shouldUpdateTitle ? { title: nextTitle } : {}),
        },
      });
    } else {
      // Create new chat - handle race condition
      const title = buildChatTitle(resumeData, messages);

      try {
        await db.chat.create({
          data: {
            id: chatId,
            userId: session.user.id,
            title,
            messages: (messages || []) as any,
            resumeData: resumeData as any,
            resumeTemplate: "classic",
          },
        });
      } catch (error: unknown) {
        // If unique constraint violation, it means chat was created by API route just now
        if (
          error instanceof Error &&
          error.message.includes("Unique constraint")
        ) {
          await db.chat.update({
            where: { id: chatId },
            data: {
              resumeData: resumeData as any,
              ...(messages ? { messages: messages as any } : {}),
            },
          });
        } else {
          throw error;
        }
      }
    }

    return { success: true };
  } catch (error) {
    logger.error("Failed to save resume:", error);
    return { error: "Failed to save" };
  }
}
