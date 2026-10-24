export function normalizeWhatsAppPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const defaultCountryCode = process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "977";
  const normalized =
    digits.length === 10 && digits.startsWith("9")
      ? `${defaultCountryCode}${digits}`
      : digits;

  if (
    normalized.length < 11 ||
    normalized.length > 15 ||
    !normalized.startsWith(defaultCountryCode)
  ) {
    throw new Error("Recipient phone number is invalid");
  }

  return normalized;
}

export function toWhatsAppChatId(phone: string) {
  return `${normalizeWhatsAppPhone(phone)}@c.us`;
}

export function maskPhone(phone: string) {
  const normalized = normalizeWhatsAppPhone(phone);
  return `${normalized.slice(0, 3)}******${normalized.slice(-2)}`;
}
