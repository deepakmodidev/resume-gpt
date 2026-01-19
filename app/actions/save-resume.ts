"use server";

import { auth } from "@/lib/auth";
import db from "@/prisma/prisma";
import { ResumeData } from "@/lib/types";
import { logger } from "@/lib/logger";

export async function saveResume(chatId: string, resumeData: ResumeData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    // Check if chat exists
    const existingChat = await db.chat.findUnique({
      where: { id: chatId, userId: session.user.id },
    });

    if (existingChat) {
      // Update existing chat
      await db.chat.update({
        where: { id: chatId, userId: session.user.id },
        data: { resumeData: resumeData as any },
      });
    } else {
      // Create new chat if it doesn't exist (e.g., when user edits form without chatting)
      const title = resumeData.name
        ? `${resumeData.name}'s Resume`
        : resumeData.title
          ? `Resume for ${resumeData.title}`
          : "New Resume";

      await db.chat.create({
        data: {
          id: chatId,
          userId: session.user.id,
          title,
          messages: [],
          resumeData: resumeData as any,
          resumeTemplate: "classic",
        },
      });
    }

    return { success: true };
  } catch (error) {
    logger.error("Failed to save resume:", error);
    return { error: "Failed to save" };
  }
}
