"use server";

import { inArray } from "drizzle-orm";
import { getActiveOrgId } from "@/app/features/auth/services/org-context.service";
import { db } from "@/lib/db/client";
import { paymentsTable } from "@/lib/db/schema";
import {
  getNotificationsByOrg,
  getUnreadNotificationsCount,
} from "../services/notification.service";

const PAYMENT_ID_PATTERN = /PAYMENT_ID:([0-9a-fA-F-]{36})/;

type DashboardNotificationRow = {
  id: string;
  orgId: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

type PaymentMetaRow = {
  id: string;
  status: string;
  amount: number;
  proofUrl: string | null;
};

export async function getDashboardNotifications() {
  try {
    const orgId = await getActiveOrgId();
    if (!orgId) {
      return {
        success: false,
        unreadCount: 0,
        notifications: [],
      };
    }

    const [notifications, unreadCount] = await Promise.all([
      getNotificationsByOrg(orgId, 20),
      getUnreadNotificationsCount(orgId),
    ]);

    const paymentIds = notifications
      .map(
        (notification: DashboardNotificationRow) =>
          notification.message.match(PAYMENT_ID_PATTERN)?.[1],
      )
      .filter((id: string | undefined): id is string => Boolean(id));

    const paymentMeta: PaymentMetaRow[] = paymentIds.length
      ? await db
          .select({
            id: paymentsTable.id,
            status: paymentsTable.status,
            amount: paymentsTable.amount,
            proofUrl: paymentsTable.proofUrl,
          })
          .from(paymentsTable)
          .where(inArray(paymentsTable.id, paymentIds))
      : [];

    const paymentMetaMap = new Map(
      paymentMeta.map((payment) => [payment.id, payment]),
    );

    return {
      success: true,
      unreadCount,
      notifications: notifications.map(
        (notification: DashboardNotificationRow) => {
          const paymentId =
            notification.message.match(PAYMENT_ID_PATTERN)?.[1] || null;
          const payment = paymentId ? paymentMetaMap.get(paymentId) : null;

          return {
            id: notification.id,
            orgId: notification.orgId,
            type: notification.type,
            message: notification.message
              .replace(PAYMENT_ID_PATTERN, "")
              .trim(),
            isRead: notification.isRead,
            createdAt: notification.createdAt,
            paymentId,
            paymentStatus: payment?.status || null,
            proofUrl: payment?.proofUrl || null,
            amount: payment?.amount || null,
          };
        },
      ),
    };
  } catch {
    return {
      success: false,
      unreadCount: 0,
      notifications: [],
    };
  }
}
