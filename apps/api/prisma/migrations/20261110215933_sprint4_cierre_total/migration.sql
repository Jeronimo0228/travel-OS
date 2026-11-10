-- CreateEnum
CREATE TYPE "AgencyKind" AS ENUM ('AGENCY', 'WHOLESALER');

-- CreateEnum
CREATE TYPE "PartnershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "ProgramBookingStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Agency" ADD COLUMN     "kind" "AgencyKind" NOT NULL DEFAULT 'AGENCY';

-- AlterTable
ALTER TABLE "CatalogItem" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "disabledAt" TIMESTAMP(3),
ADD COLUMN     "sessionVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInvitation" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ASESOR',
    "tokenHash" TEXT NOT NULL,
    "createdById" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateCounter" (
    "key" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RateCounter_pkey" PRIMARY KEY ("key","windowStart")
);

-- CreateTable
CREATE TABLE "AiKeyCooldown" (
    "keyHash" TEXT NOT NULL,
    "until" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiKeyCooldown_pkey" PRIMARY KEY ("keyHash")
);

-- CreateTable
CREATE TABLE "Partnership" (
    "id" TEXT NOT NULL,
    "wholesalerId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "commissionPct" DECIMAL(5,2) NOT NULL,
    "status" "PartnershipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partnership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "wholesalerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "netPrice" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'COP',
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Departure" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "startsOn" TIMESTAMP(3) NOT NULL,
    "seats" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Departure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramBooking" (
    "id" TEXT NOT NULL,
    "departureId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "wholesalerId" TEXT NOT NULL,
    "travelerName" TEXT NOT NULL,
    "pax" INTEGER NOT NULL,
    "status" "ProgramBookingStatus" NOT NULL DEFAULT 'REQUESTED',
    "netTotal" DECIMAL(12,2) NOT NULL,
    "commissionPct" DECIMAL(5,2) NOT NULL,
    "commissionTotal" DECIMAL(12,2) NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserInvitation_tokenHash_key" ON "UserInvitation"("tokenHash");

-- CreateIndex
CREATE INDEX "UserInvitation_agencyId_idx" ON "UserInvitation"("agencyId");

-- CreateIndex
CREATE INDEX "RateCounter_windowStart_idx" ON "RateCounter"("windowStart");

-- CreateIndex
CREATE INDEX "Partnership_agencyId_idx" ON "Partnership"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "Partnership_wholesalerId_agencyId_key" ON "Partnership"("wholesalerId", "agencyId");

-- CreateIndex
CREATE INDEX "Program_wholesalerId_idx" ON "Program"("wholesalerId");

-- CreateIndex
CREATE INDEX "Departure_programId_startsOn_idx" ON "Departure"("programId", "startsOn");

-- CreateIndex
CREATE INDEX "ProgramBooking_agencyId_idx" ON "ProgramBooking"("agencyId");

-- CreateIndex
CREATE INDEX "ProgramBooking_wholesalerId_idx" ON "ProgramBooking"("wholesalerId");

-- CreateIndex
CREATE INDEX "ProgramBooking_departureId_idx" ON "ProgramBooking"("departureId");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInvitation" ADD CONSTRAINT "UserInvitation_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInvitation" ADD CONSTRAINT "UserInvitation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partnership" ADD CONSTRAINT "Partnership_wholesalerId_fkey" FOREIGN KEY ("wholesalerId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partnership" ADD CONSTRAINT "Partnership_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_wholesalerId_fkey" FOREIGN KEY ("wholesalerId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Departure" ADD CONSTRAINT "Departure_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramBooking" ADD CONSTRAINT "ProgramBooking_departureId_fkey" FOREIGN KEY ("departureId") REFERENCES "Departure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramBooking" ADD CONSTRAINT "ProgramBooking_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramBooking" ADD CONSTRAINT "ProgramBooking_wholesalerId_fkey" FOREIGN KEY ("wholesalerId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
