CREATE TYPE "CatalogKind" AS ENUM ('HOTEL', 'ACTIVITY');
CREATE TYPE "CatalogPricingUnit" AS ENUM ('PER_NIGHT', 'PER_PERSON');
CREATE TYPE "PdfStatus" AS ENUM ('NOT_REQUESTED', 'PENDING', 'READY', 'FAILED');

CREATE TABLE "CatalogItem" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" "CatalogKind" NOT NULL,
    "name" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pricingUnit" "CatalogPricingUnit" NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'COP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "leadId" TEXT,
    "prompt" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "travelerCount" INTEGER NOT NULL,
    "pdfStatus" "PdfStatus" NOT NULL DEFAULT 'NOT_REQUESTED',
    "pdfData" BYTEA,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuoteOption" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'COP',

    CONSTRAINT "QuoteOption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuoteOptionItem" (
    "id" TEXT NOT NULL,
    "quoteOptionId" TEXT NOT NULL,
    "catalogItemId" TEXT NOT NULL,
    "nameSnapshot" TEXT NOT NULL,
    "descriptionSnapshot" TEXT NOT NULL,
    "pricingUnit" "CatalogPricingUnit" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "QuoteOptionItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CatalogItem_agencyId_slug_key" ON "CatalogItem"("agencyId", "slug");
CREATE INDEX "CatalogItem_agencyId_kind_destination_idx" ON "CatalogItem"("agencyId", "kind", "destination");
CREATE INDEX "Quote_agencyId_createdAt_idx" ON "Quote"("agencyId", "createdAt");
CREATE INDEX "Quote_agencyId_leadId_idx" ON "Quote"("agencyId", "leadId");
CREATE INDEX "Quote_agencyId_createdById_idx" ON "Quote"("agencyId", "createdById");
CREATE UNIQUE INDEX "QuoteOption_quoteId_position_key" ON "QuoteOption"("quoteId", "position");
CREATE INDEX "QuoteOptionItem_quoteOptionId_idx" ON "QuoteOptionItem"("quoteOptionId");

ALTER TABLE "CatalogItem" ADD CONSTRAINT "CatalogItem_agencyId_fkey"
    FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_agencyId_fkey"
    FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "QuoteOption" ADD CONSTRAINT "QuoteOption_quoteId_fkey"
    FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuoteOptionItem" ADD CONSTRAINT "QuoteOptionItem_quoteOptionId_fkey"
    FOREIGN KEY ("quoteOptionId") REFERENCES "QuoteOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuoteOptionItem" ADD CONSTRAINT "QuoteOptionItem_catalogItemId_fkey"
    FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
