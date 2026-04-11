-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('UAH', 'USD', 'EUR');

-- AlterTable
ALTER TABLE "app_settings" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'UAH';
