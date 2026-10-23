"use server";

import { db } from "@/lib/db/client";
import { organizationsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getOrganizationConfigByOrg } from "../service/config.services";

export async function getOrganizationConfigPublic(organizationId: string) {
  try {
    if (!organizationId || organizationId.trim() === "") {
      return {
        success: false,
        message: "Invalid organization ID",
        data: null,
      };
    }

    // Verify organization exists
    const org = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.id, organizationId))
      .limit(1);

    if (org.length === 0) {
      return {
        success: false,
        message: "Organization not found",
        data: null,
      };
    }

    const config = await getOrganizationConfigByOrg(organizationId);

    if (!config) {
      return {
        success: false,
        message: "Payment configuration not set up for this organization",
        data: null,
      };
    }

    return {
      success: true,
      data: config,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch payment configuration";
    return {
      success: false,
      message,
      data: null,
    };
  }
}
