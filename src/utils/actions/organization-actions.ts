"use server";

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";

// Example action that uses organization ID from context
export const updateOrganizationName = authActionClient
  .schema(
    z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    try {
      const { name } = parsedInput;
      const { user, organizationId } = ctx;
      
      if (!organizationId) {
        return {
          success: false,
          message: "Organization ID not found in the URL",
        };
      }
      
      console.log(`Updating organization ${organizationId} with name: ${name}`);
      console.log(`User ID: ${user.id}`);
      
      // In a real app, you would update the organization in the database
      // await db.update(organizations).set({ name }).where(eq(organizations.id, organizationId));
      
      return {
        success: true,
        message: "Organization updated successfully",
        organizationId,
      };
    } catch (error) {
      console.error("Organization update error:", error);
      return {
        success: false,
        message: "Failed to update organization",
      };
    }
  });

// Example of an action that gets organization details
export const getOrganizationDetails = authActionClient
  .action(async ({ ctx }) => {
    try {
      const { organizationId } = ctx;
      
      if (!organizationId) {
        return {
          success: false,
          message: "Organization ID not found in the URL",
        };
      }
      
      console.log(`Getting details for organization: ${organizationId}`);
      
      // In a real app, you would fetch the organization from the database
      // const organization = await db.query.organizations.findFirst({
      //   where: eq(organizations.id, organizationId)
      // });
      
      // For demo purposes, return mock data
      return {
        success: true,
        organization: {
          id: organizationId,
          name: "Sample Organization",
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Error fetching organization details:", error);
      return {
        success: false,
        message: "Failed to fetch organization details",
      };
    }
  });
