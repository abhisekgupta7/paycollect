"use server";

import { getActiveOrgId } from "@/app/features/auth/services/org-context.service";
import { getLedgerSummary } from "../services/ledger.service";

export async function getLedgerSummaryForOrg() {
  try {
    const organizationId = await getActiveOrgId();

    if (!organizationId) {
      return {
        success: false,
        message: "Unauthorized",
        data: null,
      };
    }

    const summary = await getLedgerSummary(organizationId);

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch ledger summary",
      data: null,
    };
  }
}
