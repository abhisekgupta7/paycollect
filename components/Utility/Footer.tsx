"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) return null;
  return (
    <footer className="border-t border-[#e4e7ec] bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5">
            <span className="text-xs font-semibold text-[#243b64]">PC</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight text-[#172033]">
              PayCollect
            </span>
            <span className="text-xs text-slate-500">            Wholesaler receivables</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 sm:text-sm">
          &copy; {new Date().getFullYear()} PayCollect. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
