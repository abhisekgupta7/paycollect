import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { customerTable, paymentsTable } from "@/lib/db/schema";
import { type CustomerSchema } from "../types/customer.types";
import { getCachedJson, invalidateOrganizationCaches } from "@/lib/cache";

export function normalizePhoneNumber(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

/**
 * Check if a customer with the given email exists in the organization
 */
export async function checkExistingCustomerByEmail(
  email: string,
  organizationId: string,
) {
  const existing = await db
    .select()
    .from(customerTable)
    .where(
      and(
        eq(customerTable.organizationId, organizationId),
        eq(customerTable.email, email.toLowerCase().trim()),
      ),
    )
    .limit(1);
  return existing;
}

/**
 * Check if a customer with the given phone exists in the organization
 */
export async function checkExistingCustomerByPhone(
  phone: string,
  organizationId: string,
) {
  const normalizedPhone = normalizePhoneNumber(phone);

  const existing = await db
    .select()
    .from(customerTable)
    .where(
      and(
        eq(customerTable.organizationId, organizationId),
        eq(customerTable.phone, normalizedPhone),
      ),
    )
    .limit(1);

  return existing;
}

/**
 * Check if a customer email is already taken, excluding a specific customer ID
 */
export async function checkDuplicateCustomerEmail(
  email: string,
  organizationId: string,
  excludeCustomerId: string,
) {
  const duplicate = await db
    .select()
    .from(customerTable)
    .where(
      and(
        eq(customerTable.organizationId, organizationId),
        eq(customerTable.email, email.toLowerCase().trim()),
      ),
    )
    .limit(1);

  return duplicate.length > 0 && duplicate[0].id !== excludeCustomerId
    ? duplicate
    : [];
}

/**
 * Get a customer by ID and verify it belongs to the organization
 */
export async function getCustomerByIdAndOrg(
  customerId: string,
  organizationId: string,
) {
  const customer = await db
    .select()
    .from(customerTable)
    .where(
      and(
        eq(customerTable.id, customerId),
        eq(customerTable.organizationId, organizationId),
      ),
    )
    .limit(1);

  return customer;
}

/**
 * Get a customer by phone number and verify it belongs to the organization
 */
export async function getCustomerByPhoneAndOrg(
  phone: string,
  organizationId: string,
) {
  const normalizedPhone = normalizePhoneNumber(phone);

  const customer = await db
    .select()
    .from(customerTable)
    .where(
      and(
        eq(customerTable.organizationId, organizationId),
        eq(customerTable.phone, normalizedPhone),
      ),
    )
    .limit(1);

  return customer;
}

/**
 * Create a new customer in the database
 */
export async function createCustomerInDb(
  data: typeof customerTable.$inferInsert,
): Promise<CustomerSchema[]> {
  const result = await db.insert(customerTable).values(data).returning();
  await invalidateOrganizationCaches(data.organizationId);
  return result;
}

/**
 * Update an existing customer in the database
 */
export async function updateCustomerInDb(
  customerId: string,
  updateData: Partial<typeof customerTable.$inferInsert>,
): Promise<CustomerSchema[]> {
  const result = await db
    .update(customerTable)
    .set(updateData)
    .where(eq(customerTable.id, customerId))
    .returning();

  const customer = result[0];
  if (customer) {
    await invalidateOrganizationCaches(customer.organizationId);
  }

  return result;
}

/**
 * Get all customers for an organization
 */
export async function getCustomersByOrg(
  organizationId: string,
): Promise<(typeof customerTable.$inferSelect)[]> {
  const customers = await db
    .select()
    .from(customerTable)
    .where(eq(customerTable.organizationId, organizationId));

  return customers;
}

/**
 * Get customers with invoice/payment aggregates for an organization.
 */
export async function getCustomerBalancesByOrg(organizationId: string) {
  return getCachedJson(
    `paycollect:org:${organizationId}:customer-balances`,
    async () => {
      const customers = await getCustomersByOrg(organizationId);

      if (customers.length === 0) {
        return [];
      }

      const paymentTotals = await db
        .select({
          customerId: paymentsTable.customerId,
          totalPaid: sql<number>`COALESCE(SUM(${paymentsTable.amount}), 0)`,
        })
        .from(paymentsTable)
        .where(
          and(
            eq(paymentsTable.organizationId, organizationId),
            eq(paymentsTable.status, "VERIFIED"),
          ),
        )
        .groupBy(paymentsTable.customerId);

      const invoicedByCustomer = new Map<string, number>();

      const paidByCustomer = new Map<string, number>();
      for (const row of paymentTotals) {
        if (!row.customerId) continue;
        paidByCustomer.set(row.customerId, Number(row.totalPaid ?? 0));
      }

      return customers.map((customer) => {
        const totalInvoiced = invoicedByCustomer.get(customer.id) ?? 0;
        const totalPaid = paidByCustomer.get(customer.id) ?? 0;
        const remainingBalance = Math.max(totalInvoiced - totalPaid, 0);

        return {
          ...customer,
          totalInvoiced,
          totalPaid,
          remainingBalance,
        };
      });
    },
  );
}

/**
 * Delete a customer from the database
 */
export async function deleteCustomerFromDb(
  customerId: string,
): Promise<CustomerSchema[]> {
  const result = await db
    .delete(customerTable)
    .where(eq(customerTable.id, customerId))
    .returning();

  return result;
}

/**
 * Get a customer by ID
 */
export async function getCustomerById(_id: string): Promise<CustomerSchema[]> {
  const customer = await db
    .select()
    .from(customerTable)
    .where(eq(customerTable.id, _id))
    .limit(1);

  return customer;
}
