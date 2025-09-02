"use server";

import { auth } from "@/lib/auth";

export async function checkSession() {
  const session = await auth();
  return !!session?.user;
}
