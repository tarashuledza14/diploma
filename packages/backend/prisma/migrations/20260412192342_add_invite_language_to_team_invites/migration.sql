-- CreateEnum
CREATE TYPE "InviteLanguage" AS ENUM ('UK', 'EN');

-- AlterTable
ALTER TABLE "team_invites" ADD COLUMN     "language" "InviteLanguage" NOT NULL DEFAULT 'UK';
