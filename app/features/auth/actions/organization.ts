"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { organizationsTable } from "@/lib/db/schema";
import { getActiveOrgContext } from "../services/org-context.service";

const updateOrgSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
});

export async function getActiveOrganizationDetails() {
  try {
    const context = await getActiveOrgContext();

    if (!context) {
      return {
        success: false,
        message: "Unauthorized",
        data: null,
      };
    }

    const org = await db
      .select({
        id: organizationsTable.id,
        name: organizationsTable.name,
      })
      .from(organizationsTable)
      .where(eq(organizationsTable.id, context.orgId))
      .limit(1);

    return {
      success: true,
      data: org[0] || null,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch organization",
      data: null,
    };
  }
}

export async function updateActiveOrganizationDetails(input: { name: string }) {
  const parsed = updateOrgSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid organization data",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const context = await getActiveOrgContext();

    if (!context) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const [updated] = await db
      .update(organizationsTable)
      .set({
        name: parsed.data.name.trim(),
        updatedAt: new Date(),
      })
      .where(eq(organizationsTable.id, context.orgId))
      .returning({
        id: organizationsTable.id,
        name: organizationsTable.name,
      });

    return {
      success: true,
      message: "Organization updated successfully",
      data: updated,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update organization",
    };
  }
}
