type PaymentReceiptPayload = {
  recipientType: "RETAILER" | "WHOLESALER_OWNER" | "PLATFORM_ADMIN";
  customerName: string;
  organizationName: string;
  amount: number;
  currency: string;
  reference: string;
  paymentDate: string;
};

function safeText(value: string) {
  return value.replace(/[*_~`]/g, "").trim();
}

export function createPaymentReceiptMessage(payload: PaymentReceiptPayload) {
  const amount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: payload.currency,
    maximumFractionDigits: 0,
  }).format(payload.amount / 100);

  return [
    "*PayCollect Payment Receipt*",
    "",
    `Hello ${payload.recipientType === "RETAILER" ? safeText(payload.customerName) : "PayCollect team"},`,
    "",
    "Your payment has been verified successfully.",
    "",
    `Organization: ${safeText(payload.organizationName)}`,
    `Amount: ${amount}`,
    `Reference: ${safeText(payload.reference)}`,
    `Date: ${safeText(payload.paymentDate)}`,
    "Status: Verified",
    "",
    payload.recipientType === "RETAILER"
      ? "Thank you."
      : "Please keep this receipt for your records.",
  ].join("\n");
}
