'use server';

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { Paths } from '@/lib/constants';
import { createSession, generateSessionToken, setSessionTokenCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { ActionResult, loginSchema } from '@/lib/auth/types';
import { actionClient } from '@/lib/safe-action';
import { z } from 'zod';

/**
 * Authenticates a user with email and password
 * @returns ActionResult with success status and message
 */
export const login = actionClient
  .schema(loginSchema)
  .metadata({ actionName: 'login' })
  .action(async ({ parsedInput }): Promise<ActionResult> => {
    const { email, password } = parsedInput;
    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!existingUser?.hashedPassword) {
      return {
        success: false,
        message: 'Incorrect email or password',
      };
    }

    const validPassword = await bcrypt.compare(password, existingUser.hashedPassword);
    if (!validPassword) {
      return {
        success: false,
        message: 'Incorrect email or password',
      };
    }

    const token = generateSessionToken();
    const session = await createSession(token, existingUser.id);
    await setSessionTokenCookie(token, session.expiresAt);

    redirect(Paths.LoggedInRedirect);

    // This return is only for TypeScript - redirect() will prevent this from executing
    return {
      success: true,
      message: 'Login successful',
    };
  });
