
-- CreateTable
CREATE TABLE "master_admin_config" (
    "id" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_password_change" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "master_admin_config_pkey" PRIMARY KEY ("id")
);

-- Ensure only one config record exists
CREATE UNIQUE INDEX "master_admin_config_singleton_idx" ON "master_admin_config"("id") WHERE "id" = 'singleton';
