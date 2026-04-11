-- AlterTable
ALTER TABLE "users" ADD COLUMN "last_login_at" TIMESTAMP(3);

-- Backfill existing active users to avoid marking all historical accounts as pending.
UPDATE "users"
SET "last_login_at" = "createdAt"
WHERE "deletedAt" IS NULL;
