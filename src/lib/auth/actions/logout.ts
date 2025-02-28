'use server';

import { redirect } from 'next/navigation';
import {
  deleteSessionTokenCookie,
  invalidateSession,
} from '@/lib/auth';
import { ActionResult } from '@/lib/auth/types';

/**
 * Logs out the current user by invalidating their session
 * @param sessionId The ID of the session to invalidate
 * @returns ActionResult with success status and message
 */
export async function logout(sessionId: string): Promise<ActionResult> {
  if (!sessionId) {
    return {
      success: false,
      message: 'No session found'
    };
  }
  
  await invalidateSession(sessionId);
  await deleteSessionTokenCookie();
  
  redirect('/');
  
  // This return is only for TypeScript - redirect() will prevent this from executing
  return {
    success: true,
    message: 'Logged out successfully'
  };
}