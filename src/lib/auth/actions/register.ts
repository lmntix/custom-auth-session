'use server';

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { Paths } from '@/lib/constants';
import { sendMail, EmailTemplate } from '@/lib/email';
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { generateEmailVerificationCode } from './generate-email-verification';
import { ActionResult } from '@/lib/auth/types';

/**
 * Registers a new user with email and password
 * @returns ActionResult with success status and message
 */
export async function signup(email: string, password: string): Promise<ActionResult> {
  const [existingUser] = await db.select({ email: users.email }).from(users).where(eq(users.email, email)).limit(1);

  if (existingUser) {
    return {
      success: false,
      message: 'Cannot create account with that email'
    };
  }

  const userId = crypto.randomUUID();
  const hashedPassword = await bcrypt.hash(password, 10);
  
  await db.insert(users).values({
    id: userId,
    email,
    hashedPassword,
  });

  const verificationCode = await generateEmailVerificationCode(userId, email);
  await sendMail(email, EmailTemplate.EmailVerification, { code: verificationCode });
  
  const token = generateSessionToken();
  const session = await createSession(token, userId);
  await setSessionTokenCookie(token, session.expiresAt);
  
  redirect(Paths.VerifyEmail);
  
  // This return is only for TypeScript - redirect() will prevent this from executing
  return {
    success: true,
    message: 'Account created successfully'
  };
}