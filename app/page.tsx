import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Users,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  const features = [
    [
      Users,
      "Retailer ledger",
      "Keep each retailer's outstanding balance and payment history in one reliable record.",
    ],
    [
      CreditCard,
      "Frictionless collection",
      "Share a payment page and let retailers submit proof without calling your office.",
    ],
    [
      ShieldCheck,
      "Verified money trail",
      "Review incoming payments, approve proof, and keep your books aligned.",
    ],
  ] as const;

  return (
    <main className="bg-[#f7f8fa] text-[#172033]">
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
        <div>
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-[#243b64]">
            Receivables, finally under control
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
            Recover every rupee your retail network owes you.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#667085]">
            PayCollect gives wholesalers one clear place to track retailer
            balances, share payment links, verify proof, and follow up before
            overdue money becomes a problem.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className={buttonVariants({
                className: "bg-[#243b64] text-white hover:bg-[#1b2f52]",
              })}
              href="/auth/signup"
            >
              Start collecting <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              className={buttonVariants({
                variant: "outline",
                className:
                  "border-[#d0d5dd] bg-white text-[#243b64] hover:bg-[#eef2fa]",
              })}
              href="#platform"
            >
              See how it works
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-5 text-sm text-[#667085]">
            {[
              "Built for wholesalers",
              "No product catalog",
              "Payment proof included",
            ].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#16845b]" />
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-[#d0d5dd] bg-white p-5 shadow-xl shadow-[#243b64]/10">
          <div className="rounded-2xl border border-[#e4e7ec] bg-[#f7f8fa] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#667085]">Receivables workspace</p>
                <p className="mt-2 text-3xl font-semibold text-[#172033]">
                  Clearer collections
                </p>
              </div>
              <div className="rounded-full bg-[#eef2fa] p-3 text-[#243b64]">
                <CreditCard />
              </div>
            </div>
            <div className="mt-6 h-2 rounded-full bg-[#e4e7ec]">
              <div className="h-2 w-3/4 rounded-full bg-[#243b64]" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                ["Retailer balances", "Organized"],
                ["Payment proofs", "Verified"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-[#e4e7ec] bg-white p-3"
                >
                  <p className="text-xs text-[#98a2b3]">{label}</p>
                  <p className="mt-2 font-semibold text-[#172033]">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-[#b8d9c8] bg-[#eaf7f0] p-4">
              <p className="text-xs uppercase tracking-wider text-[#16845b]">
                Built for action
              </p>
              <p className="mt-1 text-sm text-[#245f48]">
                See what is owed, what arrived, and what needs follow-up.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section id="platform" className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#243b64]">
            One recovery workflow
          </p>
          <h2 className="mt-3 text-3xl font-semibold">
            Know who owes you, why, and what to do next.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map(([Icon, title, description]) => (
            <div
              key={title}
              className="rounded-xl border border-[#e4e7ec] bg-white p-6"
            >
              <Icon className="h-6 w-6 text-[#243b64]" />
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#667085]">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-2xl border border-[#243b64] bg-[#243b64] p-8 text-white shadow-xl shadow-[#243b64]/15 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b8d9c8]">
                Platform subscription
              </p>
              <h2 className="mt-3 text-3xl font-semibold">
                Get your wholesaler workspace live.
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-[#d7dfed]">
                Pay Rs. 7999 for 30 days of PayCollect access. After you submit
                your payment proof, our admin team verifies it before your
                dashboard is unlocked.
              </p>
              <div className="mt-5 flex flex-wrap gap-4 text-sm text-[#d7dfed]">
                <span>Manual payment proof</span>
                <span>Admin verification</span>
                <span>30-day access</span>
              </div>
            </div>
            <div className="rounded-xl bg-white p-6 text-center text-[#172033]">
              <p className="text-sm text-[#667085]">Starting at</p>
              <p className="mt-1 text-4xl font-semibold">Rs. 7999</p>
              <p className="mt-1 text-sm text-[#667085]">per 30 days</p>
              <Link
                className={buttonVariants({
                  className:
                    "mt-5 w-full bg-[#16845b] text-white hover:bg-[#126b49]",
                })}
                href="/subscriptionPage"
              >
                Subscribe to PayCollect <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section id="faq" className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-3xl font-semibold">Questions, answered.</h2>
        <div className="mt-8">
          <Accordion>
            {[
              [
                "Is PayCollect an inventory system?",
                "No. PayCollect is focused on receivables: retailer balances, payment collection, proof review, and ledgers.",
              ],
              [
                "Can retailers pay without an account?",
                "Yes. Share a retailer payment page so they can submit a payment and proof quickly.",
              ],
              [
                "Who is it for?",
                "Wholesalers and distribution teams that sell on credit and need a dependable recovery workflow.",
              ],
            ].map(([question, answer], index) => (
              <AccordionItem key={question} value={`item-${index}`}>
                <AccordionTrigger>{question}</AccordionTrigger>
                <AccordionContent className="text-slate-400">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-2xl border border-[#cbd5e1] bg-[#eef2fa] p-8 sm:p-12">
          <h2 className="text-3xl font-semibold">
            Stop chasing spreadsheets. Start recovering on time.
          </h2>
          <p className="mt-3 max-w-xl text-[#667085]">
            Create your workspace and get a clear view of every retailer balance
            from day one.
          </p>
          <Link
            className={buttonVariants({
              className: "mt-7 bg-[#243b64] text-white hover:bg-[#1b2f52]",
            })}
            href="/auth/signup"
          >
            Create your workspace
          </Link>
        </div>
      </section>
    </main>
  );
}
