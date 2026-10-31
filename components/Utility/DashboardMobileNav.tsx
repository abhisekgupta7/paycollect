"use client";

import {
  CreditCard,
  LayoutGrid,
  Settings,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "Retailers", href: "/dashboard/retailers", icon: Users },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { label: "Ledger", href: "/dashboard/ledger", icon: WalletCards },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile workspace navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e4e7ec] bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(23,32,51,0.08)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {items.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium transition-colors ${
                active
                  ? "bg-[#eef2fa] text-[#243b64]"
                  : "text-[#98a2b3] hover:bg-[#f7f8fa] hover:text-[#243b64]"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
