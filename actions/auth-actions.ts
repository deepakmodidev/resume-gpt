'use server';

import { signIn } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function handleGoogleSignIn() {
  const id = uuidv4();
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  await signIn('google', { redirectTo: `${baseUrl}/builder/${id}` });
}
