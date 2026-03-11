-- CreateEnum
CREATE TYPE "PointTransactionType" AS ENUM ('EARN', 'USE', 'EXPIRED', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "PointTransaction" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "type" "PointTransactionType" NOT NULL,
    "points" INTEGER NOT NULL,
    "amount" DECIMAL(10,2),
    "description" TEXT,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PointTransaction_customerId_idx" ON "PointTransaction"("customerId");

-- CreateIndex
CREATE INDEX "PointTransaction_createdAt_idx" ON "PointTransaction"("createdAt");

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
