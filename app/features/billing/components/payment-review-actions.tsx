"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { verifyPaymentAction } from "../actions/verify-payment";

type PaymentReviewActionsProps = {
  paymentId: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  proofUrl: string | null;
  amount: number;
  currency: string;
  createdAt: Date;
};

function formatCurrency(amountInPaisa: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountInPaisa / 100);
}

export default function PaymentReviewActions({
  paymentId,
  customerName,
  customerPhone,
  customerEmail,
  proofUrl,
  amount,
  currency,
  createdAt,
}: PaymentReviewActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const handleVerify = () => {
    startTransition(async () => {
      const result = await verifyPaymentAction(paymentId, "approve");

      if (!result.success) {
        toast.error(result.message || "Payment is not verified");
        return;
      }

      toast.success("Payment verified successfully");
      setIsDialogOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setIsDialogOpen(true)}>
        Review
      </Button>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl border-0 p-0 shadow-2xl">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-semibold text-foreground">
                Review Payment
              </h3>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                disabled={isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-6 p-4 md:grid-cols-[1fr_1.2fr]">
              <div className="space-y-3 rounded-lg border p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Payment Details
                </p>
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium text-foreground">
                    {customerName || "Platform subscription"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">
                    {customerPhone || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">
                    {customerEmail || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatCurrency(amount, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Submitted On</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-lg border p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Proof Screenshot
                </p>
                {proofUrl ? (
                  <a
                    href={proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block overflow-hidden rounded-md border bg-muted"
                  >
                    <div className="relative h-64 w-full">
                      <Image
                        src={proofUrl}
                        alt="Payment proof screenshot"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain"
                      />
                    </div>
                  </a>
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
                    No proof screenshot available
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t p-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerify}
                disabled={isPending}
                className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
              >
                {isPending ? "Verifying..." : "Verify"}
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
