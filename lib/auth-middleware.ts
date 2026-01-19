import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

/**
 * Auth middleware helper to reduce duplication across API routes
 * Returns session if authenticated, or error response if not
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      authorized: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    authorized: true as const,
    session,
    userId: session.user.id,
  };
}

/**
 * Type guard to check if auth result is authorized
 */
export function isAuthorized(
  result: Awaited<ReturnType<typeof requireAuth>>,
): result is { authorized: true; session: Session; userId: string } {
  return result.authorized;
}
