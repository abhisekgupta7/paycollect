import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PayCollect Admin - Platform Control",
  description: "PayCollect Admin Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
