import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cookies } from "next/headers";
import { findAdminById } from "@/app/features/admin/services/admin-auth.service";
import { verifyAdminToken } from "@/app/features/admin/utils/jwt";
import { getAdminNotifications } from "@/app/features/notification/actions/get-admin-notifications";
import NotificationBell from "@/app/features/notification/components/notification-bell";
import AdminDashboardSidebar from "@/components/Utility/AdminDashboardSidebar";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    redirect("/admin/auth/login");
  }

  const tokenVerification = verifyAdminToken(token);
  if (!tokenVerification.valid) {
    redirect("/admin/auth/login");
  }

  const adminPayload = tokenVerification.payload;
  if (!adminPayload?.id) redirect("/admin/auth/login");
  const admin = await findAdminById(adminPayload.id);
  if (!admin || !admin.isActive) {
    redirect("/admin/auth/login");
  }


  const notificationsResult = await getAdminNotifications();

  return (
    <div className="dark min-h-screen bg-[#0b0f14] text-foreground">
      <div className="flex min-h-screen">
        <AdminDashboardSidebar name={admin.name} email={admin.email} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0f14]/85 pl-20 backdrop-blur lg:pl-6">
            <div className="flex h-14 items-center justify-between gap-4 px-6">
              <div className="relative w-full max-w-md flex-1">
                <Input
                  placeholder="Search retailers and payments"
                  className="h-9 border-white/10 bg-white/5 text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <NotificationBell
                  unreadCount={notificationsResult.unreadCount}
                  notifications={notificationsResult.notifications}
                />
                <Button className="h-9 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-muted-foreground transition-colors hover:bg-white/10">
                  {admin.name}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
