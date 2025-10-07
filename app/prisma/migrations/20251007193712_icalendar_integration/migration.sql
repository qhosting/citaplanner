-- CreateEnum for calendar providers
CREATE TYPE "CalendarProvider" AS ENUM ('ICLOUD_CALDAV', 'GOOGLE_CALENDAR', 'OUTLOOK_CALENDAR');

-- CreateEnum for sync status
CREATE TYPE "SyncStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ERROR', 'DISCONNECTED');

-- AlterTable: Add optional iCloud sync fields to appointments
ALTER TABLE "appointments" ADD COLUMN "externalConnectionId" TEXT,
ADD COLUMN "externalEventUrl" TEXT,
ADD COLUMN "externalEventUid" TEXT,
ADD COLUMN "externalEtag" TEXT,
ADD COLUMN "lastModifiedSource" TEXT,
ADD COLUMN "icloudSyncEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: External Calendar Connections
CREATE TABLE "external_calendar_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "CalendarProvider" NOT NULL,
    "calendarUrl" TEXT NOT NULL,
    "calendarName" TEXT,
    "encryptedUsername" TEXT NOT NULL,
    "encryptedPassword" TEXT NOT NULL,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'ACTIVE',
    "syncToken" TEXT,
    "ctag" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncError" TEXT,
    "syncInterval" INTEGER NOT NULL DEFAULT 300,
    "bidirectionalSync" BOOLEAN NOT NULL DEFAULT true,
    "autoExport" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_calendar_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Calendar Sync Logs
CREATE TABLE "calendar_sync_logs" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "eventsImported" INTEGER NOT NULL DEFAULT 0,
    "eventsExported" INTEGER NOT NULL DEFAULT 0,
    "eventsUpdated" INTEGER NOT NULL DEFAULT 0,
    "eventsDeleted" INTEGER NOT NULL DEFAULT 0,
    "conflictsResolved" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "errorDetails" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calendar_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "external_calendar_connections_userId_provider_calendarUrl_key" ON "external_calendar_connections"("userId", "provider", "calendarUrl");

-- CreateIndex
CREATE INDEX "calendar_sync_logs_connectionId_createdAt_idx" ON "calendar_sync_logs"("connectionId", "createdAt");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_externalConnectionId_fkey" FOREIGN KEY ("externalConnectionId") REFERENCES "external_calendar_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_calendar_connections" ADD CONSTRAINT "external_calendar_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_sync_logs" ADD CONSTRAINT "calendar_sync_logs_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "external_calendar_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
