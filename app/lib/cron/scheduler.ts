
/**
 * Local Cron Scheduler
 * 
 * Sistema de cron jobs para desarrollo local usando node-cron
 * Solo se activa en modo desarrollo (NODE_ENV === 'development')
 * 
 * En producción, usar Vercel Cron o servicios externos
 */

import * as cron from 'node-cron';
import { notificationAutomationService } from '../services/notificationAutomationService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class CronScheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private isRunning: boolean = false;

  /**
   * Inicia todos los cron jobs
   */
  start(): void {
    if (this.isRunning) {
      console.log('[CronScheduler] Ya está en ejecución');
      return;
    }

    // Solo ejecutar en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      console.log('[CronScheduler] Solo disponible en modo desarrollo');
      return;
    }

    console.log('[CronScheduler] Iniciando cron jobs...');

    // Job 1: Enviar recordatorios cada hora
    const reminderJob = cron.schedule('0 * * * *', async () => {
      console.log('[CronScheduler] Ejecutando job de recordatorios...');
      try {
        const stats = await notificationAutomationService.sendAppointmentReminders();
        console.log('[CronScheduler] Recordatorios completados:', stats);
      } catch (error: any) {
        console.error('[CronScheduler] Error en job de recordatorios:', error);
      }
    });

    this.jobs.set('reminders', reminderJob);

    // Job 2: Limpiar logs antiguos cada día a las 3 AM
    const cleanupJob = cron.schedule('0 3 * * *', async () => {
      console.log('[CronScheduler] Ejecutando limpieza de logs...');
      try {
        await this.cleanupOldLogs();
      } catch (error: any) {
        console.error('[CronScheduler] Error en limpieza de logs:', error);
      }
    });

    this.jobs.set('cleanup', cleanupJob);

    // Job 3: Verificar pagos pendientes cada 6 horas
    const paymentReminderJob = cron.schedule('0 */6 * * *', async () => {
      console.log('[CronScheduler] Verificando pagos pendientes...');
      try {
        await this.sendPendingPaymentReminders();
      } catch (error: any) {
        console.error('[CronScheduler] Error en recordatorios de pago:', error);
      }
    });

    this.jobs.set('payment-reminders', paymentReminderJob);

    this.isRunning = true;
    console.log('[CronScheduler] Cron jobs iniciados exitosamente');
  }

  /**
   * Detiene todos los cron jobs
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('[CronScheduler] No hay jobs en ejecución');
      return;
    }

    console.log('[CronScheduler] Deteniendo cron jobs...');
    
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`[CronScheduler] Job '${name}' detenido`);
    });

    this.jobs.clear();
    this.isRunning = false;
    console.log('[CronScheduler] Todos los jobs detenidos');
  }

  /**
   * Limpia logs de notificaciones antiguos
   */
  private async cleanupOldLogs(): Promise<void> {
    const retentionDays = parseInt(process.env.NOTIFICATION_LOG_RETENTION_DAYS || '90');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`[CronScheduler] Eliminando logs anteriores a ${cutoffDate.toISOString()}`);

    const result = await prisma.notificationLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        status: {
          in: ['SENT', 'DELIVERED', 'READ'],
        },
      },
    });

    console.log(`[CronScheduler] ${result.count} logs eliminados`);
  }

  /**
   * Envía recordatorios de pagos pendientes
   */
  private async sendPendingPaymentReminders(): Promise<void> {
    // Buscar ventas con estado PENDING (más de 7 días)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    const pendingSales = await prisma.sale.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lte: cutoffDate,
        },
      },
      select: {
        id: true,
      },
    });

    console.log(`[CronScheduler] Encontradas ${pendingSales.length} ventas con pagos pendientes`);

    for (const sale of pendingSales) {
      try {
        await notificationAutomationService.sendPaymentReminder(sale.id);
      } catch (error: any) {
        console.error(`[CronScheduler] Error al enviar recordatorio para venta ${sale.id}:`, error);
      }
    }
  }

  /**
   * Ejecuta un job manualmente (útil para testing)
   */
  async runJob(jobName: string): Promise<void> {
    console.log(`[CronScheduler] Ejecutando job '${jobName}' manualmente...`);

    switch (jobName) {
      case 'reminders':
        await notificationAutomationService.sendAppointmentReminders();
        break;
      case 'cleanup':
        await this.cleanupOldLogs();
        break;
      case 'payment-reminders':
        await this.sendPendingPaymentReminders();
        break;
      default:
        console.error(`[CronScheduler] Job '${jobName}' no encontrado`);
    }
  }
}

export const cronScheduler = new CronScheduler();

// Auto-iniciar en desarrollo si está habilitado
if (process.env.NODE_ENV === 'development' && process.env.NOTIFICATION_AUTOMATION_ENABLED !== 'false') {
  cronScheduler.start();
}
