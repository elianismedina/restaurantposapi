/*
  Warnings:

  - You are about to drop the column `stripePaymentIntentId` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "stripePaymentIntentId";
