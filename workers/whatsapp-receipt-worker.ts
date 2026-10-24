import "dotenv/config";
import { randomUUID } from "node:crypto";
import { claimWhatsAppEvents, markWhatsAppEventFailed, markWhatsAppEventSent } from "../app/features/billing/whatsapp/outbox.service";
import { createPaymentReceiptMessage } from "../app/features/billing/whatsapp/templates";
import { sendWhatsAppText } from "../app/features/billing/whatsapp/provider";
import { getRedisClient } from "../lib/redis";

const workerId = `whatsapp-worker-${randomUUID().slice(0, 8)}`;
const batchSize = Number(process.env.WHATSAPP_BATCH_SIZE || 5);
const intervalMs = Number(process.env.WHATSAPP_POLL_INTERVAL_MS || 5000);
const sendIntervalMs = Number(process.env.WHATSAPP_MIN_SEND_INTERVAL_MS || 4000);
let stopping = false;

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function processBatch() {
  const events = await claimWhatsAppEvents(workerId, batchSize);

  for (const event of events) {
    if (stopping) break;
    const startedAt = Date.now();

    try {
      const payload = event.payload as {
        customerName: string;
        organizationName: string;
        amount: number;
        currency: string;
        reference: string;
        paymentDate: string;
      };
      await sendWhatsAppText({
        phone: event.recipientPhone,
        text: createPaymentReceiptMessage(payload),
        idempotencyKey: event.id,
      });
      await markWhatsAppEventSent(event.id);
      console.info("whatsapp_delivery", {
        eventId: event.id,
        paymentId: event.paymentId,
        recipientType: event.recipientType,
        attempt: event.attempts,
        result: "sent",
        durationMs: Date.now() - startedAt,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown delivery error";
      await markWhatsAppEventFailed(event.id, event.attempts, message);
      console.error("whatsapp_delivery", {
        eventId: event.id,
        paymentId: event.paymentId,
        recipientType: event.recipientType,
        attempt: event.attempts,
        result: "failed",
        error: message,
        durationMs: Date.now() - startedAt,
      });
    }

    if (!stopping) await sleep(sendIntervalMs);
  }
}

async function run() {
  console.info("WhatsApp receipt worker started", { workerId });
  const redis = await getRedisClient();
  if (redis) {
    await redis.subscribe("paycollect:whatsapp", () => {
      void processBatch().catch((error) =>
        console.error("WhatsApp event processing failed:", error),
      );
    });
  }

  while (!stopping) {
    await processBatch();
    await sleep(intervalMs);
  }
}

async function shutdown(signal: string) {
  if (stopping) return;
  stopping = true;
  console.info("WhatsApp receipt worker stopping", { signal });
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

run().catch((error) => {
  console.error("WhatsApp receipt worker stopped unexpectedly:", error);
  process.exitCode = 1;
});
