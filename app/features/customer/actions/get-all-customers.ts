"use server";

import { getActiveOrgId } from "@/app/features/auth/services/org-context.service";
import { getCustomerBalancesByOrg } from "../services/customer.service";

export async function getAllCustomersForOrg(searchTerm?: string) {
  try {
    const organizationId = await getActiveOrgId();

    if (!organizationId) {
      return {
        success: false,
        message: "Unauthorized",
        customers: [],
      };
    }

    const customers = await getCustomerBalancesByOrg(organizationId);
    const normalizedSearch = searchTerm?.trim().toLowerCase();
    const filteredCustomers = normalizedSearch
      ? customers.filter((customer) =>
          [customer.name, customer.email, customer.phone]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedSearch)),
        )
      : customers;

    const sortedCustomers = filteredCustomers.sort(
      (a, b) => b.remainingBalance - a.remainingBalance,
    );

    return {
      success: true,
      customers: sortedCustomers.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        remainingBalance: c.remainingBalance,
        totalInvoiced: c.totalInvoiced,
        totalPaid: c.totalPaid,
      })),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch customers",
      customers: [],
    };
  }
}
