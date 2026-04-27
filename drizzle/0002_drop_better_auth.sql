-- Drop foreign-key constraints from warung tables that referenced
-- BetterAuth's `user.id`. These are idempotent so the migration is safe
-- to apply against a database that has already had these dropped.
ALTER TABLE "category" DROP CONSTRAINT IF EXISTS "category_owner_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "product" DROP CONSTRAINT IF EXISTS "product_owner_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "customer" DROP CONSTRAINT IF EXISTS "customer_owner_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "sale" DROP CONSTRAINT IF EXISTS "sale_owner_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "stock_movement" DROP CONSTRAINT IF EXISTS "stock_movement_owner_id_user_id_fk";--> statement-breakpoint

-- Drop the BetterAuth tables. Supabase Auth manages users in `auth.users`.
DROP TABLE IF EXISTS "account" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "session" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "verification" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "user" CASCADE;
