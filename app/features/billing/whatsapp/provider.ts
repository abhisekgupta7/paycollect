import { toWhatsAppChatId } from "./phone";

export type WhatsAppSendInput = {
  phone: string;
  text: string;
  idempotencyKey: string;
};

export type WhatsAppSendResult = {
  providerMessageId?: string;
};

function getSendUrl() {
  return (
    process.env.WHATSAPP_SEND_URL ||
    `${process.env.WHATSAPP_BASE_URL || "http://localhost:3001"}/api/sendText`
  );
}

export async function sendWhatsAppText(
  input: WhatsAppSendInput,
): Promise<WhatsAppSendResult> {
  const provider = process.env.WHATSAPP_PROVIDER || "local";
  if (provider === "disabled") {
    throw new Error("WhatsApp provider is disabled");
  }
  if (provider !== "local") {
    throw new Error(`Unsupported WhatsApp provider: ${provider}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    Number(process.env.WHATSAPP_REQUEST_TIMEOUT_MS || 10_000),
  );

  try {
    const response = await fetch(getSendUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.WHATSAPP_API_KEY
          ? { Authorization: `Bearer ${process.env.WHATSAPP_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        chatId: toWhatsAppChatId(input.phone),
        text: input.text,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`WhatsApp provider returned HTTP ${response.status}`);
    }

    const result = (await response.json().catch(() => ({}))) as {
      id?: string;
      messageId?: string;
    };

    return {
      providerMessageId: result.messageId || result.id,
    };
  } finally {
    clearTimeout(timeout);
  }
}
