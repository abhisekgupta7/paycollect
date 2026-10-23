"use server";

import { db } from "@/lib/db/client";
import { membershipsTable, organizationsTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export type MembershipRole = "OWNER" | "ADMIN" | "MEMBER";

export interface MembershipWithOrg {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  organizationName: string;
}

/**
 * Create organization and membership in transaction
 */
export async function createOrganizationWithMembership(
  userId: string,
  organizationName: string,
  role: MembershipRole = "OWNER",
) {
  try {
    const baseName = organizationName.trim() || "Business";
    const uniqueOrganizationName = `${baseName} (${userId.slice(0, 8)})`;

    return await db.transaction(async (tx) => {
      const [organization] = await tx
        .insert(organizationsTable)
        .values({
          name: uniqueOrganizationName,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const [membership] = await tx
        .insert(membershipsTable)
        .values({
          userId,
          organizationId: organization.id,
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return { organization, membership };
    });
  } catch (error) {
    console.error("Failed to create organization with membership:", error);
    throw new Error("Failed to create organization");
  }
}

/**
 * Get all memberships for a user with organization details
 */
export async function getUserMemberships(userId: string) {
  const memberships = await db
    .select({
      id: membershipsTable.id,
      userId: membershipsTable.userId,
      organizationId: membershipsTable.organizationId,
      role: membershipsTable.role,
      organizationName: organizationsTable.name,
    })
    .from(membershipsTable)
    .innerJoin(
      organizationsTable,
      eq(membershipsTable.organizationId, organizationsTable.id),
    )
    .where(eq(membershipsTable.userId, userId));

  return memberships;
}

/**
 * Get active membership for user
 * Returns the first/primary membership (you can customize this logic)
 */
export async function getActiveOrgForUser(userId: string) {
  const memberships = await getUserMemberships(userId);

  if (memberships.length === 0) {
    throw new Error("No organization found for user");
  }

  // Return first membership or implement custom logic
  return memberships[0];
}

/**
 * Verify user has membership in organization with specific role
 */
export async function verifyMembership(
  userId: string,
  organizationId: string,
  minRole?: MembershipRole,
) {
  const membership = await db
    .select()
    .from(membershipsTable)
    .where(
      and(
        eq(membershipsTable.userId, userId),
        eq(membershipsTable.organizationId, String(organizationId)),
      ),
    )
    .limit(1);

  if (!membership[0]) {
    return null;
  }

  // Check role if minRole is specified
  if (minRole) {
    const roleHierarchy: Record<MembershipRole, number> = {
      OWNER: 3,
      ADMIN: 2,
      MEMBER: 1,
    };

    if (
      (roleHierarchy[membership[0].role as MembershipRole] || 0) <
      roleHierarchy[minRole]
    ) {
      return null;
    }
  }

  return membership[0];
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(organizationId: string) {
  const org = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, String(organizationId)))
    .limit(1);

  return org[0] || null;
}
