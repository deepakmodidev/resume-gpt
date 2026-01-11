"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ThemeProvider } from "@/components/ui/theme-provider";

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we know for sure the user is not authenticated
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  // Show nothing while loading to prevent flash
  if (status === "loading") {
    return (
      <main suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-screen items-center justify-center bg-background">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </ThemeProvider>
      </main>
    );
  }

  // Don't render children if not authenticated
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <main suppressHydrationWarning>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </main>
  );
}
