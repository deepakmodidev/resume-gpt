'use server';

import { signIn } from '@/app/api/auth/[...nextauth]/route';
import { v4 as uuidv4 } from 'uuid';

export async function handleGoogleSignIn() {
  const id = uuidv4();
  await signIn('google', { redirectTo: `/builder/${id}` });
}
