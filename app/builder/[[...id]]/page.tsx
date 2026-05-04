import { auth } from "@/lib/auth";
import { Builder } from "@/components/Builder"; // Import the named export instead of default
import db from "@/prisma/prisma";
import { redirect } from "next/navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Disable static generation for auth-protected routes
export const dynamic = "force-dynamic";

// Fetch chat data
async function getChatData(chatId: string, userId: string) {
  return await db.chat.findUnique({
    where: {
      id: chatId,
      userId,
    },
    select: {
      id: true,
      title: true,
      messages: true,
      resumeData: true,
      resumeTemplate: true,
    },
  });
}

export default async function page({
  params,
}: {
  params: Promise<{ id?: string[] }>;
}) {
  const session = await auth(); // Still needed for auth check and potentially BuilderPage
  const resolvedParams = await params;

  // Extract ID from catch-all array (e.g. ['uuid'] or undefined)
  const chatId = resolvedParams.id?.[0] || "";

  // Explicitly redirect /builder/new to /builder to enforce canonical URL
  if (chatId === "new") {
    redirect("/builder");
  }

  // We no longer hard-redirect here to allow the "Teaser" pattern.
  // The Builder component and its sub-actions will handle auth prompts.
  const userId = session?.user?.id;

  // Handle new chat (empty root) - don't try to fetch from database
  let chat = null;
  // If specific ID, fetch data
  if (chatId) {
    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(chatId)) {
      // Invalid ID format, redirect to new chat
      redirect("/builder");
    }

    // --- Fetch ONLY the specific chat data here using cached function ---
    // Safety check: Ensure we have a session and user ID before fetching
    if (!session?.user?.id) {
      // If we have a chatId but no session, redirect to home with sign-in trigger
      redirect("/?signin=true");
    }

    chat = await getChatData(chatId, session.user.id);

    // If chat doesn't exist in DB, redirect to new chat
    if (!chat) {
      redirect("/builder");
    }
  }

  // Ensure we have a valid ID to pass to the Builder
  const validParams = {
    id: chatId, // Pass ID directly (empty string for root)
  };

  return (
    <ErrorBoundary>
      <Builder
        key={chatId || "new-chat"}
        session={session}
        params={validParams}
        initialChatData={chat}
      />
    </ErrorBoundary>
  );
}
