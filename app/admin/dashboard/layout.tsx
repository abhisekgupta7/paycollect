import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, LayoutGrid, Settings, Wallet } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cookies } from "next/headers";
import { findAdminById } from "@/app/features/admin/services/admin-auth.service";
import { verifyAdminToken } from "@/app/features/admin/utils/jwt";
import { getAdminNotifications } from "@/app/features/notification/actions/get-admin-notifications";
import NotificationBell from "@/app/features/notification/components/notification-bell";
import AdminSignOutButton from "@/components/Utility/AdminSignOutButton";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
  { label: "Payments", href: "/admin/dashboard/payments", icon: Wallet },
  { label: "Settings", href: "/admin/dashboard/setting", icon: Settings },
];

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
      <div className="grid min-h-screen grid-cols-[240px_1fr]">
        <aside className="flex flex-col border-r border-white/10 bg-[#0c1116]/90 px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                PayCollect Admin
              </p>
              <p className="text-sm font-semibold text-foreground">
                Platform control
              </p>
            </div>
            <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300">
              Live
            </div>
          </div>

          <nav className="mt-8 flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <AdminSignOutButton />

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Admin Account
            </p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {admin.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{admin.email}</p>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0f14]/85 backdrop-blur">
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
