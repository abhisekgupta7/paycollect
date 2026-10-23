import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscription payment",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SubscriptionPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
