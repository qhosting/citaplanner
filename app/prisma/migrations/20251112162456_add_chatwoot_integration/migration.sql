-- AddChatwootIntegration
-- Agregar soporte para integración bidireccional de Chatwoot

-- 1. Agregar campo chatwootContactId a la tabla clients
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "chatwootContactId" TEXT;

-- 2. Crear índice para chatwootContactId
CREATE INDEX IF NOT EXISTS "clients_chatwootContactId_idx" ON "clients"("chatwootContactId");

-- 3. Agregar campos de API a chatwoot_configs
ALTER TABLE "chatwoot_configs" ADD COLUMN IF NOT EXISTS "apiAccessToken" TEXT;
ALTER TABLE "chatwoot_configs" ADD COLUMN IF NOT EXISTS "accountId" TEXT;
ALTER TABLE "chatwoot_configs" ADD COLUMN IF NOT EXISTS "inboxId" TEXT;
ALTER TABLE "chatwoot_configs" ADD COLUMN IF NOT EXISTS "enableNotifications" BOOLEAN NOT NULL DEFAULT false;

-- 4. Actualizar comentarios en chatwoot_configs
COMMENT ON COLUMN "chatwoot_configs"."websiteToken" IS 'Chatwoot website token (para widget)';
COMMENT ON COLUMN "chatwoot_configs"."apiAccessToken" IS 'API access token para envío de mensajes';
COMMENT ON COLUMN "chatwoot_configs"."accountId" IS 'Chatwoot account ID';
COMMENT ON COLUMN "chatwoot_configs"."inboxId" IS 'Inbox ID para envío de mensajes';
COMMENT ON COLUMN "chatwoot_configs"."enableNotifications" IS 'Habilitar envío de notificaciones vía Chatwoot';

-- 5. Agregar canal CHATWOOT al enum NotificationChannel si no existe
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'NotificationChannel' AND e.enumlabel = 'CHATWOOT'
    ) THEN
        ALTER TYPE "NotificationChannel" ADD VALUE 'CHATWOOT';
    END IF;
END $$;

-- 6. Agregar campos de Chatwoot a notification_settings
ALTER TABLE "notification_settings" ADD COLUMN IF NOT EXISTS "chatwootEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "notification_settings" ADD COLUMN IF NOT EXISTS "chatwootApiUrl" TEXT;
ALTER TABLE "notification_settings" ADD COLUMN IF NOT EXISTS "chatwootApiToken" TEXT;
ALTER TABLE "notification_settings" ADD COLUMN IF NOT EXISTS "chatwootAccountId" TEXT;
ALTER TABLE "notification_settings" ADD COLUMN IF NOT EXISTS "chatwootInboxId" TEXT;

-- 7. Comentarios descriptivos
COMMENT ON COLUMN "notification_settings"."chatwootEnabled" IS 'Habilitar canal de Chatwoot para notificaciones';
COMMENT ON COLUMN "notification_settings"."chatwootApiUrl" IS 'URL de la API de Chatwoot';
COMMENT ON COLUMN "notification_settings"."chatwootApiToken" IS 'Token de acceso a la API de Chatwoot';
COMMENT ON COLUMN "notification_settings"."chatwootAccountId" IS 'ID de cuenta de Chatwoot';
COMMENT ON COLUMN "notification_settings"."chatwootInboxId" IS 'ID de inbox para envío de mensajes';
