
/**
 * iCloud CalDAV Integration Service
 * Handles bidirectional synchronization with iCloud Calendar
 */

import { createDAVClient, DAVClient, DAVCalendar, DAVCalendarObject } from 'tsdav';
import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from './encryption';
// @ts-ignore - ical.js doesn't have proper TypeScript definitions
import ICAL from 'ical.js';

const prisma = new PrismaClient();

export interface ICloudCredentials {
  appleId: string; // Apple ID email
  appSpecificPassword: string; // Generated from appleid.apple.com
}

export interface CalendarSyncResult {
  success: boolean;
  eventsImported: number;
  eventsExported: number;
  eventsUpdated: number;
  eventsDeleted: number;
  conflictsResolved: number;
  errors: string[];
}

/**
 * Create and authenticate a CalDAV client for iCloud
 */
export async function createICloudClient(
  credentials: ICloudCredentials
): Promise<any> {
  try {
    const client = await createDAVClient({
      serverUrl: 'https://caldav.icloud.com',
      credentials: {
        username: credentials.appleId,
        password: credentials.appSpecificPassword,
      },
      authMethod: 'Basic',
      defaultAccountType: 'caldav',
    });

    return client;
  } catch (error) {
    console.error('Failed to create iCloud CalDAV client:', error);
    throw new Error('Failed to authenticate with iCloud. Please check your credentials.');
  }
}

/**
 * Fetch available calendars from iCloud
 */
export async function fetchICloudCalendars(
  client: any
): Promise<DAVCalendar[]> {
  try {
    const calendars = await client.fetchCalendars();
    return calendars;
  } catch (error) {
    console.error('Failed to fetch calendars:', error);
    throw new Error('Failed to fetch calendars from iCloud');
  }
}

/**
 * Store encrypted iCloud connection in database
 */
export async function storeICloudConnection(
  userId: string,
  credentials: ICloudCredentials,
  calendarUrl: string,
  calendarName?: string
): Promise<string> {
  try {
    const encryptedUsername = encrypt(credentials.appleId);
    const encryptedPassword = encrypt(credentials.appSpecificPassword);

    const connection = await prisma.externalCalendarConnection.create({
      data: {
        userId,
        provider: 'ICLOUD_CALDAV',
        calendarUrl,
        calendarName,
        encryptedUsername,
        encryptedPassword,
        syncStatus: 'ACTIVE',
        syncInterval: 300, // 5 minutes
        bidirectionalSync: true,
        autoExport: true,
      },
    });

    return connection.id;
  } catch (error) {
    console.error('Failed to store iCloud connection:', error);
    throw new Error('Failed to save iCloud connection');
  }
}

/**
 * Retrieve and decrypt iCloud credentials from database
 */
export async function getICloudCredentials(
  connectionId: string
): Promise<ICloudCredentials> {
  try {
    const connection = await prisma.externalCalendarConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new Error('Connection not found');
    }

    return {
      appleId: decrypt(connection.encryptedUsername),
      appSpecificPassword: decrypt(connection.encryptedPassword),
    };
  } catch (error) {
    console.error('Failed to retrieve credentials:', error);
    throw new Error('Failed to retrieve iCloud credentials');
  }
}

/**
 * Perform initial sync from iCloud to CitaPlanner
 */
export async function performInitialSync(
  connectionId: string
): Promise<CalendarSyncResult> {
  const result: CalendarSyncResult = {
    success: false,
    eventsImported: 0,
    eventsExported: 0,
    eventsUpdated: 0,
    eventsDeleted: 0,
    conflictsResolved: 0,
    errors: [],
  };

  try {
    const connection = await prisma.externalCalendarConnection.findUnique({
      where: { id: connectionId },
      include: { user: true },
    });

    if (!connection) {
      throw new Error('Connection not found');
    }

    const credentials = await getICloudCredentials(connectionId);
    const client = await createICloudClient(credentials);

    // Fetch calendar objects
    const calendarObjects = await client.fetchCalendarObjects({
      calendar: {
        url: connection.calendarUrl,
      } as DAVCalendar,
    });

    // Process each event
    for (const calObj of calendarObjects) {
      try {
        await importCalendarEvent(connectionId, connection.userId, calObj);
        result.eventsImported++;
      } catch (error) {
        result.errors.push(`Failed to import event: ${error}`);
      }
    }

    // Update last sync time
    await prisma.externalCalendarConnection.update({
      where: { id: connectionId },
      data: {
        lastSyncAt: new Date(),
      },
    });

    result.success = result.errors.length === 0;

    // Log sync operation
    await logSyncOperation(connectionId, 'INITIAL', 'IMPORT', result);

    return result;
  } catch (error) {
    console.error('Initial sync failed:', error);
    result.errors.push(`Sync failed: ${error}`);
    await logSyncOperation(connectionId, 'INITIAL', 'IMPORT', result);
    return result;
  }
}

