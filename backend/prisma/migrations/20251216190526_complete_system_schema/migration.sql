/*
  Warnings:

  - A unique constraint covering the columns `[quotationId]` on the table `Job` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[appointmentId]` on the table `Job` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[warrantyId]` on the table `Job` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "WarrantyStatus" AS ENUM ('VALID', 'EXPIRED', 'VOID');

-- CreateEnum
CREATE TYPE "PartRequisitionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ISSUED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'TRANSFER', 'POINTS');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'PARTIAL', 'REFUNDED');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('IN', 'OUT', 'ADJUSTMENT', 'RETURN');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "appointmentId" INTEGER,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "diagnosisNotes" TEXT,
ADD COLUMN     "quotationId" INTEGER,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "warrantyId" INTEGER;

-- AlterTable
ALTER TABLE "Motorcycle" ADD COLUMN     "mileage" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "Warranty" (
    "id" SERIAL NOT NULL,
    "warrantyNo" TEXT NOT NULL,
    "motorcycleId" INTEGER NOT NULL,
    "jobId" INTEGER,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "mileageLimit" INTEGER,
    "currentMileage" INTEGER NOT NULL DEFAULT 0,
    "status" "WarrantyStatus" NOT NULL DEFAULT 'VALID',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warranty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" SERIAL NOT NULL,
    "appointmentNo" TEXT NOT NULL,
    "motorcycleId" INTEGER NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "scheduledById" INTEGER NOT NULL,
    "jobId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" SERIAL NOT NULL,
    "quotationNo" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "motorcycleId" INTEGER NOT NULL,
    "status" "QuotationStatus" NOT NULL DEFAULT 'DRAFT',
    "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "validUntil" TIMESTAMP(3),
    "notes" TEXT,
    "createdById" INTEGER NOT NULL,
    "jobId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuotationItem" (
    "id" SERIAL NOT NULL,
    "quotationId" INTEGER NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "partId" INTEGER,
    "packageId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuotationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaborTime" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "technicianId" INTEGER NOT NULL,
    "taskDescription" TEXT NOT NULL,
    "standardMinutes" INTEGER,
    "actualMinutes" INTEGER NOT NULL,
    "hourlyRate" DECIMAL(10,2) NOT NULL,
    "laborCost" DECIMAL(10,2) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "pausedAt" TIMESTAMP(3),
    "resumedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaborTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobChecklistItem" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outsource" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "vendorName" TEXT NOT NULL,
    "workDescription" TEXT NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "estimatedDays" INTEGER,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Outsource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Part" (
    "id" SERIAL NOT NULL,
    "partNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "brand" TEXT,
    "category" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'ชิ้น',
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "reorderPoint" INTEGER NOT NULL DEFAULT 0,
    "reorderQuantity" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartPackage" (
    "id" SERIAL NOT NULL,
    "packageNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartPackageItem" (
    "id" SERIAL NOT NULL,
    "packageId" INTEGER NOT NULL,
    "partId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartPackageItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartRequisition" (
    "id" SERIAL NOT NULL,
    "reqNo" TEXT NOT NULL,
    "jobId" INTEGER,
    "requestedById" INTEGER NOT NULL,
    "status" "PartRequisitionStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "approvedAt" TIMESTAMP(3),
    "issuedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartRequisition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartRequisitionItem" (
    "id" SERIAL NOT NULL,
    "requisitionId" INTEGER NOT NULL,
    "partId" INTEGER,
    "packageId" INTEGER,
    "quantity" INTEGER NOT NULL,
    "requestedQuantity" INTEGER NOT NULL,
    "issuedQuantity" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartRequisitionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" SERIAL NOT NULL,
    "partId" INTEGER NOT NULL,
    "movementType" "StockMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2),
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LostSale" (
    "id" SERIAL NOT NULL,
    "partId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalValue" DECIMAL(10,2) NOT NULL,
    "customerInfo" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LostSale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "paymentNo" TEXT NOT NULL,
    "jobId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "pointsUsed" INTEGER NOT NULL DEFAULT 0,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "vat" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceReminder" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "motorcycleId" INTEGER NOT NULL,
    "reminderType" TEXT NOT NULL,
    "dueMileage" INTEGER,
    "dueDate" TIMESTAMP(3),
    "intervalMiles" INTEGER,
    "intervalDays" INTEGER,
    "lastServiceMileage" INTEGER,
    "lastServiceDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Warranty_warrantyNo_key" ON "Warranty"("warrantyNo");

-- CreateIndex
CREATE UNIQUE INDEX "Warranty_jobId_key" ON "Warranty"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_appointmentNo_key" ON "Appointment"("appointmentNo");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_jobId_key" ON "Appointment"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_quotationNo_key" ON "Quotation"("quotationNo");

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_jobId_key" ON "Quotation"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "Part_partNo_key" ON "Part"("partNo");

-- CreateIndex
CREATE UNIQUE INDEX "PartPackage_packageNo_key" ON "PartPackage"("packageNo");

-- CreateIndex
CREATE UNIQUE INDEX "PartRequisition_reqNo_key" ON "PartRequisition"("reqNo");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentNo_key" ON "Payment"("paymentNo");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_jobId_key" ON "Payment"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_quotationId_key" ON "Job"("quotationId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_appointmentId_key" ON "Job"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_warrantyId_key" ON "Job"("warrantyId");

-- AddForeignKey
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "Motorcycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "Motorcycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_scheduledById_fkey" FOREIGN KEY ("scheduledById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "Motorcycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationItem" ADD CONSTRAINT "QuotationItem_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationItem" ADD CONSTRAINT "QuotationItem_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationItem" ADD CONSTRAINT "QuotationItem_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "PartPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_warrantyId_fkey" FOREIGN KEY ("warrantyId") REFERENCES "Warranty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaborTime" ADD CONSTRAINT "LaborTime_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaborTime" ADD CONSTRAINT "LaborTime_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobChecklistItem" ADD CONSTRAINT "JobChecklistItem_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outsource" ADD CONSTRAINT "Outsource_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartPackageItem" ADD CONSTRAINT "PartPackageItem_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "PartPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartPackageItem" ADD CONSTRAINT "PartPackageItem_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartRequisition" ADD CONSTRAINT "PartRequisition_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartRequisition" ADD CONSTRAINT "PartRequisition_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartRequisitionItem" ADD CONSTRAINT "PartRequisitionItem_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "PartRequisition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartRequisitionItem" ADD CONSTRAINT "PartRequisitionItem_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartRequisitionItem" ADD CONSTRAINT "PartRequisitionItem_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "PartPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostSale" ADD CONSTRAINT "LostSale_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceReminder" ADD CONSTRAINT "ServiceReminder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceReminder" ADD CONSTRAINT "ServiceReminder_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "Motorcycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
