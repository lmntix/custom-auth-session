'use server';

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { passwordResetTokens, users } from '@/db/schema';
import { Paths } from '@/lib/constants';
import { isWithinExpirationDate } from '@/utils/date';
import bcrypt from 'bcryptjs';
import { resetPasswordSchema, ActionResult } from '@/lib/auth/types';

/**
 * Resets a user's password using a valid reset token
 * @param token The password reset token
 * @param password The new password
 * @returns ActionResult with success status and message
 */
export async function resetPassword(token: string, password: string): Promise<ActionResult> {
  // Validate password
  const validPassword = resetPasswordSchema.shape.password.safeParse(password);
  if (!validPassword.success) {
    return {
      success: false,
      message: 'Password must be at least 8 characters long'
    };
  }

  // Find and validate token
  const [resetToken] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.id, token))
    .limit(1);

  if (!resetToken) {
    return {
      success: false,
      message: 'Invalid or expired password reset token'
    };
  }

  if (!isWithinExpirationDate(resetToken.expiresAt)) {
    // Delete expired token
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, token));
    return {
      success: false,
      message: 'Password reset token has expired'
    };
  }

  // Update password and delete token
  const hashedPassword = await bcrypt.hash(password, 10);
  
  await db.transaction(async tx => {
    await tx.update(users).set({ hashedPassword }).where(eq(users.id, resetToken.userId));
    await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.id, token));
  });

  redirect(Paths.Login);
  
  // This return is only for TypeScript - redirect() will prevent this from executing
  return {
    success: true,
    message: 'Password has been reset successfully'
  };
}