import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Public payment submission",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicPaymentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
