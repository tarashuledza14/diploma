/*
  Warnings:

  - You are about to drop the column `category` on the `parts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "parts" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT,
ALTER COLUMN "purchasePrice" DROP NOT NULL,
ALTER COLUMN "retailPrice" DROP NOT NULL;

-- CreateTable
CREATE TABLE "part_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "part_categories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "parts" ADD CONSTRAINT "parts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "part_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
