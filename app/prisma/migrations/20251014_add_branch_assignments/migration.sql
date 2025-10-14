
-- CreateTable
CREATE TABLE "branch_assignments" (
    "id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "scheduleOverride" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branch_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "branch_assignments_professionalId_idx" ON "branch_assignments"("professionalId");

-- CreateIndex
CREATE INDEX "branch_assignments_branchId_idx" ON "branch_assignments"("branchId");

-- CreateIndex
CREATE INDEX "branch_assignments_tenantId_idx" ON "branch_assignments"("tenantId");

-- CreateIndex
CREATE INDEX "branch_assignments_isActive_idx" ON "branch_assignments"("isActive");

-- CreateIndex
CREATE INDEX "branch_assignments_isPrimary_idx" ON "branch_assignments"("isPrimary");

-- CreateIndex
CREATE UNIQUE INDEX "branch_assignments_professionalId_branchId_key" ON "branch_assignments"("professionalId", "branchId");

-- AddForeignKey
ALTER TABLE "branch_assignments" ADD CONSTRAINT "branch_assignments_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_assignments" ADD CONSTRAINT "branch_assignments_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_assignments" ADD CONSTRAINT "branch_assignments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
