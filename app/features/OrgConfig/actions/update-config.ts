"use server";

import { getActiveOrgId } from "@/app/features/auth/services/org-context.service";
import {
  updateOrganizationConfigSchema,
  type UpdateOrganizationConfigInput,
} from "../types/config.types";
import {
  getOrganizationConfigByOrg,
  updateOrganizationConfig,
} from "../service/config.services";

export async function updateOrganizationConfigAction(
  input: UpdateOrganizationConfigInput,
) {
  const parsed = updateOrganizationConfigSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid organization config data",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const organizationId = await getActiveOrgId();
    if (!organizationId) {
      return {
        success: false,
        message: "No active organization found. Please log in first.",
      };
    }

    const existing = await getOrganizationConfigByOrg(organizationId);
    if (!existing) {
      return {
        success: false,
        message: "Organization config not found. Please create one first.",
      };
    }

    const data = {
      paymentMethod: parsed.data.paymentMethod,
      qrCodeUrl: parsed.data.qrCodeUrl?.trim() || "",
      phoneNumber: parsed.data.phoneNumber?.trim() || "",
    };

    const updated = await updateOrganizationConfig(organizationId, data);

    return {
      success: true,
      message: "Organization config updated successfully",
      data: updated,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update organization config";
    return {
      success: false,
      message,
    };
  }
}
