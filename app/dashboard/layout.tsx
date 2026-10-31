import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getOrganizationById,
  verifyMembership,
} from "@/app/features/auth/services/membership.service";
import DashboardSidebar from "@/components/Utility/DashboardSidebar";
import { getDashboardNotifications } from "@/app/features/notification/actions/get-dashboard-notifications";
import DashboardMobileNav from "@/components/Utility/DashboardMobileNav";
import DashboardHeader from "@/components/Utility/DashboardHeader";
import { isSubscriptionActive } from "@/app/features/billing/services/payment.services";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <main className="min-w-0 flex-1 pb-20 lg:pb-0">
          <DashboardHeader
            unreadCount={notifications.unreadCount}
            notifications={notifications.notifications}
          />
          {children}
        </main>
      </div>
      <DashboardMobileNav />
    </div>
  );
}
