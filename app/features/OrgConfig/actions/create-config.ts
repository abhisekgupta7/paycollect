"use server";

import { getActiveOrgId } from "@/app/features/auth/services/org-context.service";
import {
  createOrganizationConfigSchema,
  type CreateOrganizationConfigInput,
} from "../types/config.types";
import {
  createOrganizationConfig,
  getOrganizationConfigByOrg,
} from "../service/config.services";

export async function createOrganizationConfigAction(
  input: CreateOrganizationConfigInput,
) {
  const parsed = createOrganizationConfigSchema.safeParse(input);
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
    if (existing) {
      return {
        success: false,
        message: "Organization config already exists.",
      };
    }

    const data = {
      paymentMethod: parsed.data.paymentMethod,
      qrCodeUrl: parsed.data.qrCodeUrl?.trim() || "",
      phoneNumber: parsed.data.phoneNumber?.trim() || "",
    };

    const created = await createOrganizationConfig(organizationId, data);

    return {
      success: true,
      message: "Organization config created successfully",
      data: created,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create organization config";
    return {
      success: false,
      message,
    };
  }
}
