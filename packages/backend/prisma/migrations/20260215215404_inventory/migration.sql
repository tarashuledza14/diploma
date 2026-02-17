/*
  Warnings:

  - You are about to drop the column `buy_price` on the `parts` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `parts` table. All the data in the column will be lost.
  - You are about to drop the column `sell_price` on the `parts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `parts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `purchasePrice` to the `parts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `retailPrice` to the `parts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "parts" DROP COLUMN "buy_price",
DROP COLUMN "quantity",
DROP COLUMN "sell_price",
ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "code" TEXT,
ADD COLUMN     "compatibility" TEXT[],
ADD COLUMN     "condition" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3),
ADD COLUMN     "crossNumbers" TEXT[],
ADD COLUMN     "dimensions" TEXT,
ADD COLUMN     "lastRestocked" TIMESTAMP(3),
ADD COLUMN     "markup" INTEGER,
ADD COLUMN     "minStock" INTEGER,
ADD COLUMN     "movementHistory" JSONB,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "oem" TEXT,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "priceCategory" TEXT,
ADD COLUMN     "purchasePrice" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "quantityAvailable" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "quantityReserved" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "quantityTotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "retailPrice" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "supplier" TEXT,
ADD COLUMN     "supplierContact" TEXT,
ADD COLUMN     "unit" TEXT,
ADD COLUMN     "warrantyKm" INTEGER,
ADD COLUMN     "warrantyMonths" INTEGER,
ADD COLUMN     "weight" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "parts_code_key" ON "parts"("code");
