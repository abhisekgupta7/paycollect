"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CreditCard,
  LayoutGrid,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import DashboardSignOutButton from "@/components/Utility/DashboardSignOutButton";

type DashboardSidebarProps = {
  organizationName: string;
  userName: string;
  role: string;
};

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "Retailers", href: "/dashboard/retailers", icon: Users },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { label: "Ledger", href: "/dashboard/ledger", icon: WalletCards },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardSidebar({
  organizationName,
  userName,
  role,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const storedState = window.localStorage.getItem("sidebar_state");
    const timeoutId = window.setTimeout(() => {
      setCollapsed(storedState === "collapsed");
    }, 0);

    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setCollapsed((current) => {
          const next = !current;
          window.localStorage.setItem(
            "sidebar_state",
            next ? "collapsed" : "expanded",
          );
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(
        "sidebar_state",
        next ? "collapsed" : "expanded",
      );
      return next;
    });
  };

  const navigation = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-5">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#243b64] text-sm font-bold text-white">
            PC
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-[#172033]">
                PayCollect
              </span>
              <span className="block text-xs text-[#98a2b3]">
                Receivables OS
              </span>
            </span>
          )}
        </Link>
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-2 text-[#667085] hover:bg-[#f2f4f7] lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          title={collapsed ? "Expand navigation" : "Collapse navigation"}
          className="hidden rounded-lg p-2 text-[#667085] hover:bg-[#f2f4f7] hover:text-[#243b64] lg:block"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <div className={`mx-3 rounded-xl border border-[#e4e7ec] bg-[#f7f8fa] ${collapsed ? "p-2" : "px-3 py-2.5"}`}>
        {collapsed ? (
          <span className="block text-center text-xs font-semibold text-[#243b64]" title={organizationName}>
            {organizationName.slice(0, 1).toUpperCase()}
          </span>
        ) : (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98a2b3]">
              Workspace
            </p>
            <p className="mt-1 truncate text-sm font-medium text-[#243b64]">
              {organizationName}
            </p>
          </>
        )}
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-3" aria-label="Workspace navigation">
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98a2b3]">
            Workspace
          </p>
        )}
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = href === "/dashboard"
            ? pathname === href
            : pathname.startsWith(href);
          return (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#eef2fa] text-[#243b64]"
                  : "text-[#667085] hover:bg-[#f7f8fa] hover:text-[#243b64]"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-[#e4e7ec] p-3">
        <DashboardSignOutButton collapsed={collapsed} />
        <div className={`flex items-center gap-3 rounded-xl bg-[#f7f8fa] p-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dbe4f2] text-sm font-semibold text-[#243b64]">
            {userName.slice(0, 1).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#172033]">{userName}</p>
              <p className="text-xs text-[#98a2b3]">{role}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden border-r border-[#e4e7ec] bg-white transition-[width] duration-200 lg:block ${
          collapsed ? "w-[76px]" : "w-[248px]"
        }`}
      >
        {navigation}
      </aside>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        className="fixed left-4 top-4 z-30 rounded-xl border border-[#e4e7ec] bg-white p-2.5 text-[#243b64] shadow-sm lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-[#172033]/25"
          />
          <aside className="relative h-full w-[280px] bg-white shadow-xl">
            {navigation}
          </aside>
        </div>
      )}
    </>
  );
}
