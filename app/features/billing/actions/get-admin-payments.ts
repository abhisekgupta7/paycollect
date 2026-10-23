"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { organizationsTable, paymentsTable } from "@/lib/db/schema";

type AdminPaymentStatusFilter = "ALL" | "PENDING" | "VERIFIED" | "REJECTED";

type AdminPaymentRow = {
  id: string;
  organizationId: string | null;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  proofUrl: string | null;
  createdAt: Date;
  organizationName: string | null;
};

function toPhoneNumber(value: string | null | undefined) {
  return value?.trim() || null;
}

export async function getAdminPayments(
  status: AdminPaymentStatusFilter = "ALL",
) {
  try {
    const whereCondition =
      status === "ALL"
        ? eq(paymentsTable.context, "PLATFORM")
        : eq(paymentsTable.status, status);

    const rows: AdminPaymentRow[] = await db
      .select({
        id: paymentsTable.id,
        organizationId: paymentsTable.organizationId,
        amount: paymentsTable.amount,
        currency: paymentsTable.currency,
        provider: paymentsTable.provider,
        status: paymentsTable.status,
        proofUrl: paymentsTable.proofUrl,
        createdAt: paymentsTable.createdAt,
        organizationName: organizationsTable.name,
      })
      .from(paymentsTable)
      .leftJoin(
        organizationsTable,
        eq(paymentsTable.organizationId, organizationsTable.id),
      )
      .where(whereCondition)
      .orderBy(desc(paymentsTable.createdAt));

    return {
      success: true,
      payments: rows.map((row) => ({
        ...row,
        organizationName: row.organizationName || "Organization",
        organizationPhone: toPhoneNumber(
          null,
        ),
        context: "PLATFORM" as const,
      })),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch admin payments",
      payments: [],
    };
  }
}
