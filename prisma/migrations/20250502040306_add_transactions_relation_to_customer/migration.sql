/*
  Warnings:

  - Made the column `preferences` on table `Customer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Customer" ALTER COLUMN "preferences" SET NOT NULL;
