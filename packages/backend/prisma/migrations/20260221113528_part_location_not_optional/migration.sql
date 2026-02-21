/*
  Warnings:

  - Made the column `location` on table `parts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "parts" ALTER COLUMN "location" SET NOT NULL;
