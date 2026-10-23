"use client";

import { usePathname } from "next/navigation";
import AppChrome from "./AppChrome";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return <AppChrome>{children}</AppChrome>;
}
