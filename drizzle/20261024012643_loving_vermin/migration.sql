CREATE TYPE "payment_context" AS ENUM('PLATFORM', 'ORG');--> statement-breakpoint
CREATE TYPE "payment_provider" AS ENUM('MANUAL', 'ESEWA');--> statement-breakpoint
CREATE TYPE "payment_status" AS ENUM('PENDING', 'VERIFIED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "payment_reference_type" AS ENUM('ORDER', 'SUBSCRIPTION');--> statement-breakpoint
CREATE TYPE "whatsapp_delivery_status" AS ENUM('PENDING', 'PROCESSING', 'RETRY', 'SENT', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "whatsapp_recipient_type" AS ENUM('RETAILER', 'WHOLESALER_OWNER');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"passwordHash" varchar(255) NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organizationId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customer_org_phone_unique" UNIQUE("organizationId","phone")
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organizationId" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"amount" integer NOT NULL,
	"description" varchar(500),
	"referenceId" uuid,
	"referenceType" varchar(50),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"userId" uuid NOT NULL,
	"organizationId" uuid NOT NULL,
	"role" varchar(50) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"orgId" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"message" varchar(500) NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL UNIQUE,
	"paymentMethod" varchar(50) DEFAULT 'MANUAL' NOT NULL,
	"qrCodeUrl" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organizationId" uuid,
	"userId" uuid NOT NULL,
	"customerId" uuid,
	"context" "payment_context" NOT NULL,
	"provider" "payment_provider" DEFAULT 'MANUAL'::"payment_provider" NOT NULL,
	"pidx" varchar(255),
	"amount" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'NPR' NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING'::"payment_status" NOT NULL,
	"proofUrl" varchar(255),
	"referenceId" varchar(255),
	"verifiedAt" timestamp,
	"verifiedBy" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_provider_pidx" UNIQUE("provider","pidx")
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"userId" uuid NOT NULL,
	"organizationId" uuid NOT NULL,
	"endpoint" varchar(500) NOT NULL,
	"keys" jsonb NOT NULL,
	"expirationTime" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"organizationId" uuid NOT NULL UNIQUE,
	"plan" varchar(50) DEFAULT 'FREE' NOT NULL,
	"status" varchar(50) DEFAULT 'ACTIVE' NOT NULL,
	"currentPeriodEnd" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"passwordHash" varchar(255),
	"image" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whatsapp_outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"paymentId" uuid NOT NULL,
	"organizationId" uuid NOT NULL,
	"customerId" uuid,
	"recipientType" "whatsapp_recipient_type" NOT NULL,
	"recipientPhone" varchar(20) NOT NULL,
	"messageType" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "whatsapp_delivery_status" DEFAULT 'PENDING'::"whatsapp_delivery_status" NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"availableAt" timestamp DEFAULT now() NOT NULL,
	"lockedAt" timestamp,
	"lockedBy" varchar(100),
	"sentAt" timestamp,
	"lastError" varchar(500),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "whatsapp_payment_recipient_message_unique" UNIQUE("paymentId","recipientType","messageType")
);
--> statement-breakpoint
CREATE INDEX "customer_phone_idx" ON "customers" ("phone");--> statement-breakpoint
CREATE INDEX "ledger_org_idx" ON "ledger_entries" ("organizationId");--> statement-breakpoint
CREATE INDEX "ledger_reference_idx" ON "ledger_entries" ("referenceId","referenceType");--> statement-breakpoint
CREATE INDEX "payments_org_idx" ON "payments" ("organizationId");--> statement-breakpoint
CREATE INDEX "payments_user_idx" ON "payments" ("userId");--> statement-breakpoint
CREATE INDEX "payments_customer_idx" ON "payments" ("customerId");--> statement-breakpoint
CREATE INDEX "whatsapp_queue_idx" ON "whatsapp_outbox" ("status","availableAt");--> statement-breakpoint
CREATE INDEX "whatsapp_organization_idx" ON "whatsapp_outbox" ("organizationId");--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_organizationId_organizations_id_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_organizationId_organizations_id_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organizationId_organizations_id_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_orgId_organizations_id_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_organizationId_organizations_id_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_customerId_customers_id_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_verifiedBy_users_id_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_organizationId_organizations_id_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organizationId_organizations_id_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "whatsapp_outbox" ADD CONSTRAINT "whatsapp_outbox_paymentId_payments_id_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "whatsapp_outbox" ADD CONSTRAINT "whatsapp_outbox_organizationId_organizations_id_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "whatsapp_outbox" ADD CONSTRAINT "whatsapp_outbox_customerId_customers_id_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL;