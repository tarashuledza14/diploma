/*
  Warnings:

  - You are about to drop the column `manufacturer` on the `parts` table. All the data in the column will be lost.
  - The `condition` column on the `parts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `priceCategory` column on the `parts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PriceCategory" AS ENUM ('RETAIL', 'WHOLESALE', 'SPECIAL');

-- CreateEnum
CREATE TYPE "PartCondition" AS ENUM ('NEW', 'USED', 'REFURBISHED');

-- AlterTable
ALTER TABLE "parts" DROP COLUMN "manufacturer",
ADD COLUMN     "manufacturerId" TEXT,
DROP COLUMN "condition",
ADD COLUMN     "condition" "PartCondition",
DROP COLUMN "priceCategory",
ADD COLUMN     "priceCategory" "PriceCategory";

-- CreateTable
CREATE TABLE "manufacturers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "manufacturers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "manufacturers_name_key" ON "manufacturers"("name");

-- AddForeignKey
ALTER TABLE "parts" ADD CONSTRAINT "parts_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "manufacturers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
