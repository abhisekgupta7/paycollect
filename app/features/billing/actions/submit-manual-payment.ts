// features/billing/actions/submit-manual-payment.ts

"use server";

import { getActiveOrgContext } from "@/app/features/auth/services/org-context.service";
import { submitManualPayment } from "../services/payment.services";
import { createNotification } from "@/app/features/notification/services/notification.service";

export async function submitManualPaymentAction(
  proofUrl: string,
  customerId?: string,
) {
  try {
    // ✅ Auth
    const context = await getActiveOrgContext();
    if (!context) {
      return {
        success: false,
        message: "No active organization found. Please log in first.",
      };
    }

    if (!proofUrl) {
      return {
        success: false,
        message: "Please upload payment proof first.",
      };
    }

    // ✅ Fixed amount (never trust frontend) - Rs. 15,000 in paisa
    const amount = 15 * 100 * 1000;

    // ✅ Submit payment through service
    const payment = await submitManualPayment(
      context.orgId,
      context.userId,
      proofUrl,
      amount,
      "NPR",
      customerId,
    );

    await createNotification(
      context.orgId,
      "PAYMENT_SUBMITTED",
      `New manual payment proof submitted and waiting for approval. PAYMENT_ID:${payment.id}`,
    );

    return {
      success: true,
      message:
        "Payment proof submitted successfully. Our team will verify it shortly.",
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
