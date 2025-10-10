#!/bin/bash

# Script para aplicar las correcciones críticas del sistema de notificaciones
# Fecha: 9 de Octubre, 2025
# Versión: 1.0

set -e

echo "🔧 Aplicando correcciones críticas para CitaPlanner..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] && [ ! -d "app" ]; then
    echo "❌ Error: Este script debe ejecutarse desde la raíz del repositorio citaplanner"
    exit 1
fi

echo "📁 Paso 1: Corrigiendo estructura de directorios..."

# Crear directorio correcto si no existe
mkdir -p app/app/dashboard/notifications

# Mover archivo a ubicación correcta
if [ -f "app/dashboard/notifications/page.tsx" ]; then
    echo "   Moviendo app/dashboard/notifications/page.tsx → app/app/dashboard/notifications/"
    mv app/dashboard/notifications/page.tsx app/app/dashboard/notifications/
    
    # Eliminar directorio vacío
    rmdir app/dashboard/notifications 2>/dev/null || true
    rmdir app/dashboard 2>/dev/null || true
    
    echo "   ✅ Archivo movido correctamente"
else
    echo "   ⚠️  Archivo ya está en la ubicación correcta o no existe"
fi

echo ""
echo "🗄️  Paso 2: Corrigiendo migración de Prisma..."

MIGRATION_FILE="app/prisma/migrations/20251009072859_notifications_system/migration.sql"

if [ -f "$MIGRATION_FILE" ]; then
    # Crear backup
    cp "$MIGRATION_FILE" "${MIGRATION_FILE}.backup"
    echo "   Backup creado: ${MIGRATION_FILE}.backup"
    
    # Aplicar corrección
    cat > "$MIGRATION_FILE" << 'EOF'
-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('WHATSAPP', 'PUSH', 'EMAIL', 'SMS');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'APPOINTMENT_REMINDER';
ALTER TYPE "NotificationType" ADD VALUE 'APPOINTMENT_CONFIRMATION';
ALTER TYPE "NotificationType" ADD VALUE 'APPOINTMENT_CANCELLATION';
ALTER TYPE "NotificationType" ADD VALUE 'APPOINTMENT_RESCHEDULE';
ALTER TYPE "NotificationType" ADD VALUE 'PROMOTION';
ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_REMINDER';

-- AlterEnum
ALTER TYPE "NotificationStatus" ADD VALUE 'READ';

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "evolutionApiUrl" TEXT,
    "evolutionApiKey" TEXT,
    "whatsappInstanceName" TEXT,
    "appointmentReminderEnabled" BOOLEAN NOT NULL DEFAULT true,
    "appointmentReminderTimes" TEXT,
    "autoConfirmEnabled" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- AlterTable notification_templates - Add new columns
ALTER TABLE "notification_templates" 
ADD COLUMN "channel" "NotificationChannel" NOT NULL DEFAULT 'EMAIL',
ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable notification_templates - Rename column
ALTER TABLE "notification_templates" 
RENAME COLUMN "body" TO "message";

-- AlterTable notification_logs - Add new columns
ALTER TABLE "notification_logs" 
ADD COLUMN "channel" "NotificationChannel" NOT NULL DEFAULT 'EMAIL',
ADD COLUMN "recipientId" TEXT NOT NULL DEFAULT '',
ADD COLUMN "recipientName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "recipientContact" TEXT NOT NULL DEFAULT '',
ADD COLUMN "readAt" TIMESTAMP(3),
ADD COLUMN "errorMessage" TEXT,
ADD COLUMN "metadata" TEXT;

-- AlterTable notification_logs - Rename columns
ALTER TABLE "notification_logs" 
RENAME COLUMN "recipient" TO "recipientContact_old";

ALTER TABLE "notification_logs" 
RENAME COLUMN "error" TO "errorMessage_old";

-- Update existing data
UPDATE "notification_logs" SET "recipientContact" = "recipientContact_old" WHERE "recipientContact_old" IS NOT NULL;
UPDATE "notification_logs" SET "errorMessage" = "errorMessage_old" WHERE "errorMessage_old" IS NOT NULL;

-- Drop old columns
ALTER TABLE "notification_logs" DROP COLUMN "recipientContact_old";
ALTER TABLE "notification_logs" DROP COLUMN "errorMessage_old";

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_tenantId_key" ON "notification_settings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_tenantId_isActive_idx" ON "push_subscriptions"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "push_subscriptions_userId_idx" ON "push_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "notification_templates_tenantId_type_channel_idx" ON "notification_templates"("tenantId", "type", "channel");

-- CreateIndex
CREATE INDEX "notification_logs_tenantId_status_idx" ON "notification_logs"("tenantId", "status");

-- CreateIndex
CREATE INDEX "notification_logs_tenantId_createdAt_idx" ON "notification_logs"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "notification_logs_appointmentId_idx" ON "notification_logs"("appointmentId");

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EOF
    
    echo "   ✅ Migración corregida"
else
    echo "   ⚠️  Archivo de migración no encontrado"
fi

echo ""
echo "✅ Correcciones aplicadas exitosamente"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Revisar los cambios: git status"
echo "   2. Crear commit: git add . && git commit -m 'fix: notifications deployment critical fixes'"
echo "   3. Crear PR o push directo a main"
echo ""
echo "🔍 Para verificar localmente:"
echo "   cd app"
echo "   npm install --legacy-peer-deps"
echo "   npx prisma generate"
echo "   npx prisma migrate deploy"
echo "   npm run build"
echo "   npm run dev"
echo ""
