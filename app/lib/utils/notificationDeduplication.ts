
/**
 * Notification Deduplication Utility
 * 
 * Utilidad para prevenir el envío de notificaciones duplicadas
 * verificando el historial reciente en NotificationLog
 */

import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Verifica si se ha enviado una notificación similar recientemente
 * 
 * @param type - Tipo de notificación
 * @param recipientId - ID del destinatario
 * @param relatedId - ID relacionado (appointmentId, saleId, etc.)
 * @param hours - Ventana de tiempo en horas para verificar duplicados
 * @returns true si existe una notificación reciente, false si no
 */
export async function hasRecentNotification(
  type: NotificationType,
  recipientId: string,
  relatedId: string,
  hours: number = 1
): Promise<boolean> {
  try {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);

    const recentNotification = await prisma.notificationLog.findFirst({
      where: {
        type,
        recipientId,
        createdAt: {
          gte: cutoffTime,
        },
        OR: [
          {
            appointmentId: relatedId,
          },
          {
            metadata: {
              contains: relatedId,
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return recentNotification !== null;
  } catch (error: any) {
    console.error('[NotificationDeduplication] Error al verificar duplicados:', error);
    // En caso de error, permitir el envío (fail-safe)
    return false;
  }
}

/**
 * Verifica si se ha enviado una notificación de cualquier tipo recientemente
 * 
 * @param recipientId - ID del destinatario
 * @param relatedId - ID relacionado
 * @param minutes - Ventana de tiempo en minutos
 * @returns true si existe cualquier notificación reciente
 */
export async function hasAnyRecentNotification(
  recipientId: string,
  relatedId: string,
  minutes: number = 30
): Promise<boolean> {
  try {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - minutes);

    const recentNotification = await prisma.notificationLog.findFirst({
      where: {
        recipientId,
        createdAt: {
          gte: cutoffTime,
        },
        OR: [
          {
            appointmentId: relatedId,
          },
          {
            metadata: {
              contains: relatedId,
            },
          },
        ],
      },
    });

    return recentNotification !== null;
  } catch (error: any) {
    console.error('[NotificationDeduplication] Error al verificar duplicados:', error);
    return false;
  }
}

/**
 * Obtiene el conteo de notificaciones enviadas en un período
 * 
 * @param type - Tipo de notificación
 * @param recipientId - ID del destinatario
 * @param hours - Ventana de tiempo en horas
 * @returns Número de notificaciones enviadas
 */
export async function getNotificationCount(
  type: NotificationType,
  recipientId: string,
  hours: number = 24
): Promise<number> {
  try {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);

    const count = await prisma.notificationLog.count({
      where: {
        type,
        recipientId,
        createdAt: {
          gte: cutoffTime,
        },
      },
    });

    return count;
  } catch (error: any) {
    console.error('[NotificationDeduplication] Error al contar notificaciones:', error);
    return 0;
  }
}
