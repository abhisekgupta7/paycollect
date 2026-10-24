"use server";

import {
  activateSubscriptionAfterPayment,
  getPayment,
  updatePaymentStatus,
} from "../services/payment.services";
import { createNotification } from "@/app/features/notification/services/notification.service";
import { cookies } from "next/headers";
import { findAdminById } from "@/app/features/admin/services/admin-auth.service";
import { verifyAdminToken } from "@/app/features/admin/utils/jwt";

export async function verifyPaymentAction(
  paymentId: string,
  action: "approve" | "reject",
) {
  try {
    const payment = await getPayment(paymentId);
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin_token")?.value;
    const adminVerification = adminToken
      ? verifyAdminToken(adminToken)
      : { valid: false as const };
    const admin = adminVerification.valid && adminVerification.payload?.id
      ? await findAdminById(adminVerification.payload.id)
      : null;

    if (!admin || !admin.isActive || !payment) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    if (payment.context !== "PLATFORM" || !payment.organizationId) {
      return {
        success: false,
        message: "Only platform subscription payments can be verified here",
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
