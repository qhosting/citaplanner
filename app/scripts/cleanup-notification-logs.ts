
/**
 * Cleanup Notification Logs Script
 * 
 * Script para limpiar logs de notificaciones antiguos
 * Puede ejecutarse manualmente o programarse como cron job
 * 
 * Uso:
 *   npx ts-node scripts/cleanup-notification-logs.ts [--days=90] [--dry-run]
 */

import { PrismaClient, NotificationStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface CleanupOptions {
  retentionDays: number;
  dryRun: boolean;
  keepFailed: boolean;
}

async function cleanupNotificationLogs(options: CleanupOptions): Promise<void> {
  const { retentionDays, dryRun, keepFailed } = options;

  console.log('='.repeat(60));
  console.log('Limpieza de Logs de Notificaciones');
  console.log('='.repeat(60));
  console.log(`Retención: ${retentionDays} días`);
  console.log(`Modo: ${dryRun ? 'DRY RUN (simulación)' : 'EJECUCIÓN REAL'}`);
  console.log(`Mantener fallidas: ${keepFailed ? 'SÍ' : 'NO'}`);
  console.log('='.repeat(60));

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  console.log(`\nEliminando logs anteriores a: ${cutoffDate.toISOString()}\n`);

  // Construir filtros
  const whereClause: any = {
    createdAt: {
      lt: cutoffDate,
    },
  };

  // Si keepFailed es true, solo eliminar logs exitosos
  if (keepFailed) {
    whereClause.status = {
      in: [NotificationStatus.SENT, NotificationStatus.DELIVERED, NotificationStatus.READ],
    };
  }

  // Contar logs a eliminar
  const countToDelete = await prisma.notificationLog.count({
    where: whereClause,
  });

  console.log(`Logs a eliminar: ${countToDelete}`);

  if (countToDelete === 0) {
    console.log('\n✓ No hay logs para eliminar');
    return;
  }

  // Obtener estadísticas antes de eliminar
  const stats = await prisma.notificationLog.groupBy({
    by: ['status', 'type'],
    where: whereClause,
    _count: true,
  });

  console.log('\nDesglose por tipo y estado:');
  stats.forEach((stat) => {
    console.log(`  ${stat.type} - ${stat.status}: ${stat._count}`);
  });

  if (dryRun) {
    console.log('\n⚠ DRY RUN: No se eliminaron logs (usa --execute para ejecutar)');
    return;
  }

  // Confirmar eliminación
  console.log('\n⚠ ADVERTENCIA: Esta acción no se puede deshacer');
  console.log('Presiona Ctrl+C para cancelar o espera 5 segundos...\n');

  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Eliminar logs
  console.log('Eliminando logs...');
  const startTime = Date.now();

  const result = await prisma.notificationLog.deleteMany({
    where: whereClause,
  });

  const duration = Date.now() - startTime;

  console.log(`\n✓ ${result.count} logs eliminados en ${duration}ms`);

  // Estadísticas finales
  const remainingCount = await prisma.notificationLog.count();
  console.log(`\nLogs restantes en la base de datos: ${remainingCount}`);
}

// Parsear argumentos de línea de comandos
function parseArgs(): CleanupOptions {
  const args = process.argv.slice(2);
  
  let retentionDays = parseInt(process.env.NOTIFICATION_LOG_RETENTION_DAYS || '90');
  let dryRun = true;
  let keepFailed = true;

  args.forEach((arg) => {
    if (arg.startsWith('--days=')) {
      retentionDays = parseInt(arg.split('=')[1]);
    } else if (arg === '--execute') {
      dryRun = false;
    } else if (arg === '--delete-all') {
      keepFailed = false;
    }
  });

  return { retentionDays, dryRun, keepFailed };
}

// Ejecutar script
async function main() {
  try {
    const options = parseArgs();
    await cleanupNotificationLogs(options);
  } catch (error: any) {
    console.error('\n❌ Error al limpiar logs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Solo ejecutar si es el script principal
if (require.main === module) {
  main();
}

export { cleanupNotificationLogs };
