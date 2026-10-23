"use server";

import { auth } from "@/auth";
import {
  activateSubscriptionAfterPayment,
  getPayment,
  updatePaymentStatus,
} from "../services/payment.services";
import { createNotification } from "@/app/features/notification/services/notification.service";
import { markNotificationAsRead } from "@/app/features/notification/services/notification.service";

export async function approvePaymentAction(
  paymentId: string,
  notificationId?: string,
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
        message: "Only admins can approve payments",
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

    await updatePaymentStatus(paymentId, "VERIFIED");
    await activateSubscriptionAfterPayment(payment.organizationId!);

    if (notificationId) {
      try {
        await markNotificationAsRead(payment.organizationId!, notificationId);
      } catch (error) {
        console.error("Failed to mark review notification as read", error);
      }
    }

    try {
      await createNotification(
        payment.organizationId!,
        "PAYMENT_VERIFIED",
        `Manual payment has been approved successfully. PAYMENT_ID:${paymentId}`,
      );
    } catch (error) {
      console.error("Failed to create approval notification", error);
    }

    return {
      success: true,
      message: "Payment approved successfully",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to approve payment",
    };
  }
}
