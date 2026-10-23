import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { getAllCustomersForOrg } from "@/app/features/customer/actions/get-all-customers";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export default async function RetailersPage() {
  const result = await getAllCustomersForOrg();
  const retailers = result.success ? result.customers : [];

  return (
    <div className="space-y-6 px-5 py-7 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#667085]">Receivables</p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-[#172033]">
            Retailers
          </h1>
          <p className="mt-1 text-sm text-[#667085]">
            Keep every retailer account and balance in one place.
          </p>
        </div>
        <Link
          href="/dashboard/retailers/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[#243b64] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#1b2f52]"
        >
          <Plus className="h-4 w-4" />
          Add retailer
        </Link>
      </div>
      <section className="overflow-hidden rounded-xl border border-[#e4e7ec] bg-white">
        <div className="border-b border-[#e4e7ec] px-5 py-4">
          <p className="text-sm font-semibold text-[#172033]">
            {retailers.length} retailer accounts
          </p>
        </div>
        {retailers.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-[#667085]">
            <Users className="mx-auto mb-3 h-8 w-8 text-[#98a2b3]" />
            No retailers added yet.
          </div>
        ) : (
          <div className="divide-y divide-[#e4e7ec]">
            {retailers.map((retailer) => (
              <div
                key={retailer.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef2fa] text-sm font-semibold text-[#243b64]">
                    {retailer.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#172033]">
                      {retailer.name}
                    </p>
                    <p className="truncate text-xs text-[#98a2b3]">
                      {retailer.phone} · {retailer.email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#172033]">
                    {formatCurrency(retailer.remainingBalance)}
                  </p>
                  <p className="text-xs text-[#b7791f]">Outstanding</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
