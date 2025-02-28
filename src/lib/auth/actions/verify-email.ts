'use server';

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { emailVerificationCodes, users } from '@/db/schema';
import { Paths } from '@/lib/constants';
import {
  createSession,
  generateSessionToken,
  invalidateUserSessions,
  setSessionTokenCookie,
} from '@/lib/auth';
import { isWithinExpirationDate } from '@/utils/date';
import { ActionResult } from '@/lib/auth/types';

/**
 * Verifies a user's email with the provided verification code
 * @param userId The user ID to verify
 * @param code The verification code sent to the user's email
 * @returns ActionResult with success status and message
 */
export async function verifyEmail(userId: string, code: string): Promise<ActionResult> {
  if (typeof code !== 'string' || code.length !== 6) {
    return { 
      success: false,
      message: 'Invalid code' 
    };
  }

  const dbCode = await db.transaction(async tx => {
    const [item] = await tx
      .select()
      .from(emailVerificationCodes)
      .where(eq(emailVerificationCodes.userId, userId))
      .limit(1);
    if (item) {
      await tx.delete(emailVerificationCodes).where(eq(emailVerificationCodes.id, item.id));
    }
    return item;
  });

  if (!dbCode || dbCode.code !== code) return { 
    success: false,
    message: 'Invalid verification code' 
  };
  
  if (!isWithinExpirationDate(dbCode.expiresAt)) return { 
    success: false,
    message: 'Verification code expired' 
  };
  
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) {
    return { 
      success: false,
      message: 'User not found' 
    };
  }
  
  if (dbCode.email !== user.email) return { 
    success: false,
    message: 'Email does not match' 
  };

  await invalidateUserSessions(userId);
  await db.update(users).set({ emailVerified: true }).where(eq(users.id, userId));
  
  const token = generateSessionToken();
  const session = await createSession(token, userId);
  await setSessionTokenCookie(token, session.expiresAt);
  
  redirect(Paths.LoggedInRedirect);
  
  // This return is only for TypeScript - redirect() will prevent this from executing
  return {
    success: true,
    message: 'Email verified successfully'
  };
}