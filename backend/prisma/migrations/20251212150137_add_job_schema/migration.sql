-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('NORMAL', 'FAST_TRACK');

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "jobNo" TEXT NOT NULL,
    "symptom" TEXT NOT NULL,
    "fuelLevel" INTEGER,
    "valuables" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "jobType" "JobType" NOT NULL DEFAULT 'NORMAL',
    "motorcycleId" INTEGER NOT NULL,
    "receptionId" INTEGER,
    "technicianId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobNo_key" ON "Job"("jobNo");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES "Motorcycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_receptionId_fkey" FOREIGN KEY ("receptionId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
