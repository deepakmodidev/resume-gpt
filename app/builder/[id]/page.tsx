import { auth } from "@/lib/auth";
import { Builder } from "@/components/Builder"; // Import the named export instead of default
import db from "@/prisma/prisma";
import { redirect } from "next/navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Cached function for fetching chat data
async function getChatData(chatId: string, userId: string) {
  "use cache";
  
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
  params: Promise<{ id: string }>;
}) {
  const session = await auth(); // Still needed for auth check and potentially BuilderPage
  const { id } = await params; // Destructure the id here after params is ready

  // It's good practice to double-check auth even if layout does
  if (!session?.user?.id) {
    redirect("/");
  }

  // Handle "new" route - don't try to fetch from database
  let chat = null;
  if (id !== "new") {
    // --- Fetch ONLY the specific chat data here using cached function ---
    chat = await getChatData(id, session.user.id);
  }

  // Ensure we have a valid ID to pass to the Builder
  const validParams = {
    id: id === "new" ? "" : id, // Pass empty string for new chats
  };

  return (
    <ErrorBoundary>
      <Builder session={session} params={validParams} initialChatData={chat} />
    </ErrorBoundary>
  );
}
