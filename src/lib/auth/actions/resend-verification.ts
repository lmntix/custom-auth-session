'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { emailVerificationCodes } from '@/db/schema';
import { sendMail, EmailTemplate } from '@/lib/email';
import { isWithinExpirationDate } from '@/utils/date';
import { generateEmailVerificationCode } from './generate-email-verification';
import { ActionResult } from '@/lib/auth/types';

/**
 * Resends the email verification code to the user's email
 * @param userId The user ID to send the verification code to
 * @param email The email to send the verification code to
 * @returns ActionResult with success status and message
 */
export async function resendVerificationEmail(userId: string, email: string): Promise<ActionResult> {
  const [lastSent] = await db
    .select({ expiresAt: emailVerificationCodes.expiresAt })
    .from(emailVerificationCodes)
    .where(eq(emailVerificationCodes.userId, userId))
    .limit(1);

  if (lastSent && isWithinExpirationDate(lastSent.expiresAt)) {
    return {
      success: false,
      message: `Please wait ${timeFromNow(lastSent.expiresAt)} before resending`
    };
  }
  
  const verificationCode = await generateEmailVerificationCode(userId, email);
  await sendMail(email, EmailTemplate.EmailVerification, { code: verificationCode });

  return { 
    success: true,
    message: 'Verification email has been sent'
  };
}

// Helper function from the original code
function timeFromNow(time: Date): string {
  const now = new Date();
  const diff = time.getTime() - now.getTime();
  const minutes = Math.floor(diff / 1000 / 60);
  const seconds = Math.floor(diff / 1000) % 60;
  return `${minutes}m ${seconds}s`;
}