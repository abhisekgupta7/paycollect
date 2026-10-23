import { cache } from "react";
import { auth } from "@/auth";

export type ActiveOrgContext = {
  userId: string;
  orgId: string;
  role?: "OWNER" | "ADMIN" | "MEMBER";
};

const getCachedSession = cache(async () => auth());

export async function getActiveOrgContext(): Promise<ActiveOrgContext | null> {
  const session = await getCachedSession();
  const userId = session?.user?.id;
  const orgId = session?.user?.activeOrgId;

  if (!userId || !orgId) {
    return null;
  }

  return {
    userId,
    orgId,
    role: session.user.role,
  };
}

export async function requireActiveOrgContext(): Promise<ActiveOrgContext> {
  const context = await getActiveOrgContext();

  if (!context) {
    throw new Error("Unauthorized");
  }

  return context;
}

export async function getActiveOrgId(): Promise<string | null> {
  const context = await getActiveOrgContext();
  return context?.orgId ?? null;
}
