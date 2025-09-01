/*
  Warnings:

  - A unique constraint covering the columns `[method,transactionRef]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `changeType` on the `InventoryLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `method` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'MOBILE_BANKING');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ChangeType" AS ENUM ('INCREASE', 'DECREASE');

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- AlterTable
ALTER TABLE "public"."InventoryLog" DROP COLUMN "changeType",
ADD COLUMN     "changeType" "public"."ChangeType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "status",
ADD COLUMN     "status" "public"."OrderStatus" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "transactionRef" TEXT,
DROP COLUMN "method",
ADD COLUMN     "method" "public"."PaymentMethod" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_method_transactionRef_key" ON "public"."Payment"("method", "transactionRef");

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "public"."MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
