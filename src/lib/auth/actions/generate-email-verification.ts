'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { emailVerificationCodes } from '@/db/schema';
import { createDate, TimeSpan } from '@/utils/date';

/**
 * Generates a 6-digit email verification code and stores it in the database
 * @param userId The user ID to associate with the verification code
 * @param email The email to associate with the verification code
 * @returns The generated verification code
 */
export async function generateEmailVerificationCode(userId: string, email: string): Promise<string> {
  await db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.userId, userId));
  const code = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
  await db.insert(emailVerificationCodes).values({
    userId,
    email,
    code,
    expiresAt: createDate(new TimeSpan(10, 'm')), // 10 minutes
  });
  return code;
}