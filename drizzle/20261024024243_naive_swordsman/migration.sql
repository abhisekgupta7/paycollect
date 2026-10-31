ALTER TYPE "whatsapp_recipient_type" ADD VALUE 'PLATFORM_ADMIN';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" varchar(20);