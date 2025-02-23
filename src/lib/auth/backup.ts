'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { emailVerificationCodes, passwordResetTokens, users } from '@/db/schema/auth';
import { sendMail, EmailTemplate } from '@/lib/email';
import { Paths } from '@/lib/constants';
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
import { createDate, isWithinExpirationDate, TimeSpan } from '@/utils/date';

type LoginInput = {
  email: string;
  password: string;
};

type SignupInput = {
  email: string;
  password: string;
};

async function login(data: LoginInput) {
  if (!data.email || !data.password) {
    throw new Error('Email and password are required');
  }

  if (!data.email.includes('@')) {
    throw new Error('Please enter a valid email');
  }

  if (data.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const { email, password } = data;

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

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
  return redirect(Paths.Organizations);
}

async function signup(data: SignupInput) {
  if (!data.email || !data.password) {
    throw new Error('Email and password are required');
  }

  if (!data.email.includes('@')) {
    throw new Error('Please enter a valid email');
  }

  if (data.password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const { email, password } = data;

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { email: true },
  });

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
  await sendMail(email, EmailTemplate.EmailVerification, {
    code: verificationCode,
  });
  const token = generateSessionToken();
  const session = await createSession(token, userId);
  await setSessionTokenCookie(token, session.expiresAt);
  return redirect(Paths.VerifyEmail);
}

async function logout() {
  const { session } = await validateRequest();
  if (!session) {
    throw new Error('No session found');
  }
  await invalidateSession(session.id);
  await deleteSessionTokenCookie();
  return redirect('/');
}

async function resendVerificationEmail() {
  const { user } = await validateRequest();
  if (!user) {
    redirect(Paths.Login);
  }
  const lastSent = await db.query.emailVerificationCodes.findFirst({
    where: eq(emailVerificationCodes.userId, user.id),
    columns: { expiresAt: true },
  });

  if (lastSent && isWithinExpirationDate(lastSent.expiresAt)) {
    throw new Error(`Please wait ${timeFromNow(lastSent.expiresAt)} before resending`);
  }
  const verificationCode = await generateEmailVerificationCode(user.id, user.email);
  await sendMail(user.email, EmailTemplate.EmailVerification, {
    code: verificationCode,
  });

  return { success: true };
}

async function verifyEmail(code: string) {
  if (typeof code !== 'string' || code.length !== 8) {
    throw new Error('Invalid code');
  }

  const { user } = await validateRequest();
  if (!user) {
    return redirect(Paths.Login);
  }

  const dbCode = await db.transaction(async tx => {
    const item = await tx.query.emailVerificationCodes.findFirst({
      where: eq(emailVerificationCodes.userId, user.id),
    });
    if (item) {
      await tx.delete(emailVerificationCodes).where(eq(emailVerificationCodes.id, item.id));
    }
    return item;
  });

  if (!dbCode || dbCode.code !== code) throw new Error('Invalid verification code');
  if (!isWithinExpirationDate(dbCode.expiresAt)) throw new Error('Verification code expired');
  if (dbCode.email !== user.email) throw new Error('Email does not match');

  await invalidateUserSessions(user.id);
  await db.update(users).set({ emailVerified: true }).where(eq(users.id, user.id));
  const token = generateSessionToken();
  const session = await createSession(token, user.id);
  await setSessionTokenCookie(token, session.expiresAt);
  redirect(Paths.Organizations);
}

async function sendPasswordResetLink(email: string) {
  if (!email || !email.includes('@')) {
    throw new Error('Provided email is invalid.');
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user || !user.emailVerified) throw new Error('Provided email is invalid.');

    const verificationToken = await generatePasswordResetToken(user.id);

    const verificationLink = `${env.NEXT_PUBLIC_APP_URL}/reset-password/${verificationToken}`;

    await sendMail(user.email, EmailTemplate.PasswordReset, {
      link: verificationLink,
    });

    return { success: true };
  } catch (error) {
    return { error: 'Failed to send verification email.' };
  }
}

async function resetPassword({ token, password }: { token: string; password: string }) {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token');
  }

  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const dbToken = await db.transaction(async tx => {
    const item = await tx.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.id, token),
    });
    if (item) {
      await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.id, item.id));
    }
    return item;
  });

  if (!dbToken) throw new Error('Invalid password reset link');

  if (!isWithinExpirationDate(dbToken.expiresAt)) throw new Error('Password reset link expired.');

  await invalidateUserSessions(dbToken.userId);
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.update(users).set({ hashedPassword }).where(eq(users.id, dbToken.userId));
  const newToken = generateSessionToken();
  const session = await createSession(newToken, dbToken.userId);
  await setSessionTokenCookie(newToken, session.expiresAt);
  redirect(Paths.Organizations);
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
  //   const alphabet ="0123456789";
  // const code = generateRandomString(random, alphabet,8); // 8 digit code
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

export const authActions = {
  login,
  signup,
  logout,
  resendVerificationEmail,
  verifyEmail,
  sendPasswordResetLink,
  resetPassword,
};
