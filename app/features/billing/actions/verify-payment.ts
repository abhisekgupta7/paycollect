"use server";

import { auth } from "@/auth";
import {
  activateSubscriptionAfterPayment,
  getPayment,
  updatePaymentStatus,
} from "../services/payment.services";
import { createNotification } from "@/app/features/notification/services/notification.service";

export async function verifyPaymentAction(
  paymentId: string,
  action: "approve" | "reject",
) {
  try {
    const session = await auth();
    const payment = await getPayment(paymentId);

    if (!session?.user?.id || !payment) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const role = session.user.role;
    const activeOrgId = session.user.activeOrgId;

    if (role !== "OWNER" && role !== "ADMIN") {
      return {
        success: false,
        message: "Only admins can verify payments",
      };
    }

    if (
      role === "OWNER" &&
      activeOrgId &&
      payment.organizationId !== activeOrgId
    ) {
      return {
        success: false,
        message: "Payment not found for this organization",
      };
    }

    if (payment.status !== "PENDING") {
      return {
        success: false,
        message: `Payment is already ${payment.status.toLowerCase()}`,
      };
    }

    const newStatus = action === "approve" ? "VERIFIED" : "REJECTED";
    await updatePaymentStatus(paymentId, newStatus as "VERIFIED" | "REJECTED");

    // Create notification
    const notificationType =
      action === "approve" ? "PAYMENT_VERIFIED" : "PAYMENT_REJECTED";
    const notificationMessage =
      action === "approve"
        ? `Payment ${paymentId.slice(0, 8)} has been approved. PAYMENT_ID:${paymentId}`
        : `Payment ${paymentId.slice(0, 8)} has been rejected. PAYMENT_ID:${paymentId}`;

    try {
      await createNotification(
        payment.organizationId!,
        notificationType,
        notificationMessage,
      );
    } catch (error) {
      console.error("Failed to create verification notification", error);
    }

    if (action === "approve") {
      await activateSubscriptionAfterPayment(payment.organizationId!);
    }

    return {
      success: true,
      message: action === "approve" ? "Payment approved" : "Payment rejected",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to verify payment",
    };
  }
}
