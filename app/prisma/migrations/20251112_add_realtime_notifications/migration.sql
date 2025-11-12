-- CreateTable: User Notification Preferences
CREATE TABLE "user_notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enablePushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "enableEmailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "enableSMSNotifications" BOOLEAN NOT NULL DEFAULT false,
    "enableWhatsAppNotifications" BOOLEAN NOT NULL DEFAULT false,
    "notifyAppointmentCreated" BOOLEAN NOT NULL DEFAULT true,
    "notifyAppointmentUpdated" BOOLEAN NOT NULL DEFAULT true,
    "notifyAppointmentCancelled" BOOLEAN NOT NULL DEFAULT true,
    "notifyAppointmentReminder" BOOLEAN NOT NULL DEFAULT true,
    "notifyScheduleChanges" BOOLEAN NOT NULL DEFAULT true,
    "notifySystemAlerts" BOOLEAN NOT NULL DEFAULT true,
    "enableSounds" BOOLEAN NOT NULL DEFAULT true,
    "enableDesktopNotifications" BOOLEAN NOT NULL DEFAULT true,
    "enableToastNotifications" BOOLEAN NOT NULL DEFAULT true,
    "reminderMinutesBefore" INTEGER[] DEFAULT ARRAY[1440, 60]::INTEGER[],
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_preferences_userId_key" ON "user_notification_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_notification_preferences_tenantId_idx" ON "user_notification_preferences"("tenantId");

-- AddForeignKey
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
