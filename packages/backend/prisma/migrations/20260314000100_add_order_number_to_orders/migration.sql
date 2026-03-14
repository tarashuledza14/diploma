-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "orders_order_number_seq";

-- AlterTable
ALTER TABLE "orders"
ADD COLUMN "order_number" INTEGER;

ALTER TABLE "orders"
ALTER COLUMN "order_number" SET DEFAULT nextval('"orders_order_number_seq"');

UPDATE "orders"
SET "order_number" = nextval('"orders_order_number_seq"')
WHERE "order_number" IS NULL;

ALTER TABLE "orders"
ALTER COLUMN "order_number" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- Sync sequence with current max value
SELECT setval(
	'"orders_order_number_seq"',
	COALESCE((SELECT MAX("order_number") FROM "orders"), 0) + 1,
	false
);
