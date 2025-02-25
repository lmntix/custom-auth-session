import { eq } from 'drizzle-orm';
import { sessions, users } from '@/db/schema';
import type { User, Session } from '@/db/schema';
import { cookies, headers } from 'next/headers';
import { env } from 'process';
import { cache } from 'react';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import db from '@/db';
import { userAgent } from 'next/server';

export type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };

const SESSION_REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 24 * 15;
const SESSION_MAX_DURATION_MS = SESSION_REFRESH_INTERVAL_MS * 2;
export const SESSION_COOKIE_NAME = 'session';

export async function setSessionTokenCookie(token: string, expiresAt: Date): Promise<void> {
  const allCookies = await cookies();
  allCookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
  });
}

export async function deleteSessionTokenCookie(): Promise<void> {
  const allCookies = await cookies();
  allCookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
  });
}

export async function getSessionToken(): Promise<string | undefined> {
  const allCookies = await cookies();
  const sessionCookie = allCookies.get(SESSION_COOKIE_NAME)?.value;
  return sessionCookie;
}

export const getCurrentUser = cache(async () => {
  const { user } = await validateRequest();
  return user ?? undefined;
});

export async function setSession(userId: string) {
  const token = generateSessionToken();
  const session = await createSession(token, userId);
  await setSessionTokenCookie(token, session.expiresAt);
}

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(token: string, userId: string): Promise<Session> {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';
  const ua = userAgent({ headers: headersList });
  const sessionId = crypto.randomUUID();
  const tokenId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session = {
    id: sessionId,
    userId,
    token: tokenId,
    expiresAt: new Date(Date.now() + SESSION_MAX_DURATION_MS),
    ipAddress: ip,
    userAgent: ua.ua,
    activeOrganizationId: null,
    impersonatedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await db.insert(sessions).values(session);
  return session;
}

export async function validateRequest(): Promise<SessionValidationResult> {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return { session: null, user: null };
  }
  return validateSessionToken(sessionToken);
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
  const tokenId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const [sessionInDb] = await db.select().from(sessions).where(eq(sessions.token, tokenId)).limit(1);
  if (!sessionInDb) {
    return { session: null, user: null };
  }
  if (Date.now() >= sessionInDb.expiresAt.getTime()) {
    await db.delete(sessions).where(eq(sessions.id, sessionInDb.id));
    return { session: null, user: null };
  }
  const [user] = await db.select().from(users).where(eq(users.id, sessionInDb.userId)).limit(1);

  if (!user) {
    await db.delete(sessions).where(eq(sessions.id, sessionInDb.id));
    return { session: null, user: null };
  }

  if (Date.now() >= sessionInDb.expiresAt.getTime() - SESSION_REFRESH_INTERVAL_MS) {
    sessionInDb.expiresAt = new Date(Date.now() + SESSION_MAX_DURATION_MS);
    await db
      .update(sessions)
      .set({
        expiresAt: sessionInDb.expiresAt,
      })
      .where(eq(sessions.id, sessionInDb.id));
  }
  return { session: sessionInDb, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function invalidateUserSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

export const auth = {
  setSessionTokenCookie,
  deleteSessionTokenCookie,
  getSessionToken,
  getCurrentUser,
  setSession,
  generateSessionToken,
  createSession,
  validateRequest,
  validateSessionToken,
  invalidateSession,
  invalidateUserSessions,
};
