"use server";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { customerTable, paymentsTable } from "@/lib/db/schema";
import { getActiveOrgId } from "@/app/features/auth/services/org-context.service";
import { getCachedJson } from "@/lib/cache";

type PaymentStatusFilter = "ALL" | "PENDING" | "VERIFIED";

export async function getOrganizationPayments(
  status: PaymentStatusFilter = "ALL",
) {
  try {
    const organizationId = await getActiveOrgId();

    if (!organizationId) {
      return {
        success: false,
        message: "Unauthorized",
        payments: [],
      };
    }

    const whereCondition =
      status === "ALL"
        ? eq(paymentsTable.organizationId, organizationId)
        : and(
            eq(paymentsTable.organizationId, organizationId),
            eq(paymentsTable.status, status),
          );

    const payments = await getCachedJson(
      `paycollect:org:${organizationId}:payments:${status}`,
      () =>
        db
          .select({
        id: paymentsTable.id,
        amount: paymentsTable.amount,
        currency: paymentsTable.currency,
        provider: paymentsTable.provider,
        status: paymentsTable.status,
        proofUrl: paymentsTable.proofUrl,
        createdAt: paymentsTable.createdAt,
        customerName: customerTable.name,
        customerPhone: customerTable.phone,
        customerEmail: customerTable.email,
          })
          .from(paymentsTable)
          .leftJoin(customerTable, eq(paymentsTable.customerId, customerTable.id))
          .where(whereCondition)
          .orderBy(desc(paymentsTable.createdAt)),
    );

    return {
      success: true,
      payments,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch payments",
      payments: [],
    };
  }
}
