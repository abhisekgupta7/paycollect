"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function DashboardSignOutButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      className="mt-6 h-10 w-full justify-start border-[#e4e7ec] bg-white px-3 text-sm text-[#667085] hover:bg-[#f7f8fa] hover:text-[#243b64]"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </Button>
  );
}
