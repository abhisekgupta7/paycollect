import { Search } from "lucide-react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOrganizationById, verifyMembership } from "@/app/features/auth/services/membership.service";
import DashboardSidebar from "@/components/Utility/DashboardSidebar";
import NotificationBell from "@/app/features/notification/components/notification-bell";
import { getDashboardNotifications } from "@/app/features/notification/actions/get-dashboard-notifications";
import PwaManager from "@/components/Utility/PwaManager";
import { isSubscriptionActive } from "@/app/features/billing/services/payment.services";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const orgId = session?.user?.activeOrgId;
  if (!session?.user?.id || !orgId) redirect("/auth/login");
  const membership = await verifyMembership(session.user.id, orgId);
  const organization = await getOrganizationById(orgId);
  if (!membership || !organization) redirect("/");
  if (!(await isSubscriptionActive(orgId))) redirect("/subscriptionPage");
  const notifications = await getDashboardNotifications();

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#172033]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <DashboardSidebar
          organizationName={organization.name}
          userName={session.user.name || session.user.email || "Workspace user"}
          role={membership.role}
        />
        <main className="min-w-0 flex-1">
          <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[#e4e7ec] bg-white px-5 py-3 pl-20 sm:px-8 sm:pl-20 lg:pl-8">
            <div className="hidden items-center gap-2 text-sm text-[#667085] sm:flex"><span>Workspace</span><span>/</span><span className="font-medium text-[#172033]">Overview</span></div>
            <div className="flex w-full items-center justify-end gap-2 sm:w-auto"><PwaManager /><div className="hidden items-center gap-2 rounded-lg border border-[#e4e7ec] bg-[#f7f8fa] px-3 py-2 text-sm text-[#98a2b3] md:flex"><Search className="h-4 w-4" />Search retailers, payments...</div><NotificationBell unreadCount={notifications.unreadCount} notifications={notifications.notifications} /></div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
