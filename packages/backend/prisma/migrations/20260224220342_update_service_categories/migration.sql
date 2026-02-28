/*
  Warnings:

  - You are about to drop the `_PartToService` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PartToService" DROP CONSTRAINT "_PartToService_A_fkey";

-- DropForeignKey
ALTER TABLE "_PartToService" DROP CONSTRAINT "_PartToService_B_fkey";

-- DropTable
DROP TABLE "_PartToService";

-- CreateTable
CREATE TABLE "_ServiceToCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ServiceToCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ServiceToCategory_B_index" ON "_ServiceToCategory"("B");

-- AddForeignKey
ALTER TABLE "_ServiceToCategory" ADD CONSTRAINT "_ServiceToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "part_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceToCategory" ADD CONSTRAINT "_ServiceToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
