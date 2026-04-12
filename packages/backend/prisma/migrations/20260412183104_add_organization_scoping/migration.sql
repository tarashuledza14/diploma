-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "parts" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "organization_id" TEXT;

-- CreateIndex
CREATE INDEX "clients_organization_id_idx" ON "clients"("organization_id");

-- CreateIndex
CREATE INDEX "parts_organization_id_idx" ON "parts"("organization_id");

-- CreateIndex
CREATE INDEX "services_organization_id_idx" ON "services"("organization_id");

-- CreateIndex
CREATE INDEX "vehicles_organization_id_idx" ON "vehicles"("organization_id");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts" ADD CONSTRAINT "parts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
