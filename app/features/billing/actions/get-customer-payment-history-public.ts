"use server";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  customerTable,
  organizationsTable,
  paymentsTable,
} from "@/lib/db/schema";
import { normalizePhoneNumber } from "@/app/features/customer/services/customer.service";

export async function getCustomerPaymentHistoryPublic(
  organizationId: string,
  customerId: string,
  phone: string,
) {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);
    if (!organizationId || !customerId || normalizedPhone.length !== 10) {
      return {
        success: false,
        message: "Please provide valid customer details.",
        payments: [],
      };
    }

    const rows = await db
      .select({
        id: paymentsTable.id,
        amount: paymentsTable.amount,
        currency: paymentsTable.currency,
        status: paymentsTable.status,
        referenceId: paymentsTable.referenceId,
        proofUrl: paymentsTable.proofUrl,
        createdAt: paymentsTable.createdAt,
        verifiedAt: paymentsTable.verifiedAt,
        customerName: customerTable.name,
        customerPhone: customerTable.phone,
        organizationName: organizationsTable.name,
      })
      .from(paymentsTable)
      .innerJoin(
        customerTable,
        and(
          eq(paymentsTable.customerId, customerTable.id),
          eq(customerTable.organizationId, organizationId),
          eq(customerTable.phone, normalizedPhone),
        ),
      )
      .innerJoin(
        organizationsTable,
        eq(paymentsTable.organizationId, organizationsTable.id),
      )
      .where(
        and(
          eq(paymentsTable.organizationId, organizationId),
          eq(paymentsTable.customerId, customerId),
          eq(paymentsTable.context, "ORG"),
        ),
      )
      .orderBy(desc(paymentsTable.createdAt));

    return {
      success: true,
      payments: rows.map((payment) => ({
        ...payment,
        reference:
          payment.referenceId || `PAY-${payment.id.slice(0, 8).toUpperCase()}`,
      })),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to load payment history.",
      payments: [],
    };
  }
}
