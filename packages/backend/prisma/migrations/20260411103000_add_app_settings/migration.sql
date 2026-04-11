-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL,
    "app_name" TEXT NOT NULL DEFAULT 'AutoCRM',
    "logo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);
