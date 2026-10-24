"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function DashboardSignOutButton({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Button
      type="button"
      variant="ghost"
      aria-label="Sign out"
      title={collapsed ? "Sign out" : undefined}
      className={`mt-6 h-10 border-[#e4e7ec] bg-white text-sm text-[#667085] hover:bg-[#f7f8fa] hover:text-[#243b64] ${collapsed ? "w-full justify-center px-2" : "w-full justify-start px-3"}`}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="h-4 w-4" />
      {!collapsed && "Sign out"}
    </Button>
  );
}
