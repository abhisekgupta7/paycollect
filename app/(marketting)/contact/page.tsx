import type { Metadata } from "next";
import { COMPANY_CONFIG } from "@/app/config/company";
import { Share } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact sales",
  description: "Contact PayCollect to discuss custom onboarding.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact sales",
    description:
      "Contact PayCollect to discuss retailer payment recovery, payment verification, and custom onboarding.",
    url: "/contact",
    type: "website",
    siteName: COMPANY_CONFIG.name,
    images: ["/og-image.png"],
  },
};

export default function Contact() {
  return (
    <main className="bg-[#0b0f14] px-6 pt-12 pb-6 text-slate-100">
      <section className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm sm:p-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Contact
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
            Contact Us
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
            If you have any questions or inquiries, please feel free to reach
            out to us. We are here to help and provide you with the best service
            possible.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/subscriptionPage"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-white/10"
          >
            Subscribe
            <Share className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 text-sm text-slate-400 sm:grid-cols-3">
          <Link
            href={`mailto:${COMPANY_CONFIG.email}`}
            className="rounded-xl border border-white/10 bg-[#10161e] px-4 py-3"
          >
            <span className="block text-xs uppercase tracking-[0.16em] text-slate-500">
              Email
            </span>
            <span className="mt-1 block text-slate-100">
              {COMPANY_CONFIG.email}
            </span>
          </Link>
          <Link
            href={`tel:${COMPANY_CONFIG.phone}`}
            className="rounded-xl border border-white/10 bg-[#10161e] px-4 py-3"
          >
            <span className="block text-xs uppercase tracking-[0.16em] text-slate-500">
              Phone
            </span>
            <span className="mt-1 block text-slate-100">
              {COMPANY_CONFIG.phone}
            </span>
          </Link>
          <Link
            href={`https://wa.me/${COMPANY_CONFIG.whatsapp}`}
            className="rounded-xl border border-white/10 bg-[#10161e] px-4 py-3"
          >
            <span className="block text-xs uppercase tracking-[0.16em] text-slate-500">
              Whatsapp
            </span>
            <span className="mt-1 block text-slate-100">
              {COMPANY_CONFIG.whatsapp}
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
