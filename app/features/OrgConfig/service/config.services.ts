import { db } from "@/lib/db/client";
import { organizationsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type ConfigInput = { paymentMethod: "MANUAL" | "ESEWA"; qrCodeUrl?: string; phoneNumber?: string };

export async function getOrganizationConfigByOrg(organizationId: string) {
  const [organization] = await db.select().from(organizationsTable).where(eq(organizationsTable.id, organizationId)).limit(1);
  return organization ? { ...organization, organizationId: organization.id, phoneNumber: "" } : null;
}

export async function createOrganizationConfig(organizationId: string, data: ConfigInput) {
  return updateOrganizationConfig(organizationId, data);
}

export async function updateOrganizationConfig(organizationId: string, data: ConfigInput) {
  const [organization] = await db.update(organizationsTable).set({ paymentMethod: data.paymentMethod, qrCodeUrl: data.qrCodeUrl || "", updatedAt: new Date() }).where(eq(organizationsTable.id, organizationId)).returning();
  return organization ? { ...organization, organizationId: organization.id, phoneNumber: data.phoneNumber || "" } : null;
}