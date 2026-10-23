import webpush from "web-push";
import { db } from "@/lib/db/client";
import { pushSubscriptionsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

let configured = false;

function configureWebPush() {
  if (configured) return true;
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export async function sendOrganizationPush(
  organizationId: string,
  payload: { title: string; body: string; url?: string },
) {
  if (!configureWebPush()) return;

  const subscriptions = await db
    .select()
    .from(pushSubscriptionsTable)
    .where(eq(pushSubscriptionsTable.organizationId, organizationId));

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            expirationTime: subscription.expirationTime?.getTime() ?? null,
            keys: subscription.keys as { p256dh: string; auth: string },
          },
          JSON.stringify(payload),
        );
      } catch (error: unknown) {
        const statusCode =
          typeof error === "object" &&
          error !== null &&
          "statusCode" in error &&
          typeof error.statusCode === "number"
            ? error.statusCode
            : null;

        if (statusCode === 404 || statusCode === 410) {
          await db
            .delete(pushSubscriptionsTable)
            .where(eq(pushSubscriptionsTable.id, subscription.id));
          return;
        }
        console.error("Failed to send organization push notification:", error);
      }
    }),
  );
}
