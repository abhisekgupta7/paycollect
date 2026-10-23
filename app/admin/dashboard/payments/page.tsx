import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PaymentReviewActions from "@/app/features/billing/components/payment-review-actions";
import { getAdminPayments } from "@/app/features/billing/actions/get-admin-payments";

type StatusFilter = "ALL" | "PENDING" | "VERIFIED" | "REJECTED";

type AdminPaymentRow = {
  id: string;
  organizationId: string | null;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  proofUrl: string | null;
  createdAt: Date;
  organizationName: string;
  organizationPhone: string | null;
};

function formatCurrency(amountInPaisa: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(amountInPaisa / 100);
}

type PaymentsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPaymentsPage({
  searchParams,
}: PaymentsPageProps) {
  const resolvedSearchParams = await searchParams;
  const rawStatus = resolvedSearchParams?.status;
  const selectedStatus: StatusFilter =
    rawStatus === "PENDING" ||
    rawStatus === "VERIFIED" ||
    rawStatus === "REJECTED"
      ? rawStatus
      : "ALL";

  const result = await getAdminPayments(selectedStatus);
  const payments: AdminPaymentRow[] = result.success
    ? (result.payments as AdminPaymentRow[])
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Payments
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            Payment Verification
          </h1>
          <p className="text-sm text-muted-foreground">
            Review wholesaler payment proofs and keep the platform ledger clean.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground">
          {payments.length} payments found
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link className={buttonVariants({ size: "sm", variant: selectedStatus === "ALL" ? "default" : "outline" })} href="/admin/dashboard/payments">All</Link>
        <Link className={buttonVariants({ size: "sm", variant: selectedStatus === "PENDING" ? "default" : "outline" })} href="/admin/dashboard/payments?status=PENDING">Pending</Link>
        <Link className={buttonVariants({ size: "sm", variant: selectedStatus === "VERIFIED" ? "default" : "outline" })} href="/admin/dashboard/payments?status=VERIFIED">Verified</Link>
        <Link className={buttonVariants({ size: "sm", variant: selectedStatus === "REJECTED" ? "default" : "outline" })} href="/admin/dashboard/payments?status=REJECTED">Rejected</Link>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5">
        <Table>
          <TableCaption>
            Retailer payment submissions with review actions for admin.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Proof</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Review</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium text-foreground">
                    {payment.organizationName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.organizationPhone || "-"}
                  </TableCell>
                  <TableCell className="text-right text-foreground">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        payment.status === "VERIFIED"
                          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                          : payment.status === "REJECTED"
                            ? "border-red-400/40 bg-red-400/10 text-red-300"
                            : "border-amber-400/40 bg-amber-400/10 text-amber-300"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {payment.proofUrl ? (
                      <Link
                        href={payment.proofUrl}
                        target="_blank"
                        className="text-sm text-emerald-300 underline-offset-4 hover:underline"
                      >
                        View Proof
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No proof
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {payment.status === "PENDING" ? (
                      <PaymentReviewActions
                        paymentId={payment.id}
                        customerName={payment.organizationName}
                        customerPhone={payment.organizationPhone}
                        customerEmail={null}
                        proofUrl={payment.proofUrl}
                        amount={payment.amount}
                        currency={payment.currency}
                        createdAt={payment.createdAt}
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  {result.success
                    ? "No platform payments found."
                    : result.message || "Unable to load admin payments."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
