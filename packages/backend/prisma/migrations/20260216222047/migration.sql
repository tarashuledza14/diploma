/*
  Warnings:

  - You are about to drop the `brands` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `manufacturers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `suppliers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "parts" DROP CONSTRAINT "parts_brandId_fkey";

-- DropForeignKey
ALTER TABLE "parts" DROP CONSTRAINT "parts_manufacturerId_fkey";

-- DropForeignKey
ALTER TABLE "parts" DROP CONSTRAINT "parts_supplierId_fkey";

-- DropTable
DROP TABLE "brands";

-- DropTable
DROP TABLE "manufacturers";

-- DropTable
DROP TABLE "suppliers";

-- CreateTable
CREATE TABLE "parts_manufacturers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "parts_manufacturers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parts_brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "parts_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parts_suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,

    CONSTRAINT "parts_suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parts_manufacturers_name_key" ON "parts_manufacturers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "parts_brands_name_key" ON "parts_brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "parts_suppliers_name_key" ON "parts_suppliers"("name");

-- AddForeignKey
ALTER TABLE "parts" ADD CONSTRAINT "parts_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "parts_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts" ADD CONSTRAINT "parts_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "parts_suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts" ADD CONSTRAINT "parts_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "parts_manufacturers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
