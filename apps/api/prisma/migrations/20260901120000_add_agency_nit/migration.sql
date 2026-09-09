-- Safe add for empty and non-empty Agency tables.
ALTER TABLE "Agency" ADD COLUMN "nit" TEXT;

UPDATE "Agency"
SET "nit" = 'legacy-' || "id"
WHERE "nit" IS NULL;

ALTER TABLE "Agency" ALTER COLUMN "nit" SET NOT NULL;

CREATE UNIQUE INDEX "Agency_nit_key" ON "Agency"("nit");
