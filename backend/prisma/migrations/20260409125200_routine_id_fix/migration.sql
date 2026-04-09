/*
  Warnings:

  - The primary key for the `routines` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "routines" DROP CONSTRAINT "routines_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "routines_pkey" PRIMARY KEY ("id");
