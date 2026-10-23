import { getLedgerSummaryForOrg } from "@/app/features/ledger/actions/get-ledger-summary";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export default async function LedgerPage() {
  const result = await getLedgerSummaryForOrg();
  const ledger = result.success ? result.data : null;

  return (
    <div className="space-y-6 px-5 py-7 sm:px-8">
      <div>
        <p className="text-sm font-medium text-[#667085]">Finance</p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-[#172033]">
          Ledger
        </h1>
        <p className="mt-1 text-sm text-[#667085]">
          Track credits, debits, and the current account balance.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Balance", ledger?.balance ?? 0],
          ["Credits", ledger?.totalCredit ?? 0],
          ["Debits", ledger?.totalDebit ?? 0],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-[#e4e7ec] bg-white p-5"
          >
            <p className="text-sm text-[#667085]">{label}</p>
            <p className="mt-3 text-2xl font-semibold text-[#172033]">
              {formatCurrency(Number(value))}
            </p>
          </div>
        ))}
      </div>
      <section className="overflow-hidden rounded-xl border border-[#e4e7ec] bg-white">
        <div className="border-b border-[#e4e7ec] px-5 py-4 text-sm font-semibold text-[#172033]">
          Recent entries
        </div>
        <div className="divide-y divide-[#e4e7ec]">
          {!ledger?.entries?.length ? (
            <p className="px-5 py-16 text-center text-sm text-[#667085]">
              No ledger entries yet.
            </p>
          ) : (
            ledger.entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-[#172033]">
                    {entry.description || entry.referenceType || "Ledger entry"}
                  </p>
                  <p className="mt-1 text-xs text-[#98a2b3]">
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    entry.type === "CREDIT" ? "text-[#16845b]" : "text-[#b42318]"
                  }`}
                >
                  {entry.type === "CREDIT" ? "+" : "-"}
                  {formatCurrency(Number(entry.amount))}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
