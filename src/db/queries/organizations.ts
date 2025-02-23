import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { orgMembers } from "@/db/schema/auth";

/**
 * Get a user's role in a specific organization
 * @param userId - The ID of the user
 * @param organizationId - The ID of the organization
 * @returns The user's role in the organization, or null if not found
 */
export async function getUserOrgRole(
  userId: string,
  organizationId: string
): Promise<string | null> {
  const member = await db.query.orgMembers.findFirst({
    where: and(
      eq(orgMembers.userId, userId),
      eq(orgMembers.organizationId, organizationId)
    ),
    columns: {
      role: true,
    },
  });

  return member?.role ?? null;
}
