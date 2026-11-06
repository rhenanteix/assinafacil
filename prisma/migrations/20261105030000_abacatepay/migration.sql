-- Existing Mercado Pago orders keep their provider and entitlement history.
ALTER TABLE "Order"
  ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'mercado_pago',
  ADD COLUMN "checkoutKey" TEXT,
  ADD COLUMN "method" TEXT,
  ADD COLUMN "devMode" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "paymentData" JSONB,
  ADD COLUMN "paymentUpdatedAt" TIMESTAMP(3),
  ADD COLUMN "lastCheckedAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "Order_checkoutKey_key" ON "Order"("checkoutKey");
CREATE TABLE "PaymentEvent" (
  "id" TEXT NOT NULL,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);
