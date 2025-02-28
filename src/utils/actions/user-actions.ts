'use server';

import { z } from 'zod';
import { actionClient, authActionClient, adminActionClient } from '@/lib/safe-action';

// Public action that doesn't require authentication
export const subscribeToNewsletter = actionClient
  .schema(
    z.object({
      email: z.string().email('Please enter a valid email address'),
    })
  )
  .action(async ({ parsedInput }) => {
    try {
      // Sample implementation - in a real app, you would save to a database
      console.log(`Subscribing email: ${parsedInput.email} to newsletter`);

      // Simulate successful subscription
      return {
        success: true,
        message: 'Successfully subscribed to newsletter',
      };
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      return {
        success: false,
        message: 'Failed to subscribe to newsletter',
      };
    }
  });

// Authenticated action that requires a logged-in user
export const updateUserProfile = authActionClient
  .schema(
    z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      bio: z.string().optional(),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    // ctx.user is available from the auth middleware
    const userId = ctx.user.id;
    const { organizationId } = ctx;

    console.log(`Updating profile for user ${userId}`);
    console.log(`Organization context: ${organizationId || 'No organization ID in URL'}`);
    console.log(`New profile data:`, parsedInput);

    if (!organizationId) {
      throw new Error('Organization ID not found in the URL');
    }

    // Successful response
    return {
      success: true,
      message: 'Profile updated successfully',
      organizationId,
    };
  });

// Admin-only action that requires admin privileges
export const deleteUser = adminActionClient
  .schema(
    z.object({
      userId: z.string().uuid('Invalid user ID'),
    })
  )
  .action(async ({ parsedInput }) => {
    try {
      const { userId } = parsedInput;

      console.log(`Admin deleting user with ID: ${userId}`);

      // In a real app, you would delete the user from the database
      // await db.delete(users).where(eq(users.id, userId));

      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      console.error('User deletion error:', error);
      return {
        success: false,
        message: 'Failed to delete user',
      };
    }
  });
