-- CreateTable
CREATE TABLE "team_invites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "created_by_id" TEXT,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_invites_token_hash_key" ON "team_invites"("token_hash");

-- CreateIndex
CREATE INDEX "team_invites_user_id_idx" ON "team_invites"("user_id");

-- CreateIndex
CREATE INDEX "team_invites_organization_id_idx" ON "team_invites"("organization_id");

-- CreateIndex
CREATE INDEX "team_invites_email_idx" ON "team_invites"("email");

-- CreateIndex
CREATE INDEX "team_invites_expires_at_used_at_revoked_at_idx" ON "team_invites"("expires_at", "used_at", "revoked_at");

-- AddForeignKey
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
