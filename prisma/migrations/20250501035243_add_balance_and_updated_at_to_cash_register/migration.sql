/*
  Warnings:

  - Added the required column `updatedAt` to the `CashRegister` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CashRegister" ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
