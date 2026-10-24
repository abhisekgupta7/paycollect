type PaymentReceiptPayload = {
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
    `Hello ${safeText(payload.customerName)},`,
    "",
    "Your payment has been verified successfully.",
    "",
    `Organization: ${safeText(payload.organizationName)}`,
    `Amount: ${amount}`,
    `Reference: ${safeText(payload.reference)}`,
    `Date: ${safeText(payload.paymentDate)}`,
    "Status: Verified",
    "",
    "Thank you.",
  ].join("\n");
}
