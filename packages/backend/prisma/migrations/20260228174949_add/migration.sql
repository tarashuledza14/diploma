/*
  Warnings:

  - Added the required column `vehicle_mileage` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order_services" ADD COLUMN     "mechanic_id" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "discount" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "recommendations" TEXT,
ADD COLUMN     "vehicle_mileage" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "order_services" ADD CONSTRAINT "order_services_mechanic_id_fkey" FOREIGN KEY ("mechanic_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
