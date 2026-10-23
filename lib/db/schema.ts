import {
  uuid,
  varchar,
  timestamp,
  pgTable,
  integer,
  boolean,
  index,
  unique,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const usersTable = pgTable("users", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar({ length: 255 }),
  image: varchar({ length: 255 }),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const adminUsersTable = pgTable("admin_users", {
  id: uuid().primaryKey().default(sql`gen_random_uuid()`),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar({ length: 255 }).notNull(),
  isActive: boolean().notNull().default(true),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const organizationsTable = pgTable("organizations", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar({ length: 255 }).notNull().unique(),
  paymentMethod: varchar({ length: 50 }).notNull().default("MANUAL"), // MANUAL | ESEWA
  qrCodeUrl: varchar({ length: 255 }), // ImageKit URL for QR code (if using ESEWA)
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const membershipsTable = pgTable("memberships", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  organizationId: uuid()
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  role: varchar({ length: 50 }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const notificationTable = pgTable("notifications", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  orgId: uuid()
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  type: varchar({ length: 50 }).notNull(),
  message: varchar({ length: 500 }).notNull(),
  isRead: boolean().notNull().default(false),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const subscriptionsTable = pgTable("subscriptions", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  organizationId: uuid()
    .notNull()
    .unique() // 🔥 one subscription per org
    .references(() => organizationsTable.id, { onDelete: "cascade" }),

  plan: varchar({ length: 50 }).notNull().default("FREE"), // FREE | PRO

  status: varchar({ length: 50 }).notNull().default("ACTIVE"), // ACTIVE | INACTIVE | PAST_DUE

  currentPeriodEnd: timestamp(), // nullable for FREE plan

  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const referenceTypeEnum = pgEnum("payment_reference_type", [
  "ORDER",
  "SUBSCRIPTION",
]);
export const paymentProviderEnum = pgEnum("payment_provider", [
  "MANUAL",
  "ESEWA",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "VERIFIED",
  "REJECTED",
]);

export const paymentContextEnum = pgEnum("payment_context", [
  "PLATFORM",
  "ORG",
]);

export const paymentsTable = pgTable(
  "payments",
  {
    id: uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    organizationId: uuid().references(() => organizationsTable.id),

    userId: uuid()
      .notNull()
      .references(() => usersTable.id),

    customerId: uuid().references(() => customerTable.id, {
      onDelete: "set null",
    }),

    context: paymentContextEnum().notNull(),

    provider: paymentProviderEnum().notNull().default("MANUAL"),

    pidx: varchar({ length: 255 }),

    amount: integer().notNull(),

    currency: varchar({ length: 10 }).notNull().default("NPR"),

    status: paymentStatusEnum().notNull().default("PENDING"),

    proofUrl: varchar({ length: 255 }),

    referenceId: varchar({ length: 255 }),

    verifiedAt: timestamp(),
    verifiedBy: uuid().references(() => usersTable.id),

    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => ({
    paymentsOrgIdx: index("payments_org_idx").on(table.organizationId),
    paymentsUserIdx: index("payments_user_idx").on(table.userId),
    paymentsCustomerIdx: index("payments_customer_idx").on(table.customerId),

    uniqueProviderPidx: unique("unique_provider_pidx").on(
      table.provider,
      table.pidx,
    ),
  }),
);

export const customerTable = pgTable(
  "customers",
  {
    id: uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    organizationId: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: "cascade" }),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    phone: varchar({ length: 20 }).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => ({
    customerOrgPhoneUnique: unique("customer_org_phone_unique").on(
      table.organizationId,
      table.phone,
    ),
    customerPhoneIdx: index("customer_phone_idx").on(table.phone),
  }),
);

export const ledgerEntriesTable = pgTable(
  "ledger_entries",
  {
    id: uuid()
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    organizationId: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: "cascade" }),
    type: varchar({ length: 50 }).notNull(), // DEBIT | CREDIT
    amount: integer().notNull(), // in paisa
    description: varchar({ length: 500 }),
    referenceId: uuid(), // order ID, payment ID, etc.
    referenceType: varchar({ length: 50 }), // ORDER, PAYMENT, REFUND, etc.
    createdAt: timestamp().defaultNow().notNull(),
  },
  (table) => ({
    ledgerOrgIdx: index("ledger_org_idx").on(table.organizationId),
    ledgerReferenceIdx: index("ledger_reference_idx").on(
      table.referenceId,
      table.referenceType,
    ),
  }),
);

export const pushSubscriptionsTable = pgTable("push_subscriptions", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  organizationId: uuid()
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  endpoint: varchar({ length: 500 }).notNull(),
  keys: jsonb().notNull(),
  expirationTime: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
