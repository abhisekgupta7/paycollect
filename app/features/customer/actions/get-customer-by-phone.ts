"use server";

import { getActiveOrgId } from "@/app/features/auth/services/org-context.service";
import {
  getCustomerByPhoneAndOrg,
  normalizePhoneNumber,
} from "../services/customer.service";

export async function getCustomerByPhone(phone: string) {
  try {
    const organizationId = await getActiveOrgId();

    if (!organizationId) {
      return {
        success: false,
        message: "Unauthorized",
        customer: null,
      };
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    if (normalizedPhone.length !== 10) {
      return {
        success: false,
        message: "Please enter a valid 10-digit phone number",
        customer: null,
      };
    }

    const customer = await getCustomerByPhoneAndOrg(
      normalizedPhone,
      organizationId,
    );

    if (!customer[0]) {
      return {
        success: false,
        message: "No customer found for this phone number",
        customer: null,
      };
    }

    return {
      success: true,
      message: "Customer found",
      customer: {
        id: customer[0].id,
        name: customer[0].name,
        phone: customer[0].phone,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch customer";
    return {
      success: false,
      message,
      customer: null,
    };
  }
}
