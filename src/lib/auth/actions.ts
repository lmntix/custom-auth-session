'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { isWithinExpirationDate, TimeSpan, createDate } from '@/utils/date';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { loginSchema, signupSchema, type LoginInput, type SignupInput, resetPasswordSchema } from '@/lib/auth/types';
import { emailVerificationCodes, passwordResetTokens, users } from '@/db/schema';
import { sendMail, EmailTemplate } from '@/lib/email';
import { Paths } from '../constants';
import { env } from '@/env';
import {
  createSession,
  deleteSessionTokenCookie,
  generateSessionToken,
  invalidateSession,
  invalidateUserSessions,
  setSessionTokenCookie,
  validateRequest,
} from '@/lib/auth';
import bcrypt from 'bcryptjs';

export interface ActionResponse<T> {
  fieldError?: Partial<Record<keyof T, string | undefined>>;
  formError?: string;
}

export async function login(_: unknown, formData: FormData): Promise<ActionResponse<LoginInput>> {
  const obj = Object.fromEntries(formData.entries());

  const parsed = loginSchema.safeParse(obj);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      fieldError: {
        email: err.fieldErrors.email?.[0],
        password: err.fieldErrors.password?.[0],
      },
    };
  }

  const { email, password } = parsed.data;

  const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!existingUser?.hashedPassword) {
    return {
      formError: 'Incorrect email or password',
    };
  }

  const validPassword = await bcrypt.compare(password, existingUser.hashedPassword);
  if (!validPassword) {
    return {
      formError: 'Incorrect email or password',
    };
  }
  const token = generateSessionToken();
  const session = await createSession(token, existingUser.id);
  await setSessionTokenCookie(token, session.expiresAt);
  return redirect(Paths.LoggedInRedirect);
}

export async function signup(_: unknown, formData: FormData): Promise<ActionResponse<SignupInput>> {
  const obj = Object.fromEntries(formData.entries());

  const parsed = signupSchema.safeParse(obj);
  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      fieldError: {
        email: err.fieldErrors.email?.[0],
        password: err.fieldErrors.password?.[0],
      },
    };
  }

  const { email, password } = parsed.data;

  const [existingUser] = await db.select({ email: users.email }).from(users).where(eq(users.email, email)).limit(1);

  if (existingUser) {
    return {
      formError: 'Cannot create account with that email',
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
  return redirect(Paths.VerifyEmail);
}

export async function logout(): Promise<{ error: string } | void> {
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: 'No session found',
    };
  }
  await invalidateSession(session.id);
  await deleteSessionTokenCookie();
  return redirect('/');
}

export async function resendVerificationEmail(): Promise<{
  error?: string;
  success?: boolean;
}> {
  const { user } = await validateRequest();
  if (!user) {
    return redirect(Paths.Login);
  }
  const [lastSent] = await db
    .select({ expiresAt: emailVerificationCodes.expiresAt })
    .from(emailVerificationCodes)
    .where(eq(emailVerificationCodes.userId, user.id))
    .limit(1);

  if (lastSent && isWithinExpirationDate(lastSent.expiresAt)) {
    return {
      error: `Please wait ${timeFromNow(lastSent.expiresAt)} before resending`,
    };
  }
  const verificationCode = await generateEmailVerificationCode(user.id, user.email);
  await sendMail(user.email, EmailTemplate.EmailVerification, { code: verificationCode });

  return { success: true };
}

export async function verifyEmail(_: unknown, formData: FormData): Promise<{ error: string } | void> {
  const code = formData.get('code');
  if (typeof code !== 'string' || code.length !== 6) {
    return { error: 'Invalid code' };
  }

  const { user } = await validateRequest();
  if (!user) {
    return redirect(Paths.Login);
  }

  const dbCode = await db.transaction(async tx => {
    const [item] = await tx
      .select()
      .from(emailVerificationCodes)
      .where(eq(emailVerificationCodes.userId, user.id))
      .limit(1);
    if (item) {
      await tx.delete(emailVerificationCodes).where(eq(emailVerificationCodes.id, item.id));
    }
    return item;
  });

  if (!dbCode || dbCode.code !== code) return { error: 'Invalid verification code' };
  if (!isWithinExpirationDate(dbCode.expiresAt)) return { error: 'Verification code expired' };
  if (dbCode.email !== user.email) return { error: 'Email does not match' };

  await invalidateUserSessions(user.id);
  await db.update(users).set({ emailVerified: true }).where(eq(users.id, user.id));
  const token = generateSessionToken();
  const session = await createSession(token, user.id);
  await setSessionTokenCookie(token, session.expiresAt);
  redirect(Paths.LoggedInRedirect);
}

export async function sendPasswordResetLink(
  _: unknown,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const email = formData.get('email');
  const parsed = z.string().trim().email().safeParse(email);
  if (!parsed.success) {
    return { error: 'Provided email is invalid.' };
  }
  try {
    const [user] = await db.select().from(users).where(eq(users.email, parsed.data)).limit(1);

    if (!user || !user.emailVerified) return { error: 'Provided email is invalid.' };

    const verificationToken = await generatePasswordResetToken(user.id);

    const verificationLink = `${env.NEXT_PUBLIC_APP_URL}/reset-password/${verificationToken}`;

    await sendMail(user.email, EmailTemplate.PasswordReset, { link: verificationLink });

    return { success: true };
  } catch (error) {
    return { error: 'Failed to send verification email.' };
  }
}

export async function resetPassword(_: unknown, formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const obj = Object.fromEntries(formData.entries());

  const parsed = resetPasswordSchema.safeParse(obj);

  if (!parsed.success) {
    const err = parsed.error.flatten();
    return {
      error: err.fieldErrors.password?.[0] ?? err.fieldErrors.token?.[0],
    };
  }
  const { token: inputToken, password } = parsed.data;

  const dbToken = await db.transaction(async tx => {
    const [item] = await tx.select().from(passwordResetTokens).where(eq(passwordResetTokens.id, inputToken)).limit(1);
    if (item) {
      await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.id, item.id));
    }
    return item;
  });

  if (!dbToken) return { error: 'Invalid password reset link' };

  if (!isWithinExpirationDate(dbToken.expiresAt)) return { error: 'Password reset link expired.' };

  await invalidateUserSessions(dbToken.userId);
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.update(users).set({ hashedPassword }).where(eq(users.id, dbToken.userId));
  const token = generateSessionToken();
  const session = await createSession(token, dbToken.userId);
  await setSessionTokenCookie(token, session.expiresAt);
  redirect(Paths.LoggedInRedirect);
}

const timeFromNow = (time: Date) => {
  const now = new Date();
  const diff = time.getTime() - now.getTime();
  const minutes = Math.floor(diff / 1000 / 60);
  const seconds = Math.floor(diff / 1000) % 60;
  return `${minutes}m ${seconds}s`;
};

async function generateEmailVerificationCode(userId: string, email: string): Promise<string> {
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

async function generatePasswordResetToken(userId: string): Promise<string> {
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  const tokenId = generateSessionToken();
  await db.insert(passwordResetTokens).values({
    id: tokenId,
    userId,
    expiresAt: createDate(new TimeSpan(2, 'h')),
  });
  return tokenId;
}
