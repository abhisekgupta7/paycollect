"use client";

import { COMPANY_CONFIG } from "@/app/config/company";
import ImageUploader from "@/components/Utility/ImageUploader";
import { submitSubscriptionPaymentAction } from "@/app/features/billing/actions/submit-subscription-payment";
import { CheckCircle2, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export default function SubscriptionPage() {
  const [proofUrl, setProofUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUploadComplete = (url: string) => {
    setProofUrl(url);
    toast.success("Proof image uploaded successfully");
  };

  const handleUploadError = () => {
    toast.error("Failed to upload proof image");
  };

  const handleSubmitPayment = async () => {
    if (!proofUrl) {
      toast.error("Please upload a proof image first");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitSubscriptionPaymentAction(proofUrl);

      if (result.success) {
        toast.success(result.message);
        setProofUrl(""); // Clear the form after successful submission
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit payment";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <main className="bg-[#0b0f14] px-6 pt-12 pb-6 text-slate-100">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-[#10161e] p-4 sm:p-5">
            <Image
              src={COMPANY_CONFIG.qrImage}
              alt="Payment QR Code"
              width={308}
              height={308}
              className="h-44 w-44 rounded-xl bg-white p-2 sm:h-52 sm:w-52"
            />
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 text-slate-400">
              <span>Receiver</span>
              <span className="font-medium text-white">
                {COMPANY_CONFIG.name}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 text-slate-400">
              <span>Phone</span>
              <span className="font-medium text-white">
                {COMPANY_CONFIG.phone}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-slate-400">
              <span>Amount due</span>
              <span className="text-lg font-semibold text-white">Rs. 15,000</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#10161e] p-4">
            <ImageUploader
              onUploadComplete={handleUploadComplete}
              onError={handleUploadError}
              folder="/SubscriptionProofs"
              label="Paste screenshot or choose file"
              allowPaste
            />
          </div>

          {proofUrl && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Screenshot ready for verification.
              </div>

              <button
                onClick={handleSubmitPayment}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-600/50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Payment"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
