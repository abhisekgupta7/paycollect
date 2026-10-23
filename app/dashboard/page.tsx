import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock3, CreditCard, MoreHorizontal, Users, WalletCards } from "lucide-react";
import { getDashboardSummaryForOrg } from "@/app/features/dashboard/actions/get-dashboard-summary";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "NPR", maximumFractionDigits: 0 }).format(amount / 100);
}

function Status({ status }: { status: string }) {
  const verified = status === "VERIFIED";
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${verified ? "bg-[#eaf7f0] text-[#16845b]" : "bg-[#fff5df] text-[#b7791f]"}`}><span className={`h-1.5 w-1.5 rounded-full ${verified ? "bg-[#16845b]" : "bg-[#b7791f]"}`} />{verified ? "Paid" : "Pending review"}</span>;
}

export default async function DashboardPage() {
  const summary = await getDashboardSummaryForOrg();
  const data = summary.success && summary.data ? summary.data : null;
  const paymentRows = data?.recentPayments ?? [];
  const retailerRows = data?.retailers ?? [];
  const pendingCount = data?.pendingPaymentCount ?? 0;
  const verifiedCount = data?.verifiedPaymentCount ?? 0;
  const totalPaymentCount = data?.totalPaymentCount ?? 0;
  const collected = data?.collected ?? 0;
  const outstanding = data?.outstanding ?? 0;
  const ledgerBalance = data?.ledgerBalance ?? 0;
  const cards = [
    { label: "Total outstanding", value: formatCurrency(outstanding), meta: `${data?.retailerCount ?? 0} retailer accounts`, icon: WalletCards, tone: "indigo" },
    { label: "Collected this period", value: formatCurrency(collected), meta: `${verifiedCount} verified payments`, icon: CheckCircle2, tone: "green" },
    { label: "Awaiting review", value: pendingCount.toString(), meta: "Payment proofs to verify", icon: Clock3, tone: "amber" },
    { label: "Ledger balance", value: formatCurrency(ledgerBalance), meta: `${data?.ledgerEntryCount ?? 0} ledger entries`, icon: CreditCard, tone: "blue" },
  ];

  return <div className="space-y-7 px-5 py-7 sm:px-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-[#667085]">Monday, October 23, 2026</p><h1 className="mt-1 text-[28px] font-semibold tracking-tight text-[#172033]">Overview</h1><p className="mt-1 text-sm text-[#667085]">Monitor your receivables and collections.</p></div><div className="flex gap-2"><Link href="/dashboard/payments" className="inline-flex items-center gap-2 rounded-lg border border-[#d0d5dd] bg-white px-3.5 py-2 text-sm font-medium text-[#243b64] hover:bg-[#f7f8fa]">View payments</Link><Link href="/dashboard/retailers" className="inline-flex items-center gap-2 rounded-lg bg-[#243b64] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#1b2f52]">Manage retailers <ArrowUpRight className="h-4 w-4" /></Link></div></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, meta, icon: Icon, tone }) => <div key={label} className="rounded-xl border border-[#e4e7ec] bg-white p-5"><div className="flex items-center justify-between"><p className="text-sm font-medium text-[#667085]">{label}</p><span className={`rounded-lg p-2 ${tone === "green" ? "bg-[#eaf7f0] text-[#16845b]" : tone === "amber" ? "bg-[#fff5df] text-[#b7791f]" : tone === "blue" ? "bg-[#eaf2fd] text-[#3478c8]" : "bg-[#eef2fa] text-[#243b64]"}`}><Icon className="h-4 w-4" /></span></div><p className="mt-4 tabular-nums text-[26px] font-semibold tracking-tight text-[#172033]">{value}</p><p className="mt-1 text-xs text-[#98a2b3]">{meta}</p></div>)}</div>
    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]"><section className="rounded-xl border border-[#e4e7ec] bg-white"><div className="flex items-center justify-between border-b border-[#e4e7ec] px-5 py-4"><div><h2 className="text-base font-semibold text-[#172033]">Retailers needing attention</h2><p className="mt-1 text-xs text-[#667085]">Accounts with the highest outstanding balances.</p></div><Link href="/dashboard/retailers" className="text-sm font-medium text-[#243b64] hover:underline">View all</Link></div><div className="divide-y divide-[#e4e7ec]">{retailerRows.slice(0, 5).map((retailer) => <div key={retailer.id} className="flex items-center justify-between gap-4 px-5 py-4"><div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef2fa] text-sm font-semibold text-[#243b64]">{retailer.name.slice(0, 1).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-medium text-[#172033]">{retailer.name}</p><p className="truncate text-xs text-[#98a2b3]">{retailer.phone || retailer.email || "No contact details"}</p></div></div><div className="text-right"><p className="tabular-nums text-sm font-semibold text-[#172033]">{formatCurrency(retailer.remainingBalance)}</p><p className="text-xs text-[#b7791f]">Outstanding</p></div></div>)}{retailerRows.length === 0 && <div className="px-5 py-12 text-center text-sm text-[#667085]"><Users className="mx-auto mb-3 h-7 w-7 text-[#98a2b3]" />No retailer balances yet.</div>}</div></section>
      <section className="rounded-xl border border-[#e4e7ec] bg-white"><div className="flex items-center justify-between border-b border-[#e4e7ec] px-5 py-4"><div><h2 className="text-base font-semibold text-[#172033]">Recent activity</h2><p className="mt-1 text-xs text-[#667085]">Latest payment updates.</p></div><MoreHorizontal className="h-5 w-5 text-[#98a2b3]" /></div><div className="divide-y divide-[#e4e7ec]">{paymentRows.map((payment) => <div key={payment.id} className="flex items-center justify-between gap-3 px-5 py-4"><div className="min-w-0"><p className="truncate text-sm font-medium text-[#172033]">{payment.customerName || "Retailer payment"}</p><p className="mt-1 text-xs text-[#98a2b3]">{new Date(payment.createdAt).toLocaleDateString()}</p></div><div className="flex shrink-0 flex-col items-end gap-1"><p className="tabular-nums text-sm font-semibold text-[#172033]">{formatCurrency(Number(payment.amount))}</p><Status status={payment.status} /></div></div>)}{paymentRows.length === 0 && <div className="px-5 py-12 text-center text-sm text-[#667085]">No payments recorded yet.</div>}</div></section></div>
    <section className="rounded-xl border border-[#e4e7ec] bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="text-base font-semibold text-[#172033]">Collection performance</h2><p className="mt-1 text-xs text-[#667085]">Use verified payments to keep retailer balances current.</p></div><CreditCard className="h-5 w-5 text-[#243b64]" /></div><div className="mt-5 h-2 rounded-full bg-[#eef2fa]"><div className="h-2 rounded-full bg-[#243b64]" style={{ width: totalPaymentCount ? `${Math.min(100, Math.round((verifiedCount / totalPaymentCount) * 100))}%` : "0%" }} /></div><div className="mt-3 flex justify-between text-xs text-[#667085]"><span>{verifiedCount} verified of {totalPaymentCount} submitted</span><span className="font-medium text-[#243b64]">{totalPaymentCount ? Math.round((verifiedCount / totalPaymentCount) * 100) : 0}% verified</span></div></section>
  </div>;
}
