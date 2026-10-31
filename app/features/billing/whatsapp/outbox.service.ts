"use server";

import { and, eq, lte, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  customerTable,
  membershipsTable,
  organizationsTable,
  paymentsTable,
  usersTable,
  whatsappOutboxTable,
} from "@/lib/db/schema";
import { getRedisClient } from "@/lib/redis";

const MESSAGE_TYPE = "ORG_PAYMENT_VERIFIED_RETAILER_V1";
type DbExecutor = Pick<typeof db, "select" | "insert">;

async function wakeWorker(eventId: string | undefined) {
  if (!eventId) return;

  try {
    const redis = await getRedisClient();
    if (redis) {
      await redis.publish("paycollect:whatsapp", eventId);
    }
  } catch (error) {
    console.error("Failed to wake WhatsApp worker; recovery scan will retry:", error);
  }
}

async function insertReceiptEvents(
  executor: DbExecutor,
  paymentId: string,
) {
  const [payment] = await executor
    .select({
      id: paymentsTable.id,
      organizationId: paymentsTable.organizationId,
      customerId: paymentsTable.customerId,
      amount: paymentsTable.amount,
      currency: paymentsTable.currency,
      referenceId: paymentsTable.referenceId,
      verifiedAt: paymentsTable.verifiedAt,
      status: paymentsTable.status,
      context: paymentsTable.context,
      customerName: customerTable.name,
      customerPhone: customerTable.phone,
      organizationName: organizationsTable.name,
      ownerPhone: usersTable.phone,
    })
    .from(paymentsTable)
    .leftJoin(customerTable, eq(paymentsTable.customerId, customerTable.id))
    .leftJoin(
      organizationsTable,
      eq(paymentsTable.organizationId, organizationsTable.id),
    )
    .leftJoin(
      membershipsTable,
      and(
        eq(membershipsTable.organizationId, organizationsTable.id),
        eq(membershipsTable.role, "OWNER"),
      ),
    )
    .leftJoin(usersTable, eq(membershipsTable.userId, usersTable.id))
    .where(eq(paymentsTable.id, paymentId))
    .limit(1);

  if (
    !payment ||
    payment.status !== "VERIFIED" ||
    !payment.organizationName
  ) {
    return { created: false, eventIds: [], reason: "Payment has no eligible recipient" };
  }

  const reference =
    payment.referenceId || `PAY-${payment.id.slice(0, 8).toUpperCase()}`;
  const commonPayload = {
    customerName: payment.customerName || "Customer",
    organizationName: payment.organizationName,
    amount: payment.amount,
    currency: payment.currency,
    reference,
    paymentDate: (payment.verifiedAt || new Date()).toISOString(),
  };
  const recipients =
    payment.context === "PLATFORM"
      ? [
          payment.ownerPhone
            ? {
                recipientType: "WHOLESALER_OWNER" as const,
                recipientPhone: payment.ownerPhone,
              }
            : null,
          process.env.WHATSAPP_PLATFORM_ADMIN_PHONE
            ? {
                recipientType: "PLATFORM_ADMIN" as const,
                recipientPhone: process.env.WHATSAPP_PLATFORM_ADMIN_PHONE,
              }
            : null,
        ]
      : [
          payment.customerPhone
            ? {
                recipientType: "RETAILER" as const,
                recipientPhone: payment.customerPhone,
              }
            : null,
          payment.ownerPhone
            ? {
                recipientType: "WHOLESALER_OWNER" as const,
                recipientPhone: payment.ownerPhone,
              }
            : null,
        ];
  const eventIds: string[] = [];
  for (const recipient of recipients) {
    if (!recipient || !payment.organizationId) continue;
    const [event] = await executor
      .insert(whatsappOutboxTable)
      .values({
        paymentId: payment.id,
        organizationId: payment.organizationId,
        customerId: payment.customerId,
        recipientType: recipient.recipientType,
        recipientPhone: recipient.recipientPhone,
        messageType: MESSAGE_TYPE,
        payload: { ...commonPayload, recipientType: recipient.recipientType },
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing({
        target: [
          whatsappOutboxTable.paymentId,
          whatsappOutboxTable.recipientType,
          whatsappOutboxTable.messageType,
        ],
      })
      .returning({ id: whatsappOutboxTable.id });
    if (event) eventIds.push(event.id);
  }

  return { created: eventIds.length > 0, eventIds };
}

export async function enqueueVerifiedPaymentReceipt(paymentId: string) {
  const result = await insertReceiptEvents(db, paymentId);

  await Promise.all(result.eventIds.map((eventId) => wakeWorker(eventId)));

  return result;
}

export async function verifyOrgPaymentAndEnqueueReceipt(paymentId: string) {
  const result = await db.transaction(async (tx) => {
    const [payment] = await tx
      .select({
        id: paymentsTable.id,
        status: paymentsTable.status,
        context: paymentsTable.context,
      })
      .from(paymentsTable)
      .where(eq(paymentsTable.id, paymentId))
      .limit(1);

    if (!payment || payment.context !== "ORG" || payment.status !== "PENDING") {
      throw new Error("Payment is no longer pending organization payment");
    }

    await tx
      .update(paymentsTable)
      .set({
        status: "VERIFIED",
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(paymentsTable.id, paymentId));

    return insertReceiptEvents(tx, paymentId);
  });

  await Promise.all(result.eventIds.map((eventId) => wakeWorker(eventId)));

  return result;
}

export async function verifyPlatformPaymentAndEnqueueReceipts(paymentId: string) {
  const result = await db.transaction(async (tx) => {
    const [payment] = await tx
      .select({
        id: paymentsTable.id,
        status: paymentsTable.status,
        context: paymentsTable.context,
      })
      .from(paymentsTable)
      .where(eq(paymentsTable.id, paymentId))
      .limit(1);

    if (!payment || payment.context !== "PLATFORM" || payment.status !== "PENDING") {
      throw new Error("Payment is no longer pending platform payment");
    }

    await tx
      .update(paymentsTable)
      .set({ status: "VERIFIED", verifiedAt: new Date(), updatedAt: new Date() })
      .where(eq(paymentsTable.id, paymentId));

    return insertReceiptEvents(tx, paymentId);
  });

  await Promise.all(result.eventIds.map((eventId) => wakeWorker(eventId)));
  return result;
}

export async function claimWhatsAppEvents(workerId: string, limit: number) {
  return db.transaction(async (tx) => {
    const now = new Date();
    const staleBefore = new Date(
      now.getTime() -
        Number(process.env.WHATSAPP_LOCK_TIMEOUT_MS || 120_000),
    );

    await tx
      .update(whatsappOutboxTable)
      .set({
        status: "RETRY",
        lockedAt: null,
        lockedBy: null,
        updatedAt: now,
      })
      .where(
        and(
          eq(whatsappOutboxTable.status, "PROCESSING"),
          lte(whatsappOutboxTable.lockedAt, staleBefore),
        ),
      );

    const events = await tx
      .select()
      .from(whatsappOutboxTable)
      .where(
        and(
          or(
            eq(whatsappOutboxTable.status, "PENDING"),
            eq(whatsappOutboxTable.status, "RETRY"),
          ),
          lte(whatsappOutboxTable.availableAt, now),
        ),
      )
      .orderBy(whatsappOutboxTable.createdAt)
      .limit(limit)
      .for("update", { skipLocked: true });

    if (events.length === 0) return [];

    const claimed = [];
    for (const event of events) {
      const [updated] = await tx
        .update(whatsappOutboxTable)
        .set({
          status: "PROCESSING",
          attempts: event.attempts + 1,
          lockedAt: now,
          lockedBy: workerId,
          updatedAt: now,
        })
        .where(eq(whatsappOutboxTable.id, event.id))
        .returning();
      if (updated) claimed.push(updated);
    }

    return claimed;
  });
}

export async function markWhatsAppEventSent(eventId: string) {
  await db
    .update(whatsappOutboxTable)
    .set({
      status: "SENT",
      sentAt: new Date(),
      lockedAt: null,
      lockedBy: null,
      lastError: null,
      updatedAt: new Date(),
    })
    .where(eq(whatsappOutboxTable.id, eventId));
}

export async function markWhatsAppEventFailed(
  eventId: string,
  attempts: number,
  error: string,
) {
  const maxAttempts = Number(process.env.WHATSAPP_MAX_ATTEMPTS || 5);
  const permanentlyFailed = attempts >= maxAttempts;
  const delayMinutes = Math.min(120, 2 ** Math.max(0, attempts - 1));

  await db
    .update(whatsappOutboxTable)
    .set({
      status: permanentlyFailed ? "FAILED" : "RETRY",
      availableAt: new Date(Date.now() + delayMinutes * 60 * 1000),
      lockedAt: null,
      lockedBy: null,
      lastError: error.slice(0, 500),
      updatedAt: new Date(),
    })
    .where(eq(whatsappOutboxTable.id, eventId));
}
