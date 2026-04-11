-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "order_services" ADD COLUMN     "estimated_hours" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "order_services_mechanic_id_status_idx" ON "order_services"("mechanic_id", "status");
