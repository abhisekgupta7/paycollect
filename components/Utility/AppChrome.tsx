"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Utility/Navbar";
import Footer from "@/components/Utility/Footer";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = pathname?.startsWith("/dashboard");

  if (isDashboardRoute) {
    return <main className="grow">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
