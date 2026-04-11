-- AlterEnum
ALTER TYPE "JobStatus" ADD VALUE 'WAITING_FOR_PARTS';

-- AlterTable
ALTER TABLE "order_services" ADD COLUMN     "additional_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "deadline" TIMESTAMP(3);
