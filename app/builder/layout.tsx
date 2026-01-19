import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Builder | ResumeGPT",
  description: "Build your professional resume with AI assistance",
};

export default async function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check - much faster than client-side!
  const session = await auth();

  if (!session?.user?.id) {
    // Redirect to homepage with a callbackUrl to return after login
    redirect("/?signin=true");
  }

  return <>{children}</>;
}
