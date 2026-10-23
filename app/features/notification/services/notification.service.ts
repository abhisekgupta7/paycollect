import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { notificationTable } from "@/lib/db/schema";

export async function createNotification(
  orgId: string,
  type: string,
  message: string,
) {
  const now = new Date();

  try {
    const [created] = await db
      .insert(notificationTable)
      .values({
        orgId,
        type,
        message,
        isRead: false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return created;
  } catch (error) {
    console.error("Failed to create notification", {
      orgId,
      type,
      error,
    });
    return null;
  }
}

export async function getNotificationsByOrg(orgId: string, limit = 20) {
  const notifications = await db
    .select()
    .from(notificationTable)
    .where(eq(notificationTable.orgId, orgId))
    .orderBy(desc(notificationTable.createdAt))
    .limit(limit);

  return notifications;
}

export async function getUnreadNotificationsCount(orgId: string) {
  const unread = await db
    .select()
    .from(notificationTable)
    .where(
      and(
        eq(notificationTable.orgId, orgId),
        eq(notificationTable.isRead, false),
      ),
    );

  return unread.length;
}

export async function markNotificationAsRead(
  orgId: string,
  notificationId: string,
) {
  const [updated] = await db
    .update(notificationTable)
    .set({
      isRead: true,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(notificationTable.id, notificationId),
        eq(notificationTable.orgId, orgId),
      ),
    )
    .returning();

  return updated || null;
}
