"use server";

import { and, eq, lte, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  customerTable,
  organizationsTable,
  paymentsTable,
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

async function insertReceiptEvent(
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
    })
    .from(paymentsTable)
    .leftJoin(customerTable, eq(paymentsTable.customerId, customerTable.id))
    .leftJoin(
      organizationsTable,
      eq(paymentsTable.organizationId, organizationsTable.id),
    )
    .where(eq(paymentsTable.id, paymentId))
    .limit(1);

  if (
    !payment ||
    payment.status !== "VERIFIED" ||
    payment.context !== "ORG" ||
    !payment.organizationId ||
    !payment.customerId ||
    !payment.customerPhone ||
    !payment.customerName ||
    !payment.organizationName
  ) {
    return { created: false, reason: "Payment has no eligible retailer recipient" };
  }

  const reference =
    payment.referenceId || `PAY-${payment.id.slice(0, 8).toUpperCase()}`;
  const payload = {
    customerName: payment.customerName,
    organizationName: payment.organizationName,
    amount: payment.amount,
    currency: payment.currency,
    reference,
    paymentDate: (payment.verifiedAt || new Date()).toISOString(),
  };

  const [event] = await executor
    .insert(whatsappOutboxTable)
    .values({
      paymentId: payment.id,
      organizationId: payment.organizationId,
      customerId: payment.customerId,
      recipientType: "RETAILER",
      recipientPhone: payment.customerPhone,
      messageType: MESSAGE_TYPE,
      payload,
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

  return { created: Boolean(event), eventId: event?.id };
}

export async function enqueueVerifiedPaymentReceipt(paymentId: string) {
  const event = await insertReceiptEvent(db, paymentId);

  await wakeWorker(event.eventId);

  return event;
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

    return insertReceiptEvent(tx, paymentId);
  });

  await wakeWorker(result.eventId);

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
