"use server";

import { db } from "@/lib/db/client";
import {
  organizationsTable,
  membershipsTable,
  customerTable,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { submitManualPayment } from "../services/payment.services";
import { createNotification } from "@/app/features/notification/services/notification.service";
import { normalizePhoneNumber } from "@/app/features/customer/services/customer.service";

export async function submitPaymentPublic(
  organizationId: string,
  proofUrl: string,
  customerId: string,
  customerPhone: string,
  amountInPaisa: number,
) {
  try {
    if (!organizationId || organizationId.trim() === "") {
      return {
        success: false,
        message: "Invalid organization ID",
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
      };
    }

    if (!proofUrl || proofUrl.trim() === "") {
      return {
        success: false,
        message: "Please upload payment proof first.",
      };
    }

    if (!customerId || customerId.trim() === "") {
      return {
        success: false,
        message: "Customer is required for payment submission.",
      };
    }

    const normalizedPhone = normalizePhoneNumber(customerPhone);
    if (normalizedPhone.length !== 10) {
      return {
        success: false,
        message: "Invalid customer phone number.",
      };
    }

    if (!Number.isFinite(amountInPaisa) || amountInPaisa <= 0) {
      return {
        success: false,
        message: "Please enter a valid payment amount.",
      };
    }

    const matchedCustomer = await db
      .select({ id: customerTable.id })
      .from(customerTable)
      .where(
        and(
          eq(customerTable.id, customerId),
          eq(customerTable.organizationId, organizationId),
          eq(customerTable.phone, normalizedPhone),
        ),
      )
      .limit(1);

    if (matchedCustomer.length === 0) {
      return {
        success: false,
        message:
          "Customer details do not match this organization. Please verify phone number.",
      };
    }

    // Get organization owner from memberships table
    const ownerMembership = await db
      .select()
      .from(membershipsTable)
      .where(
        and(
          eq(membershipsTable.organizationId, organizationId),
          eq(membershipsTable.role, "OWNER"),
        ),
      )
      .limit(1);

    if (ownerMembership.length === 0) {
      return {
        success: false,
        message: "Organization owner not found",
      };
    }

    const ownerId = ownerMembership[0].userId;

    // Submit payment
    const payment = await submitManualPayment(
      organizationId,
      ownerId,
      proofUrl,
      amountInPaisa,
      "NPR",
      customerId,
    );

    // Create notification for the organization
    await createNotification(
      organizationId,
      "PAYMENT_SUBMITTED",
      `New manual payment proof submitted and waiting for approval. PAYMENT_ID:${payment.id}`,
    );

    return {
      success: true,
      message:
        "Payment proof submitted successfully. Our team will verify it shortly.",
      paymentId: payment.id,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit payment";
    return {
      success: false,
      message,
    };
  }
}
