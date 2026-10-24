"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#e4e7ec] bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 text-sm font-bold text-emerald-950">
            PC
          </span>
          <span className="text-lg font-semibold tracking-tight text-[#172033]">
            PayCollect
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="#platform"
            className="rounded-md px-3 py-2 text-sm font-medium text-[#667085] transition-colors hover:bg-[#eef2fa] hover:text-[#243b64]"
          >
            How it works
          </Link>
          <Link
            href="/#pricing"
            className="rounded-md px-3 py-2 text-sm font-medium text-[#667085] transition-colors hover:bg-[#eef2fa] hover:text-[#243b64]"
          >
            For wholesalers
          </Link>
          <Link
            href="#faq"
            className="rounded-md px-3 py-2 text-sm font-medium text-[#667085] transition-colors hover:bg-[#eef2fa] hover:text-[#243b64]"
          >
            FAQ
          </Link>
        </div>

        {session ? (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="hidden border-[#d0d5dd] bg-white text-[#243b64] hover:bg-[#eef2fa] sm:inline-flex h-10"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="hidden rounded-md border-[#d0d5dd] bg-white px-3 py-2 text-sm text-[#243b64] hover:bg-[#eef2fa] sm:inline-flex h-10"
            >
              Sign out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="hidden border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 sm:inline-flex h-10"
            >
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button
              size="sm"
              className="hidden bg-[#243b64] text-white hover:bg-[#1b2f52] sm:inline-flex h-10 font-medium"
            >
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
