import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isSubscriptionActive } from "@/app/features/billing/services/payment.services";

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
  return <SubscriptionPageAccess>{children}</SubscriptionPageAccess>;
}

async function SubscriptionPageAccess({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user?.id || !session.user.activeOrgId) {
    redirect("/auth/login");
  }
  if (await isSubscriptionActive(session.user.activeOrgId)) {
    redirect("/dashboard");
  }

  return children;
}
