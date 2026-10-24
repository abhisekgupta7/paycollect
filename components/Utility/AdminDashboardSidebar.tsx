"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutGrid,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Wallet,
  X,
} from "lucide-react";
import AdminSignOutButton from "@/components/Utility/AdminSignOutButton";

type AdminDashboardSidebarProps = {
  name: string;
  email: string;
};

const navItems = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutGrid },
  { label: "Payment verification", href: "/admin/dashboard/payments", icon: Wallet },
  { label: "Settings", href: "/admin/dashboard/setting", icon: Settings },
];

export default function AdminDashboardSidebar({
  name,
  email,
}: AdminDashboardSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const storedState = window.localStorage.getItem("admin_sidebar_state");
    const timeoutId = window.setTimeout(() => {
      setCollapsed(storedState === "collapsed");
    }, 0);
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setCollapsed((current) => {
          const next = !current;
          window.localStorage.setItem("admin_sidebar_state", next ? "collapsed" : "expanded");
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
      window.localStorage.setItem("admin_sidebar_state", next ? "collapsed" : "expanded");
      return next;
    });
  };

  const navigation = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-5">
        <Link href="/admin/dashboard" className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400 text-sm font-bold text-emerald-950">PC</span>
          {!collapsed && <span><span className="block truncate text-sm font-semibold text-foreground">PayCollect</span><span className="block text-xs text-muted-foreground">Platform control</span></span>}
        </Link>
        <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-white/5 lg:hidden"><X className="h-5 w-5" /></button>
        <button type="button" onClick={toggleCollapsed} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} title={collapsed ? "Expand navigation" : "Collapse navigation"} className="hidden rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground lg:block">{collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}</button>
      </div>
      <div className={`mx-3 rounded-xl border border-white/10 bg-white/5 ${collapsed ? "p-2" : "px-3 py-2.5"}`}>
        {collapsed ? <span className="block text-center text-xs font-semibold text-emerald-300" title="Platform admin">A</span> : <><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace</p><p className="mt-1 text-sm font-medium text-foreground">Platform admin</p></>}
      </div>
      <nav className="mt-6 flex-1 space-y-1 px-3" aria-label="Admin navigation">
        {!collapsed && <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Administration</p>}
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = href === "/admin/dashboard" ? pathname === href : pathname.startsWith(href);
          return <Link key={label} href={href} onClick={() => setMobileOpen(false)} title={collapsed ? label : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-emerald-400/10 text-emerald-300" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"} ${collapsed ? "justify-center" : ""}`}><Icon className="h-4 w-4 shrink-0" />{!collapsed && <span>{label}</span>}</Link>;
        })}
      </nav>
      <div className="space-y-3 border-t border-white/10 p-3"><AdminSignOutButton collapsed={collapsed} /><div className={`flex items-center gap-3 rounded-xl bg-white/5 p-2 ${collapsed ? "justify-center" : ""}`}><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-sm font-semibold text-emerald-300">{name.slice(0, 1).toUpperCase()}</div>{!collapsed && <div className="min-w-0"><p className="truncate text-sm font-medium text-foreground">{name}</p><p className="truncate text-xs text-muted-foreground">{email}</p></div>}</div></div>
    </div>
  );

  return <>
    <aside className={`hidden border-r border-white/10 bg-[#0c1116]/90 transition-[width] duration-200 lg:block ${collapsed ? "w-[76px]" : "w-[248px]"}`}>{navigation}</aside>
    <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation" className="fixed left-4 top-3 z-30 rounded-xl border border-white/10 bg-[#0c1116] p-2.5 text-emerald-300 shadow-sm lg:hidden"><Menu className="h-5 w-5" /></button>
    {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/60" /><aside className="relative h-full w-[280px] bg-[#0c1116] shadow-xl">{navigation}</aside></div>}
  </>;
}
