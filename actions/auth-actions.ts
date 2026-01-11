"use server";

import { signIn } from "@/lib/auth";

export async function handleGoogleSignIn() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  await signIn("google", { redirectTo: `${baseUrl}/builder/new` });
}
