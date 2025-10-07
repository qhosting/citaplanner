
/**
 * iCalendar Export Service
 * Generates RFC 5545 compliant .ics files from CitaPlanner appointments
 */

import ical, { ICalCalendar, ICalEventData } from 'ical-generator';
import { Appointment, Service, Client, User } from '@prisma/client';

export type AppointmentWithRelations = Appointment & {
  service: Service;
  client: Client;
  user: User;
  branch?: { name: string } | null;
};

/**
 * Generate an iCalendar feed for a user's appointments
 * @param appointments - Array of appointments with relations
 * @param userName - Name of the user for calendar identification
 * @returns iCalendar string
 */
export function generateICalFeed(
  appointments: AppointmentWithRelations[],
  userName: string
): string {
  const calendar = ical({
    name: `CitaPlanner - ${userName}`,
    prodId: {
      company: 'CitaPlanner',
      product: 'CitaPlanner Appointment System',
      language: 'ES'
    },
    timezone: 'America/Mexico_City',
    ttl: 3600, // Refresh every hour
  });

  appointments.forEach((appointment) => {
    const event: ICalEventData = {
      start: appointment.startTime,
      end: appointment.endTime,
      summary: `${appointment.service.name} - ${appointment.client.firstName} ${appointment.client.lastName}`,
      description: generateEventDescription(appointment),
      location: appointment.branch?.name || 'CitaPlanner',
      id: appointment.id, // Use CitaPlanner ID as UID
    };

    // Add organizer (professional)
    if (appointment.user) {
      event.organizer = {
        name: `${appointment.user.firstName} ${appointment.user.lastName}`,
        email: appointment.user.email || undefined,
      };
    }

    // Add attendee (client)
    if (appointment.client.email) {
      event.attendees = [{
        name: `${appointment.client.firstName} ${appointment.client.lastName}`,
        email: appointment.client.email,
        rsvp: true,
      }];
    }

    calendar.createEvent(event);
  });

  return calendar.toString();
}

/**
 * Generate a single .ics file for one appointment
 * @param appointment - Appointment with relations
 * @returns iCalendar string
 */
export function generateSingleAppointmentICS(
  appointment: AppointmentWithRelations
): string {
  return generateICalFeed([appointment], 'Appointment');
}

/**
 * Generate detailed event description
 */
function generateEventDescription(appointment: AppointmentWithRelations): string {
  const parts: string[] = [];
  
  parts.push(`Servicio: ${appointment.service.name}`);
  parts.push(`Cliente: ${appointment.client.firstName} ${appointment.client.lastName}`);
  
  if (appointment.client.phone) {
    parts.push(`Teléfono: ${appointment.client.phone}`);
  }
  
  if (appointment.client.email) {
    parts.push(`Email: ${appointment.client.email}`);
  }
  
  if (appointment.service.description) {
    parts.push(`\nDescripción: ${appointment.service.description}`);
  }
  
  if (appointment.notes) {
    parts.push(`\nNotas: ${appointment.notes}`);
  }
  
  parts.push(`\nDuración: ${appointment.service.duration} minutos`);
  parts.push(`Precio: $${appointment.service.price} MXN`);
  parts.push(`Estado: ${appointment.status}`);
  
  return parts.join('\n');
}

/**
 * Map CitaPlanner appointment status to iCalendar status
 */
function mapAppointmentStatusToICalStatus(
  status: string
): 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED' {
  switch (status) {
    case 'CONFIRMED':
    case 'COMPLETED':
      return 'CONFIRMED';
    case 'PENDING':
      return 'TENTATIVE';
    case 'CANCELLED':
    case 'NO_SHOW':
      return 'CANCELLED';
    default:
      return 'TENTATIVE';
  }
}

/**
 * Parse iCalendar RRULE to human-readable format
 * This is a helper for future recurrence support
 */
export function parseRRule(rrule: string): string {
  // Basic parsing - can be enhanced with rrule library
  if (rrule.includes('FREQ=DAILY')) return 'Diario';
  if (rrule.includes('FREQ=WEEKLY')) return 'Semanal';
  if (rrule.includes('FREQ=MONTHLY')) return 'Mensual';
  if (rrule.includes('FREQ=YEARLY')) return 'Anual';
  return 'Personalizado';
}
