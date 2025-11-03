/*
  Warnings:

  - You are about to drop the column `amount` on the `Cashlink` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transactionHash]` on the table `Cashlink` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transactionHash` to the `Cashlink` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cashlink" DROP COLUMN "amount",
ADD COLUMN     "transactionHash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cashlink_transactionHash_key" ON "Cashlink"("transactionHash");
