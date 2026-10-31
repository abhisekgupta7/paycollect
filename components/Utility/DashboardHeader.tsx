"use client";

import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import NotificationBell from "@/app/features/notification/components/notification-bell";
import PwaManager from "@/components/Utility/PwaManager";

type DashboardHeaderProps = {
  unreadCount: number;
  notifications: Parameters<typeof NotificationBell>[0]["notifications"];
};

const pageLabels = [
  { prefix: "/dashboard/retailers", label: "Retailers" },
  { prefix: "/dashboard/payments", label: "Payments" },
  { prefix: "/dashboard/ledger", label: "Ledger" },
  { prefix: "/dashboard/settings", label: "Settings" },
];

export default function DashboardHeader({
  unreadCount,
  notifications,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const currentPage =
    pageLabels.find((page) => pathname.startsWith(page.prefix))?.label ||
    "Overview";

  return (
    <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[#e4e7ec] bg-white/95 px-5 py-3 pl-20 shadow-sm backdrop-blur sm:px-8 sm:pl-20 lg:pl-8">
      <div>
        <p className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98a2b3] sm:block">
          Workspace
        </p>
        <p className="text-sm font-semibold text-[#172033]">{currentPage}</p>
      </div>
      <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
        <PwaManager />
        <div className="hidden items-center gap-2 rounded-lg border border-[#e4e7ec] bg-[#f7f8fa] px-3 py-2 text-sm text-[#98a2b3] md:flex">
          <Search className="h-4 w-4" />
          Search retailers, payments...
        </div>
        <NotificationBell
          unreadCount={unreadCount}
          notifications={notifications}
        />
      </div>
    </header>
  );
}
