-- CreateTable
CREATE TABLE "manual_original_chunks" (
    "id" TEXT NOT NULL,
    "doc_id" TEXT NOT NULL,
    "vector_ref" TEXT NOT NULL,
    "page_content" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "organization_id" TEXT,
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manual_original_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "manual_original_chunks_doc_id_key" ON "manual_original_chunks"("doc_id");

-- CreateIndex
CREATE INDEX "manual_original_chunks_vector_ref_idx" ON "manual_original_chunks"("vector_ref");

-- CreateIndex
CREATE INDEX "manual_original_chunks_organization_id_idx" ON "manual_original_chunks"("organization_id");
