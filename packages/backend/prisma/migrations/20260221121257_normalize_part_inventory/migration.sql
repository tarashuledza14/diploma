/*
  Warnings:

  - You are about to drop the column `created_at` on the `parts` table. All the data in the column will be lost.
  - You are about to drop the column `lastRestocked` on the `parts` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `parts` table. All the data in the column will be lost.
  - You are about to drop the column `markup` on the `parts` table. All the data in the column will be lost.
  - You are about to drop the column `movementHistory` on the `parts` table. All the data in the column will be lost.
  - You are about to drop the column `priceCategory` on the `parts` table. All the data in the column will be lost.
  - You are about to drop the column `purchasePrice` on the `parts` table. All the data in the column will be lost.
  - You are about to drop the column `quantityAvailable` on the `parts` table. All the data in the column will be lost.
  - You are about to drop the column `quantityReserved` on the `parts` table. All the data in the column will be lost.
  - You are about to drop the column `quantityTotal` on the `parts` table. All the data in the column will be lost.
  - You are about to drop the column `retailPrice` on the `parts` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `parts` table without a default value. This is not possible if the table is not empty.
  - Made the column `categoryId` on table `parts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `brandId` on table `parts` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('RETAIL', 'WHOLESALE', 'VIP');

-- DropForeignKey
ALTER TABLE "parts" DROP CONSTRAINT "parts_brandId_fkey";

-- DropForeignKey
ALTER TABLE "parts" DROP CONSTRAINT "parts_categoryId_fkey";

-- AlterTable
ALTER TABLE "parts" DROP COLUMN "created_at",
DROP COLUMN "lastRestocked",
DROP COLUMN "location",
DROP COLUMN "markup",
DROP COLUMN "movementHistory",
DROP COLUMN "priceCategory",
DROP COLUMN "purchasePrice",
DROP COLUMN "quantityAvailable",
DROP COLUMN "quantityReserved",
DROP COLUMN "quantityTotal",
DROP COLUMN "retailPrice",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "categoryId" SET NOT NULL,
ALTER COLUMN "brandId" SET NOT NULL;

-- DropEnum
DROP TYPE "PriceCategory";

-- CreateTable
CREATE TABLE "PartInventory" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "purchasePrice" DECIMAL(10,2) NOT NULL,
    "location" TEXT,
    "batchNumber" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartPriceRule" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "clientType" "ClientType",
    "markupPercent" INTEGER,
    "fixedPrice" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartPriceRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartInventory_partId_idx" ON "PartInventory"("partId");

-- CreateIndex
CREATE INDEX "PartPriceRule_partId_idx" ON "PartPriceRule"("partId");

-- AddForeignKey
ALTER TABLE "parts" ADD CONSTRAINT "parts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "part_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts" ADD CONSTRAINT "parts_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "parts_brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartInventory" ADD CONSTRAINT "PartInventory_partId_fkey" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartPriceRule" ADD CONSTRAINT "PartPriceRule_partId_fkey" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
