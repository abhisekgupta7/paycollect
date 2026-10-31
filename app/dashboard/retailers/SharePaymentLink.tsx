"use client";

import { Check, Copy, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SharePaymentLink({
  organizationId,
  retailerName,
  retailerPhone,
}: {
  organizationId: string;
  retailerName?: string;
  retailerPhone?: string | null;
}) {
  const [copied, setCopied] = useState(false);

  function getLink() {
    return `${window.location.origin}/pay/${organizationId}`;
  }

  function getWhatsAppPhone() {
    const digits = retailerPhone?.replace(/\D/g, "");
    return digits ? `977${digits.slice(-10)}` : "";
  }

  function getInviteMessage() {
    return [
      `Hello${retailerName ? ` ${retailerName}` : ""},`,
      "Your wholesaler has invited you to PayCollect.",
      "",
      `Pay and submit proof here: ${getLink()}`,
      "",
      "You can install PayCollect from your browser menu after opening the link.",
      "Use your registered phone number to view payment status and download receipts.",
    ].join("\n");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(getLink());
    setCopied(true);
    toast.success("Payment link copied");
    window.setTimeout(() => setCopied(false), 2000);
  }

  function openWhatsApp() {
    const phone = getWhatsAppPhone();
    const recipient = phone ? `/${phone}` : "";
    window.open(
      `https://wa.me${recipient}?text=${encodeURIComponent(getInviteMessage())}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function shareLink() {
    const link = getLink();
    if (navigator.share) {
      await navigator.share({
        title: "PayCollect payment link",
        text: "Submit your payment proof securely",
        url: link,
      });
      return;
    }
    await copyLink();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#d0d5dd] px-3 py-2 text-xs font-medium text-[#344054] hover:bg-[#f7f8fa]"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-[#16845b]" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        {copied ? "Copied" : "Copy link"}
      </button>
      <button
        type="button"
        onClick={openWhatsApp}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#25d366] px-3 py-2 text-xs font-medium text-white hover:bg-[#1ebe5d]"
      >
        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
      </button>
      <button
        type="button"
        onClick={shareLink}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#d0d5dd] px-3 py-2 text-xs font-medium text-[#344054] hover:bg-[#f7f8fa]"
      >
        <Share2 className="h-3.5 w-3.5" /> Share
      </button>
    </div>
  );
}
