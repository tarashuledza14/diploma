-- AlterTable
ALTER TABLE "order_services" ADD COLUMN     "planned_start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
