/*
  Warnings:

  - Added the required column `last_updated` to the `daily_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `routines` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "daily_logs" ADD COLUMN     "last_updated" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "routines" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
