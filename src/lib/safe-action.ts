import { DEFAULT_SERVER_ERROR_MESSAGE, createSafeActionClient } from 'next-safe-action';
import { zodAdapter } from 'next-safe-action/adapters/zod';
import { z } from 'zod';
import { validateRequest } from './auth';

export class ActionError extends Error {}

export const actionClient = createSafeActionClient({
  validationAdapter: zodAdapter(),
  // You can provide a custom handler for server errors, otherwise the lib will use `console.error`
  // as the default logging mechanism and will return the DEFAULT_SERVER_ERROR_MESSAGE for all server errors.
  handleServerError: e => {
    console.error('Action server error occurred:', e.message);

    // If the error is an instance of `ActionError`, unmask the message.
    if (e instanceof ActionError) {
      return e.message;
    }

    // Otherwise return default error message.
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
  // Here we define a metadata type to be used in `metadata` instance method.
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    });
  },
}).use(async ({ next, metadata, clientInput, bindArgsClientInputs, ctx }) => {
  // Here we use a logging middleware.
  const start = Date.now();

  // Here we await the next middleware.
  const result = await next();

  const end = Date.now();

  const durationInMs = end - start;

  const logObject: Record<string, any> = { durationInMs };

  logObject.clientInput = clientInput;
  logObject.bindArgsClientInputs = bindArgsClientInputs;
  logObject.metadata = metadata;
  logObject.result = result;

  console.log('LOGGING FROM MIDDLEWARE:');
  console.dir(logObject, { depth: null });

  // And then return the result of the awaited next middleware.
  return result;
});
export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await validateRequest();
  if (!session) {
    throw new ActionError('Authentication required');
  }
  if (!session.session || !session.user) {
    throw new ActionError('Invalid or expired session');
  }
  const organizationId = session.session.activeOrganizationId;
  return next({
    ctx: {
      user: session.user,
      session: session.session,
      organizationId,
    },
  });
});

export const adminActionClient = authActionClient.use(async ({ next, ctx }) => {
  if (ctx.user.role !== 'admin') {
    throw new ActionError('Admin access required');
  }
  return next();
});
