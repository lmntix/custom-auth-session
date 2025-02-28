import db from '@/db';
import { Invitation, invitations, organizations } from '@/db/schema/auth';
import { eq, and } from 'drizzle-orm';

export async function checkInvitation(email: string): Promise<boolean> {
  const result = await db.select().from(invitations).where(eq(invitations.email, email)).execute();
  return result.length > 0;
}

export async function getPendingInvitations(
  email: string
): Promise<(Invitation & { organizationName: string | null })[]> {
  const result = await db
    .select({
      id: invitations.id,
      organizationId: invitations.organizationId,
      email: invitations.email,
      role: invitations.role,
      status: invitations.status,
      expiresAt: invitations.expiresAt,
      inviterId: invitations.inviterId,
      organizationName: organizations.name,
    })
    .from(invitations)
    .leftJoin(organizations, eq(invitations.organizationId, organizations.id))
    .where(and(eq(invitations.email, email), eq(invitations.status, 'pending')))
    .execute();

  return result;
}
