'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { sendMail, EmailTemplate } from '@/lib/email';
import { env } from '@/env';
import { generatePasswordResetToken } from './generate-password-reset';
import { ActionResult } from '@/lib/auth/types';

/**
 * Sends a password reset link to the user's email
 * @param email The email address to send the password reset link to
 * @returns ActionResult with success status and message
 */
export async function sendPasswordResetLink(email: string): Promise<ActionResult> {
  const validEmail = z.string().trim().email().safeParse(email);

  if (!validEmail.success) {
    return {
      success: false,
      message: 'Provided email is invalid'
    };
  }

  const normalizedEmail = validEmail.data;

  const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

  if (!user || !user.emailVerified) {
    return {
      success: false,
      message: 'Provided email is invalid'
    };
  }

  const verificationToken = await generatePasswordResetToken(user.id);
  const verificationLink = `${env.NEXT_PUBLIC_APP_URL}/reset-password/${verificationToken}`;

  await sendMail(user.email, EmailTemplate.PasswordReset, { link: verificationLink });
  
  return {
    success: true,
    message: 'Password reset link has been sent to your email'
  };
}
