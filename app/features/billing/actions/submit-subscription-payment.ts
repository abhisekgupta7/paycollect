"use server";

import { getActiveOrgContext } from "@/app/features/auth/services/org-context.service";
import { db } from "@/lib/db/client";
import { paymentsTable, subscriptionsTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createNotification } from "@/app/features/notification/services/notification.service";

/**
 * Submit subscription payment proof
 * - For PLATFORM context (organization subscription payments)
 * - Saves screenshot as PENDING for verification
 * - Updates subscription status to track pending payment
 */
export async function submitSubscriptionPaymentAction(proofUrl: string) {
  try {
    // ✅ Auth - Get organization and user context
    const context = await getActiveOrgContext();
    if (!context) {
      return {
        success: false,
        message:
          "You must be logged in to submit payment.Please log in and try again.",
        redirect: "/auth/login",
      };
    }

    if (!proofUrl || proofUrl.trim() === "") {
      return {
        success: false,
        message: "Please upload payment proof first.",
      };
    }

    // ✅ Check for existing pending subscription payment
    const existingPending = await db
      .select()
      .from(paymentsTable)
      .where(
        and(
          eq(paymentsTable.organizationId, context.orgId),
          eq(paymentsTable.context, "PLATFORM"),
          eq(paymentsTable.status, "PENDING"),
        ),
      )
      .limit(1);

    if (existingPending.length > 0) {
      return {
        success: false,
        message:
          "You already have a pending subscription payment. Please wait for verification.",
      };
    }

    // ✅ Fixed amount - Rs. 15,000 in paisa
    const amount = 15 * 100 * 1000;

    // ✅ Create payment record with PLATFORM context
    const payment = await db
      .insert(paymentsTable)
      .values({
        organizationId: context.orgId,
        userId: context.userId,
        customerId: null,
        context: "PLATFORM",
        provider: "MANUAL",
        amount,
        currency: "NPR",
        status: "PENDING",
        proofUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!payment[0]) {
      throw new Error("Failed to create payment record");
    }

    // ✅ Update subscription status to reflect pending payment (if subscription exists)
    await db
      .update(subscriptionsTable)
      .set({
        status: "PAST_DUE", // Mark as past due until payment is verified
        updatedAt: new Date(),
      })
      .where(eq(subscriptionsTable.organizationId, context.orgId));

    // ✅ Create notification for organization owner
    await createNotification(
      context.orgId,
      "PAYMENT_SUBMITTED",
      `Subscription payment proof submitted and waiting for verification. PAYMENT_ID:${payment[0].id}`,
    );

    return {
      success: true,
      message:
        "Subscription payment proof submitted successfully. Our team will verify it shortly.",
      paymentId: payment[0].id,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit payment";
    console.error("Subscription payment error:", error);
    return {
      success: false,
      message,
    };
  }
}
