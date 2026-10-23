// features/billing/components/pricing-section.tsx

"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function PricingSection() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* RIGHT: ENTERPRISE PLAN */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-emerald-300">ENTERPRISE</p>
          <h2 className="text-xl font-semibold text-slate-100">
            Wholesale Scale Plan
          </h2>
        </div>

        <p className="mt-2 text-sm text-slate-400">
          For large teams with advanced automation needs.
        </p>

        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          <li>✔ Multi-branch management</li>
          <li>✔ Advanced payment recovery automation</li>
          <li>✔ Custom khata workflows</li>
          <li>✔ API integrations & webhooks</li>
        </ul>

        <Link href="/contact" className="w-full">
          <Button className="mt-6 w-full border-emerald-400 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 border">
          Contact Sales
          </Button>
        </Link>
      </div>
    </div>
  );
}
