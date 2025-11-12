-- CreateTable
CREATE TABLE "chatwoot_configs" (
    "id" TEXT NOT NULL,
    "websiteToken" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "position" TEXT NOT NULL DEFAULT 'right',
    "locale" TEXT NOT NULL DEFAULT 'es',
    "widgetColor" TEXT,
    "tenantId" TEXT NOT NULL,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatwoot_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chatwoot_configs_tenantId_idx" ON "chatwoot_configs"("tenantId");

-- CreateIndex
CREATE INDEX "chatwoot_configs_branchId_idx" ON "chatwoot_configs"("branchId");

-- CreateIndex
CREATE INDEX "chatwoot_configs_isActive_idx" ON "chatwoot_configs"("isActive");

-- AddForeignKey
ALTER TABLE "chatwoot_configs" ADD CONSTRAINT "chatwoot_configs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatwoot_configs" ADD CONSTRAINT "chatwoot_configs_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
