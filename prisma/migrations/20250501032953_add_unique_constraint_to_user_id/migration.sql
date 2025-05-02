/*
  Warnings:

  - You are about to drop the column `balance` on the `CashRegister` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `CashRegister` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `CashRegister` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CashRegister" DROP COLUMN "balance",
DROP COLUMN "updatedAt";

-- CreateIndex
CREATE UNIQUE INDEX "CashRegister_userId_key" ON "CashRegister"("userId");
