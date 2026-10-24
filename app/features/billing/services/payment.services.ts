// features/billing/services/payment.services.ts

import { db } from "@/lib/db/client";
import { subscriptionsTable, paymentsTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { invalidateOrganizationCaches } from "@/lib/cache";

// ============================================
// SUBSCRIPTION SERVICES
// ============================================

/**
 * Start a trial subscription for an organization
 * Creates new subscription if doesn't exist, updates if it does
 */
export async function startTrial(organizationId: string) {
  try {
    const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Check if subscription exists
    const existingSubscription = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.organizationId, organizationId))
      .limit(1);

    if (existingSubscription.length > 0) {
      // Update existing subscription
      const updated = await db
        .update(subscriptionsTable)
        .set({
          plan: "PRO",
          status: "ACTIVE",
          currentPeriodEnd: trialEndDate,
          updatedAt: new Date(),
        })
        .where(eq(subscriptionsTable.organizationId, organizationId))
        .returning();
      return updated[0];
    } else {
      // Create new subscription
      const created = await db
        .insert(subscriptionsTable)
        .values({
          organizationId,
          plan: "PRO",
          status: "ACTIVE",
          currentPeriodEnd: trialEndDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return created[0];
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start trial";
    throw new Error(`Trial Error: ${message}`);
  }
}

/**
 * Get subscription for an organization
 */
export async function getSubscription(organizationId: string) {
  try {
    const subscription = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.organizationId, organizationId))
      .limit(1);

    return subscription[0] || null;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch subscription";
    throw new Error(`Subscription Error: ${message}`);
  }
}

/**
 * Check if subscription is active and not expired
 */
export async function isSubscriptionActive(organizationId: string) {
  try {
    const subscription = await getSubscription(organizationId);

    if (!subscription) return false;
    if (subscription.plan === "FREE") return false;
    if (subscription.status !== "ACTIVE") return false;
    if (
      subscription.currentPeriodEnd &&
      subscription.currentPeriodEnd < new Date()
    )
      return false;

    const verifiedPlatformPayment = await db
      .select({ id: paymentsTable.id })
      .from(paymentsTable)
      .where(
        and(
          eq(paymentsTable.organizationId, organizationId),
          eq(paymentsTable.context, "PLATFORM"),
          eq(paymentsTable.status, "VERIFIED"),
        ),
      )
      .limit(1);

    return verifiedPlatformPayment.length > 0;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to check subscription";
    console.error(`Subscription Error: ${message}`);
    return false;
  }
}

// ============================================
// PAYMENT SERVICES
// ============================================

/**
 * Check if organization has existing pending payment
 */
export async function getPendingPayment(organizationId: string) {
  try {
    const existing = await db
      .select()
      .from(paymentsTable)
      .where(
        and(
          eq(paymentsTable.organizationId, organizationId),
          eq(paymentsTable.status, "PENDING"),
        ),
      )
      .limit(1);

    return existing[0] || null;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to check pending payment";
    throw new Error(`Payment Error: ${message}`);
  }
}

/**
 * Submit manual payment
 * - Checks for existing pending payments
 * - Creates payment record with PENDING status
 */
export async function submitManualPayment(
  organizationId: string,
  userId: string,
  proofUrl: string,
  amount: number = 100 * 1000 * 15, // Rs. 15,000 in paisa (default)
  currency: string = "NPR",
  customerId?: string,
) {
  try {
    if (!proofUrl) {
      throw new Error("Proof URL is required");
    }

    // Check for existing pending payment
    const existingPayment = await getPendingPayment(organizationId);
    if (existingPayment) {
      throw new Error(
        "You already have a pending payment. Please wait for verification.",
      );
    }

    // Create payment record
    const created = await db
      .insert(paymentsTable)
      .values({
        organizationId,
        userId,
        customerId: customerId ?? null,
        context: "ORG",
        provider: "MANUAL",
        amount,
        currency,
        status: "PENDING",
        proofUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await invalidateOrganizationCaches(organizationId);
    return created[0];
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit payment";
    throw new Error(`Payment Error: ${message}`);
  }
}

/**
 * Get payment by ID
 */
export async function getPayment(paymentId: string) {
  try {
    const payment = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.id, paymentId))
      .limit(1);

    return payment[0] || null;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch payment";
    throw new Error(`Payment Error: ${message}`);
  }
}

/**
 * Get all payments for organization
 */
export async function getPaymentsByOrganization(organizationId: string) {
  try {
    const payments = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.organizationId, organizationId));

    return payments;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch payments";
    throw new Error(`Payment Error: ${message}`);
  }
}

/**
 * Update payment status (for admin verification)
 * Can transition: PENDING -> VERIFIED | REJECTED
 * VERIFIED payments will trigger subscription upgrade
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: "VERIFIED" | "REJECTED",
) {
  try {
    const updated = await db
      .update(paymentsTable)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(paymentsTable.id, paymentId))
      .returning();

    if (!updated[0]) {
      throw new Error("Payment not found");
    }

    if (updated[0].organizationId) {
      await invalidateOrganizationCaches(updated[0].organizationId);
    }

    return updated[0];
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update payment status";
    throw new Error(`Payment Error: ${message}`);
  }
}

/**
 * Activate subscription after payment verification
 * This should be called after admin verifies a payment
 */
export async function activateSubscriptionAfterPayment(
  organizationId: string,
  planDurationDays: number = 30,
) {
  try {
    const currentPeriodEnd = new Date(
      Date.now() + planDurationDays * 24 * 60 * 60 * 1000,
    );

    const updated = await db
      .update(subscriptionsTable)
      .set({
        plan: "PRO",
        status: "ACTIVE",
        currentPeriodEnd,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionsTable.organizationId, organizationId))
      .returning();

    if (!updated[0]) {
      throw new Error("Subscription not found");
    }

    return updated[0];
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to activate subscription";
    throw new Error(`Subscription Error: ${message}`);
  }
}

// ============================================
// FUTURE ESEWA INTEGRATION HELPER
// ============================================

/**
 * Create ESewa payment record
 * This will be used for ESewa payment processing
 */
export async function createEsewaPayment(
  organizationId: string,
  userId: string,
  amount: number,
  currency: string = "NPR",
) {
  try {
    const created = await db
      .insert(paymentsTable)
      .values({
        organizationId,
        userId,
        context: "ORG",
        provider: "ESEWA",
        amount,
        currency,
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return created[0];
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create ESewa payment";
    throw new Error(`Payment Error: ${message}`);
  }
}

/**
 * Verify ESewa payment callback
 * Updates payment status and activates subscription
 */
export async function verifyEsewaPayment(
  pidx: string,
  status: string,
  transactionId: string,
) {
  try {
    // Find payment by pidx
    const payments = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.pidx, pidx))
      .limit(1);

    if (payments.length === 0) {
      throw new Error("Payment not found");
    }

    const payment = payments[0];

    if (status === "COMPLETED") {
      // Update payment
      await db
        .update(paymentsTable)
        .set({
          status: "VERIFIED",
          referenceId: transactionId,
          updatedAt: new Date(),
        })
        .where(eq(paymentsTable.id, payment.id));

      // Activate subscription
      if (payment.organizationId) {
        await activateSubscriptionAfterPayment(payment.organizationId);
      }
    }

    return payment;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to verify ESewa payment";
    throw new Error(`Payment Error: ${message}`);
  }
}
