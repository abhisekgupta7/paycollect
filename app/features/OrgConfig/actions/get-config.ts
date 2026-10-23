"use server";

import { getActiveOrgId } from "@/app/features/auth/services/org-context.service";
import { getOrganizationConfigByOrg } from "../service/config.services";

export async function getOrganizationConfigAction() {
  try {
    const organizationId = await getActiveOrgId();
    if (!organizationId) {
      return {
        success: false,
        message: "No active organization found. Please log in first.",
        data: null,
      };
    }

    const config = await getOrganizationConfigByOrg(organizationId);

    return {
      success: true,
      data: config,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch organization config";
    return {
      success: false,
      message,
      data: null,
    };
  }
}
