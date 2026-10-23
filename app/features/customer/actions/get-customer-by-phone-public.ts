"use server";

import { db } from "@/lib/db/client";
import { organizationsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  getCustomerByPhoneAndOrg,
  normalizePhoneNumber,
} from "../services/customer.service";

export async function getCustomerByPhonePublic(
  organizationId: string,
  phone: string,
) {
  try {
    if (!organizationId || organizationId.trim() === "") {
      return {
        success: false,
        message: "Invalid organization ID",
        customer: null,
      };
    }

    const org = await db
      .select({ id: organizationsTable.id })
      .from(organizationsTable)
      .where(eq(organizationsTable.id, organizationId))
      .limit(1);

    if (org.length === 0) {
      return {
        success: false,
        message: "Organization not found",
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
