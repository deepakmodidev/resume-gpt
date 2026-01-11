import { auth } from "@/lib/auth";
import { Builder } from "@/components/Builder"; // Import the named export instead of default
import db from "@/prisma/prisma";
import { redirect } from "next/navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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

  // --- Fetch ONLY the specific chat data here ---
  const chat = await db.chat.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
    select: {
      id: true,
      title: true,
      messages: true,
      resumeData: true,
      resumeTemplate: true,
    },
  });

  // Ensure we have a valid ID to pass to the Builder
  const validParams = {
    id: id || "", // Ensure id is never undefined
  };

  return (
    <ErrorBoundary>
      <Builder session={session} params={validParams} initialChatData={chat} />
    </ErrorBoundary>
  );
}
