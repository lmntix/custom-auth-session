import { cache } from 'react';
import { validateRequest } from '.';
import type { SessionValidationResult } from '.';

export const getSession = cache(async (): Promise<SessionValidationResult> => {
  return await validateRequest();
});
