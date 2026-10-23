"use server";

import { desc, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { notificationTable, paymentsTable } from "@/lib/db/schema";

const PAYMENT_ID_PATTERN = /PAYMENT_ID:([0-9a-fA-F-]{36})/;

type AdminNotificationRow = {
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

export async function getAdminNotifications() {
  try {
    const notifications: AdminNotificationRow[] = await db
      .select()
      .from(notificationTable)
      .orderBy(desc(notificationTable.createdAt))
      .limit(20);

    const paymentIds = notifications
      .map(
        (notification) => notification.message.match(PAYMENT_ID_PATTERN)?.[1],
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
      unreadCount: notifications.filter((notification) => !notification.isRead)
        .length,
      notifications: notifications.map((notification: AdminNotificationRow) => {
        const paymentId =
          notification.message.match(PAYMENT_ID_PATTERN)?.[1] || null;
        const payment = paymentId ? paymentMetaMap.get(paymentId) : null;

        return {
          id: notification.id,
          orgId: notification.orgId,
          type: notification.type,
          message: notification.message.replace(PAYMENT_ID_PATTERN, "").trim(),
          isRead: notification.isRead,
          createdAt: notification.createdAt,
          paymentId,
          paymentStatus: payment?.status || null,
          proofUrl: payment?.proofUrl || null,
          amount: payment?.amount || null,
        };
      }),
    };
  } catch {
    return {
      success: false,
      unreadCount: 0,
      notifications: [],
    };
  }
}
