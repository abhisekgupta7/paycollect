import Link from "next/link";
import { ArrowRight, CreditCard, ShieldCheck, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  const workflow = [
    [
      Users,
      "Add retailers",
      "Store each retailer's contact and balance in one tenant workspace.",
    ],
    [
      CreditCard,
      "Share a payment page",
      "Send one tenant link for proof uploads and payment status.",
    ],
    [
      ShieldCheck,
      "Verify and follow up",
      "Review proofs, approve payments, and keep the ledger current.",
    ],
  ] as const;

  return (
    <main className="bg-[#f7f8fa] text-[#172033]">
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#243b64]">
            PayCollect for wholesalers
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Track balances. Collect faster.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#667085]">
            Add retailers, share a payment link, review proof, and see what is
            still pending.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className={buttonVariants({
                className: "bg-[#243b64] text-white hover:bg-[#1b2f52]",
              })}
              href="/auth/signup"
            >
              Create workspace <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              className={buttonVariants({
                variant: "outline",
                className:
                  "border-[#d0d5dd] bg-white text-[#243b64] hover:bg-[#eef2fa]",
              })}
              href="#platform"
            >
              How it works
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-[#d0d5dd] bg-white p-4 shadow-lg shadow-[#243b64]/10">
          <div className="rounded-xl border border-[#e4e7ec] bg-[#f7f8fa] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[#667085]">Workspace</p>
                <p className="mt-1 text-2xl font-semibold text-[#172033]">
                  Collections
                </p>
              </div>
              <div className="rounded-lg bg-[#eef2fa] p-2 text-[#243b64]">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-5 h-2 rounded-full bg-[#e4e7ec]">
              <div className="h-2 w-3/4 rounded-full bg-[#243b64]" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ["Balances", "Organized"],
                ["Proofs", "Verified"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-[#e4e7ec] bg-white p-3"
                >
                  <p className="text-xs text-[#98a2b3]">{label}</p>
                  <p className="mt-1 font-semibold text-[#172033]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section id="platform" className="mx-auto max-w-7xl px-6 py-12">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#243b64]">
            One workflow
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            From retailer to verified payment.
          </h2>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {workflow.map(([Icon, title, description], index) => (
            <div
              key={title}
              className="rounded-xl border border-[#e4e7ec] bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef2fa] text-sm font-semibold text-[#243b64]">
                  {index + 1}
                </span>
                <Icon className="h-5 w-5 text-[#243b64]" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{title}</h3>
              <p className="mt-1 text-sm leading-5 text-[#667085]">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-2xl border border-[#243b64] bg-[#243b64] p-6 text-white shadow-lg shadow-[#243b64]/15 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b8d9c8]">
                Subscription
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Rs. 7,999 / 30 days
              </h2>
              <p className="mt-2 text-sm text-[#d7dfed]">
                Submit proof. Admin verifies. Workspace opens.
              </p>
            </div>
            <div className="rounded-xl bg-white p-4 text-center text-[#172033]">
              <p className="text-sm text-[#667085]">Wholesaler access</p>
              <p className="mt-1 text-3xl font-semibold">Rs. 7,999</p>
              <Link
                className={buttonVariants({
                  className:
                    "mt-4 w-full bg-[#16845b] text-white hover:bg-[#126b49]",
                })}
                href="/subscriptionPage"
              >
                Subscribe <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