/**
 * Import a single calendar event from iCloud
 */
async function importCalendarEvent(
  connectionId: string,
  userId: string,
  calendarObject: DAVCalendarObject
): Promise<void> {
  try {
    // Parse iCalendar data
    const jcalData = ICAL.parse(calendarObject.data);
    const comp = new ICAL.Component(jcalData);
    const vevent = comp.getFirstSubcomponent('vevent');

    if (!vevent) {
      throw new Error('No VEVENT found in calendar object');
    }

    const event = new ICAL.Event(vevent);

    // Extract event details
    const summary = event.summary || 'Untitled Event';
    const startTime = event.startDate.toJSDate();
    const endTime = event.endDate.toJSDate();
    const description = event.description || '';
    const location = event.location || '';
    const uid = event.uid;

    // Check if event already exists
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        externalEventUid: uid,
        externalConnectionId: connectionId,
      },
    });

    if (existingAppointment) {
      // Update existing appointment
      await prisma.appointment.update({
        where: { id: existingAppointment.id },
        data: {
          startTime,
          endTime,
          notes: description,
          externalEtag: calendarObject.etag,
          lastModifiedSource: 'EXTERNAL',
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new appointment
      // Note: This requires mapping to existing services and clients
      // For now, we'll skip creation and just log
      console.log('New event from iCloud (manual mapping required):', {
        summary,
        startTime,
        endTime,
        description,
        location,
      });
    }
  } catch (error) {
    console.error('Failed to import calendar event:', error);
    throw error;
  }
}

/**
 * Export CitaPlanner appointment to iCloud
 */
export async function exportAppointmentToICloud(
  appointmentId: string,
  connectionId: string
): Promise<boolean> {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: true,
        client: true,
        user: true,
        branch: true,
      },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const connection = await prisma.externalCalendarConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new Error('Connection not found');
    }

    const credentials = await getICloudCredentials(connectionId);
    const client = await createICloudClient(credentials);

    // Generate iCalendar data
    const icalData = generateICalendarEvent(appointment);

    // Create event on CalDAV server
    const result = await client.createCalendarObject({
      calendar: {
        url: connection.calendarUrl,
      } as DAVCalendar,
      filename: `${appointment.id}.ics`,
      iCalString: icalData,
    });

    // Update appointment with external reference
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        externalConnectionId: connectionId,
        externalEventUrl: (result as any).url || connection.calendarUrl,
        externalEventUid: appointment.id,
        externalEtag: (result as any).etag || '',
        lastModifiedSource: 'CITAPLANNER',
        icloudSyncEnabled: true,
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to export appointment to iCloud:', error);
    return false;
  }
}

/**
 * Generate iCalendar VEVENT string for an appointment
 */
function generateICalendarEvent(appointment: any): string {
  const comp = new ICAL.Component(['vcalendar', [], []]);
  comp.updatePropertyWithValue('prodid', '-//CitaPlanner//EN');
  comp.updatePropertyWithValue('version', '2.0');

  const vevent = new ICAL.Component('vevent');
  const event = new ICAL.Event(vevent);

  event.uid = appointment.id;
  event.summary = `${appointment.service.name} - ${appointment.client.firstName} ${appointment.client.lastName}`;
  event.startDate = ICAL.Time.fromJSDate(appointment.startTime, true);
  event.endDate = ICAL.Time.fromJSDate(appointment.endTime, true);
  event.description = appointment.notes || '';
  event.location = appointment.branch?.name || '';

  comp.addSubcomponent(vevent);

  return comp.toString();
}

/**
 * Log sync operation to database
 */
async function logSyncOperation(
  connectionId: string,
  syncType: string,
  direction: string,
  result: CalendarSyncResult
): Promise<void> {
  try {
    await prisma.calendarSyncLog.create({
      data: {
        connectionId,
        syncType,
        direction,
        status: result.success ? 'SUCCESS' : 'FAILED',
        eventsImported: result.eventsImported,
        eventsExported: result.eventsExported,
        eventsUpdated: result.eventsUpdated,
        eventsDeleted: result.eventsDeleted,
        conflictsResolved: result.conflictsResolved,
        errorMessage: result.errors.length > 0 ? result.errors.join('; ') : null,
      },
    });
  } catch (error) {
    console.error('Failed to log sync operation:', error);
  }
}

/**
 * Disconnect iCloud calendar
 */
export async function disconnectICloud(connectionId: string): Promise<boolean> {
  try {
    await prisma.externalCalendarConnection.update({
      where: { id: connectionId },
      data: {
        syncStatus: 'DISCONNECTED',
      },
    });
    return true;
  } catch (error) {
    console.error('Failed to disconnect iCloud:', error);
    return false;
  }
}
