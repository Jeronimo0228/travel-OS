-- Add the mandatory, tenant-level fiscal identifier for new and empty environments.
ALTER TABLE "Agency" ADD COLUMN "nit" TEXT NOT NULL;

CREATE UNIQUE INDEX "Agency_nit_key" ON "Agency"("nit");
