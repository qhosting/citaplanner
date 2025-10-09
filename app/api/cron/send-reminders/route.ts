
/**
 * Cron Job Endpoint: Send Appointment Reminders
 * 
 * Endpoint protegido que se ejecuta periódicamente (cada hora)
 * para enviar recordatorios de citas próximas
 * 
 * Configuración en Vercel Cron o llamada externa con token de autorización
 */

import { NextRequest, NextResponse } from 'next/server';
import { notificationAutomationService } from '@/lib/services/notificationAutomationService';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutos máximo

export async function GET(request: NextRequest) {
  try {
    // Verificar token de autorización
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[CronJob] CRON_SECRET no configurado');
      return NextResponse.json(
        { success: false, error: 'Configuración de cron no válida' },
        { status: 500 }
      );
    }

    // Verificar autorización
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[CronJob] Intento de acceso no autorizado');
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar si la automatización está habilitada
    const automationEnabled = process.env.NOTIFICATION_AUTOMATION_ENABLED !== 'false';
    if (!automationEnabled) {
      console.log('[CronJob] Automatización de notificaciones deshabilitada');
      return NextResponse.json({
        success: true,
        message: 'Automatización deshabilitada',
        stats: { sent: 0, failed: 0, skipped: 0 },
      });
    }

    console.log('[CronJob] Iniciando job de recordatorios...');
    const startTime = Date.now();

    // Ejecutar envío de recordatorios
    const stats = await notificationAutomationService.sendAppointmentReminders();

    const duration = Date.now() - startTime;
    console.log(`[CronJob] Job completado en ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: 'Recordatorios procesados exitosamente',
      stats,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[CronJob] Error al ejecutar job de recordatorios:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error desconocido',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// También permitir POST para mayor flexibilidad
export async function POST(request: NextRequest) {
  return GET(request);
}
