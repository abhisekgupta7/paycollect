import Link from "next/link";
import { CreditCard, LayoutGrid, Search, Settings, Users, WalletCards } from "lucide-react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOrganizationById, verifyMembership } from "@/app/features/auth/services/membership.service";
import DashboardSignOutButton from "@/components/Utility/DashboardSignOutButton";
import NotificationBell from "@/app/features/notification/components/notification-bell";
import { getDashboardNotifications } from "@/app/features/notification/actions/get-dashboard-notifications";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "Retailers", href: "/dashboard/retailers", icon: Users },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { label: "Ledger", href: "/dashboard/ledger", icon: WalletCards },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const orgId = session?.user?.activeOrgId;
  if (!session?.user?.id || !orgId) redirect("/auth/login");
  const membership = await verifyMembership(session.user.id, orgId);
  const organization = await getOrganizationById(orgId);
  if (!membership || !organization) redirect("/");
  const notifications = await getDashboardNotifications();

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#172033]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[240px_1fr]">
        <aside className="hidden border-r border-[#e4e7ec] bg-white px-4 py-6 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 px-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#243b64] text-sm font-bold text-white">PC</span><div><p className="text-sm font-semibold text-[#172033]">PayCollect</p><p className="text-xs text-[#98a2b3]">Receivables OS</p></div></div>
          <div className="mt-7 rounded-lg border border-[#e4e7ec] bg-[#f7f8fa] px-3 py-2"><p className="text-[11px] uppercase tracking-wide text-[#98a2b3]">Workspace</p><p className="mt-1 truncate text-sm font-medium text-[#243b64]">{organization.name}</p></div>
          <nav className="mt-6 flex-1 space-y-1">{navItems.map(({ label, href, icon: Icon }) => <Link key={label} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${href === "/dashboard" ? "bg-[#eef2fa] text-[#243b64]" : "text-[#667085] hover:bg-[#f7f8fa] hover:text-[#243b64]"}`}><Icon className="h-4 w-4" />{label}</Link>)}</nav>
          <DashboardSignOutButton />
          <div className="mt-4 flex items-center gap-3 border-t border-[#e4e7ec] pt-4"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef2fa] text-sm font-semibold text-[#243b64]">{session.user.name?.slice(0, 1).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-medium">{session.user.name}</p><p className="text-xs text-[#98a2b3]">{membership.role}</p></div></div>
        </aside>
        <main className="min-w-0"><header className="flex h-16 items-center justify-between border-b border-[#e4e7ec] bg-white px-5 sm:px-8"><div className="hidden items-center gap-2 text-sm text-[#667085] sm:flex"><span>Workspace</span><span>/</span><span className="font-medium text-[#172033]">Overview</span></div><div className="flex w-full items-center justify-end gap-2 sm:w-auto"><div className="hidden items-center gap-2 rounded-lg border border-[#e4e7ec] bg-[#f7f8fa] px-3 py-2 text-sm text-[#98a2b3] md:flex"><Search className="h-4 w-4" />Search retailers, payments...</div><NotificationBell unreadCount={notifications.unreadCount} notifications={notifications.notifications} /></div></header><nav className="flex gap-1 overflow-x-auto border-b border-[#e4e7ec] bg-white px-4 py-2 lg:hidden">{navItems.map(({ label, href, icon: Icon }) => <Link key={label} href={href} className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-[#667085] hover:bg-[#f7f8fa] hover:text-[#243b64]"><Icon className="h-3.5 w-3.5" />{label}</Link>)}</nav>{children}</main>
      </div>
    </div>
  );
}
