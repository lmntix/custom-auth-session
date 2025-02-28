'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { passwordResetTokens } from '@/db/schema';
import { createDate, TimeSpan } from '@/utils/date';

/**
 * Generates a password reset token and stores it in the database
 * @param userId The user ID to associate with the reset token
 * @returns The generated reset token
 */
export async function generatePasswordResetToken(userId: string): Promise<string> {
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  const tokenId = crypto.randomUUID();
  await db.insert(passwordResetTokens).values({
    id: tokenId,
    userId,
    expiresAt: createDate(new TimeSpan(2, 'h')),
  });
  return tokenId;
}