"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

export default function PopupSignInPage() {
  const { status } = useSession();
  const hasAttemptedSignIn = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated" && !hasAttemptedSignIn.current) {
      hasAttemptedSignIn.current = true;
      void signIn("google");
    } else if (status === "authenticated") {
      window.close();
    }
  }, [status]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      {/* Simple Spinner Loader */}
      <div className="relative flex items-center justify-center w-8 h-8">
        <div className="absolute inset-0 border-2 border-primary/20 rounded-full"></div>
        <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
