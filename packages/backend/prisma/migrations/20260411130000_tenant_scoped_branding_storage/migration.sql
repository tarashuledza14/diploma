-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- Seed one default tenant to backfill existing global settings
INSERT INTO "organizations" ("id", "name", "updated_at")
VALUES ('org_default', 'Default Organization', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Alter users for tenant relation
ALTER TABLE "users"
ADD COLUMN "organization_id" TEXT;

CREATE INDEX "users_organization_id_idx" ON "users"("organization_id");

ALTER TABLE "users"
ADD CONSTRAINT "users_organization_id_fkey"
FOREIGN KEY ("organization_id") REFERENCES "organizations"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter app_settings to tenant-scoped key storage
ALTER TABLE "app_settings"
ADD COLUMN "organization_id" TEXT,
ADD COLUMN "logo_key" TEXT;

UPDATE "app_settings"
SET "organization_id" = 'org_default',
    "logo_key" = "logo_url"
WHERE "organization_id" IS NULL;

ALTER TABLE "app_settings"
DROP COLUMN "logo_url";

ALTER TABLE "app_settings"
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "organization_id" SET NOT NULL;

CREATE UNIQUE INDEX "app_settings_organization_id_key" ON "app_settings"("organization_id");

ALTER TABLE "app_settings"
ADD CONSTRAINT "app_settings_organization_id_fkey"
FOREIGN KEY ("organization_id") REFERENCES "organizations"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
