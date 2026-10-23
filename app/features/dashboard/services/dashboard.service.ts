import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { getCachedJson } from "@/lib/cache";

export type DashboardSummary = {
  retailerCount: number;
  outstanding: number;
  collected: number;
  verifiedPaymentCount: number;
  pendingPaymentCount: number;
  totalPaymentCount: number;
  ledgerBalance: number;
  ledgerEntryCount: number;
  retailers: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    remainingBalance: number;
  }>;
  recentPayments: Array<{
    id: string;
    amount: number;
    status: string;
    customerName: string | null;
    createdAt: string;
  }>;
};

export async function getDashboardSummary(
  organizationId: string,
): Promise<DashboardSummary> {
  return getCachedJson(`paycollect:org:${organizationId}:dashboard-summary`, async () => {
    const queryResult = await db.execute<{
      retailer_count: string;
      outstanding: string;
      collected: string;
      verified_payment_count: string;
      pending_payment_count: string;
      total_payment_count: string;
      ledger_balance: string;
      ledger_entry_count: string;
      retailers: DashboardSummary["retailers"];
      recent_payments: DashboardSummary["recentPayments"];
    }>(sql`
      WITH customer_balances AS (
        SELECT
          c.id,
          c.name,
          c.email,
          c.phone,
          0::bigint AS remaining_balance
        FROM customers c
        WHERE c."organizationId" = ${organizationId}
      ),
      payment_totals AS (
        SELECT
          COALESCE(SUM(CASE WHEN p.status = 'VERIFIED' THEN p.amount ELSE 0 END), 0)::bigint AS collected,
          COUNT(*) FILTER (WHERE p.status = 'VERIFIED')::bigint AS verified_payment_count,
          COUNT(*) FILTER (WHERE p.status = 'PENDING')::bigint AS pending_payment_count,
          COUNT(*)::bigint AS total_payment_count
        FROM payments p
        WHERE p."organizationId" = ${organizationId}
      ),
      ledger_totals AS (
        SELECT
          COALESCE(SUM(CASE WHEN l.type = 'CREDIT' THEN l.amount ELSE -l.amount END), 0)::bigint AS ledger_balance,
          COUNT(*)::bigint AS ledger_entry_count
        FROM ledger_entries l
        WHERE l."organizationId" = ${organizationId}
      )
      SELECT
        (SELECT COUNT(*) FROM customer_balances)::bigint AS retailer_count,
        COALESCE((SELECT SUM(remaining_balance) FROM customer_balances), 0)::bigint AS outstanding,
        (SELECT collected FROM payment_totals),
        (SELECT verified_payment_count FROM payment_totals),
        (SELECT pending_payment_count FROM payment_totals),
        (SELECT total_payment_count FROM payment_totals),
        (SELECT ledger_balance FROM ledger_totals),
        (SELECT ledger_entry_count FROM ledger_totals),
        COALESCE(
          (
            SELECT json_agg(row_to_json(retailer))
            FROM (
              SELECT id, name, email, phone, remaining_balance AS "remainingBalance"
              FROM customer_balances
              ORDER BY remaining_balance DESC, name ASC
              LIMIT 5
            ) retailer
          ),
          '[]'::json
        ) AS retailers,
        COALESCE(
          (
            SELECT json_agg(row_to_json(payment))
            FROM (
              SELECT
                p.id,
                p.amount,
                p.status,
                c.name AS "customerName",
                p."createdAt" AS "createdAt"
              FROM payments p
              LEFT JOIN customers c ON c.id = p."customerId"
              WHERE p."organizationId" = ${organizationId}
              ORDER BY p."createdAt" DESC
              LIMIT 5
            ) payment
          ),
          '[]'::json
        ) AS recent_payments
    `);

    const result = queryResult.rows[0];

    return {
      retailerCount: Number(result?.retailer_count ?? 0),
      outstanding: Number(result?.outstanding ?? 0),
      collected: Number(result?.collected ?? 0),
      verifiedPaymentCount: Number(result?.verified_payment_count ?? 0),
      pendingPaymentCount: Number(result?.pending_payment_count ?? 0),
      totalPaymentCount: Number(result?.total_payment_count ?? 0),
      ledgerBalance: Number(result?.ledger_balance ?? 0),
      ledgerEntryCount: Number(result?.ledger_entry_count ?? 0),
      retailers: result?.retailers ?? [],
      recentPayments: result?.recent_payments ?? [],
    };
  });
}
