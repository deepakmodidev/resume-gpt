'use server';

import { auth } from '@/app/api/auth/[...nextauth]/route';

export async function checkSession() {
  const session = await auth();
  return !!session?.user;
}
