"use server";

import { getActiveOrgId } from "@/app/features/auth/services/org-context.service";
import { getDashboardSummary } from "../services/dashboard.service";

export async function getDashboardSummaryForOrg() {
  try {
    const organizationId = await getActiveOrgId();

    if (!organizationId) {
      return {
        success: false,
        message: "Unauthorized",
        data: null,
      };
    }

    return {
      success: true,
      data: await getDashboardSummary(organizationId),
    };
  } catch (error) {
    console.error("Get dashboard summary error:", error);
    return {
      success: false,
      message: "Failed to fetch dashboard summary",
      data: null,
    };
  }
}
