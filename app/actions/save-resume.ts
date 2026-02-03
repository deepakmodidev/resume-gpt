"use server";

import { auth } from "@/lib/auth";
import db from "@/prisma/prisma";
import { ResumeData } from "@/lib/types";
import { logger } from "@/lib/logger";

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
      // Update existing chat
      await db.chat.update({
        where: { id: chatId },
        data: {
          resumeData: resumeData as any,
          ...(messages ? { messages: messages as any } : {}),
        },
      });
    } else {
      // Create new chat - handle race condition
      const title = resumeData.name
        ? `${resumeData.name}'s Resume`
        : resumeData.title
          ? `Resume for ${resumeData.title}`
          : "New Resume";

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
