import { ArrowDownRight, ArrowUpRight, CircleDot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminPayments } from "@/app/features/billing/actions/get-admin-payments";

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

export default async function AdminDashboardPage() {
  const result = await getAdminPayments("ALL");
  const payments: AdminPaymentRow[] = result.success
    ? (result.payments as AdminPaymentRow[])
    : [];

  const verifiedPayments = payments.filter(
    (payment) => payment.status === "VERIFIED",
  );
  const pendingPayments = payments.filter(
    (payment) => payment.status === "PENDING",
  );
  const verifiedAmount = verifiedPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  const summaryCards = [
    {
      label: "      Retailer Payments",
      value: payments.length.toString(),
      delta: `${pendingPayments.length} pending`,
      trend: "up",
      meta: "All platform payment submissions",
    },
    {
      label: "Verified Amount",
      value: formatCurrency(verifiedAmount),
      delta: `${verifiedPayments.length} verified`,
      trend: "up",
      meta: "      Verified retailer payments",
    },
    {
      label: "Needs Review",
      value: pendingPayments.length.toString(),
      delta: "review queue",
      trend: pendingPayments.length > 0 ? "up" : "down",
      meta: "      Payments waiting for verification",
    },
  ];

  const recentPayments = payments.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Admin Overview
          </p>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Platform-wide payment review across all organizations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
          >
            <CircleDot className="h-3 w-3" />
            Live
          </Badge>
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground">
            Updated now
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {summaryCards.map((card) => {
          const isUp = card.trend === "up";
          const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <div
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                    isUp
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "bg-red-500/10 text-red-300"
                  }`}
                >
                  <TrendIcon className="h-3.5 w-3.5" />
                  {card.delta}
                </div>
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{card.meta}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Recent Retailer Payments
              </p>
              <p className="text-xs text-muted-foreground">
                Latest payment submissions from wholesalers
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {recentPayments.length} latest
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
            <Table>
              <TableCaption>Recent retailer payment submissions.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Org</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((payment) => (
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
                    <TableCell className="text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {recentPayments.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      No platform payments to display.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Admin Snapshot
              </p>
              <p className="text-xs text-muted-foreground">
                Platform review queue summary
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-muted-foreground">Pending review</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {pendingPayments.length}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-muted-foreground">Verified payments</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {verifiedPayments.length}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-muted-foreground">Latest status</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {recentPayments[0]?.status || "No data"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
