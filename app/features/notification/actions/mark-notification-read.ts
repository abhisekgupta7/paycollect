"use server";

import { getActiveOrgId } from "@/app/features/auth/services/org-context.service";
import { markNotificationAsRead } from "../services/notification.service";

export async function markNotificationReadAction(
  notificationId: string,
  orgId?: string,
) {
  try {
    const activeOrgId = orgId || (await getActiveOrgId());

    if (!activeOrgId) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    await markNotificationAsRead(activeOrgId, notificationId);

    return {
      success: true,
      message: "Marked as read",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read",
    };
  }
}
