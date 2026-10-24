"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function AdminSignOutButton({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/admin/auth/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      variant="outline"
      aria-label="Sign out"
      title={collapsed ? "Sign out" : undefined}
      className={`w-full border-white/10 text-red-400 hover:bg-red-500/10 hover:text-red-300 ${collapsed ? "px-2" : ""}`}
    >
      <LogOut className={`h-4 w-4 ${collapsed ? "" : "mr-2"}`} />
      {!collapsed && "Sign Out"}
    </Button>
  );
}
