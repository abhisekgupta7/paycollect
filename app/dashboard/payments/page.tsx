import { getOrganizationPayments } from "@/app/features/billing/actions/get-org-payments";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export default async function PaymentsPage() {
  const result = await getOrganizationPayments();
  const payments = result.success ? result.payments : [];

  return (
    <div className="space-y-6 px-5 py-7 sm:px-8">
      <div>
        <p className="text-sm font-medium text-[#667085]">Collections</p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-[#172033]">
          Payments
        </h1>
        <p className="mt-1 text-sm text-[#667085]">
          Review payment proofs and collection activity.
        </p>
      </div>
      <section className="overflow-hidden rounded-xl border border-[#e4e7ec] bg-white">
        <div className="divide-y divide-[#e4e7ec]">
          {payments.length === 0 ? (
            <p className="px-5 py-16 text-center text-sm text-[#667085]">
              No payments recorded yet.
            </p>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-[#172033]">
                    {payment.customerName || "Retailer payment"}
                  </p>
                  <p className="mt-1 text-xs text-[#98a2b3]">
                    {new Date(payment.createdAt).toLocaleString()} ·{" "}
                    {payment.provider}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#172033]">
                    {formatCurrency(Number(payment.amount))}
                  </p>
                  <span className="text-xs font-medium text-[#667085]">
                    {payment.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
