#!/usr/bin/env tsx
/**
 * Script de Testing para Integración de Chatwoot
 * 
 * Este script valida que la integración de Chatwoot esté funcionando correctamente
 * en todos sus componentes: servicios, API, notificaciones y webhook.
 * 
 * Uso:
 *   npx tsx scripts/test-chatwoot-integration.ts
 * 
 * Variables de entorno requeridas:
 *   - CHATWOOT_API_URL
 *   - CHATWOOT_API_ACCESS_TOKEN
 *   - CHATWOOT_ACCOUNT_ID
 *   - CHATWOOT_INBOX_ID
 *   - TEST_TENANT_ID (opcional, usa tenant de prueba)
 *   - TEST_PHONE_NUMBER (opcional, usa número de prueba)
 */

import { chatwootService } from '../lib/notifications/chatwootService';
import { chatwootApiService } from '../lib/chatwoot/api';
import { chatwootClientMatcher } from '../lib/chatwoot/client-matcher';
import { notificationManager } from '../lib/notifications/notificationManager';
import { NotificationType, NotificationChannel } from '@prisma/client';
import { prisma } from '../lib/prisma';

// Configuración de prueba
const TEST_TENANT_ID = process.env.TEST_TENANT_ID || 'test-tenant-123';
const TEST_PHONE = process.env.TEST_PHONE_NUMBER || '+523331234567';
const TEST_CLIENT_NAME = 'Usuario de Prueba CitaPlanner';

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

// Utilidades de logging
function logSuccess(message: string) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message: string) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logWarning(message: string) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logInfo(message: string) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log(`\n${colors.blue}${'='.repeat(60)}`);
  console.log(`${title}`);
  console.log(`${'='.repeat(60)}${colors.reset}\n`);
}

function logSubSection(title: string) {
  console.log(`\n${colors.gray}${title}${colors.reset}`);
}

// Tests
class ChatwootIntegrationTester {
  private testResults: {
    test: string;
    passed: boolean;
    error?: string;
    duration?: number;
  }[] = [];

  /**
   * Ejecuta todos los tests
   */
  async runAllTests() {
    console.log(`\n${colors.blue}╔══════════════════════════════════════════════════════╗`);
    console.log(`║    🧪 Test de Integración de Chatwoot en CitaPlanner   ║`);
    console.log(`╚══════════════════════════════════════════════════════╝${colors.reset}\n`);

    // Validar configuración
    await this.validateConfiguration();

    // Tests de servicios
    await this.testChatwootService();
    await this.testChatwootApiService();
    await this.testClientMatcher();
    await this.testNotificationManager();

    // Tests de integración
    await this.testEndToEndFlow();

    // Resumen final
    this.printSummary();
  }

  /**
   * Valida que todas las variables de entorno estén configuradas
   */
  async validateConfiguration() {
    logSection('📋 VALIDACIÓN DE CONFIGURACIÓN');

    const requiredEnvVars = [
      'CHATWOOT_API_URL',
      'CHATWOOT_API_ACCESS_TOKEN',
      'CHATWOOT_ACCOUNT_ID',
      'CHATWOOT_INBOX_ID',
    ];

    let allConfigured = true;

    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar];
      if (value) {
        logSuccess(`${envVar}: Configurado`);
      } else {
        logError(`${envVar}: NO configurado`);
        allConfigured = false;
      }
    }

    if (!allConfigured) {
      logError('Configuración incompleta. Abortando tests.');
      process.exit(1);
    }

    logInfo(`Tenant de prueba: ${TEST_TENANT_ID}`);
    logInfo(`Número de prueba: ${TEST_PHONE}`);
  }

  /**
   * Tests del ChatwootService
   */
  async testChatwootService() {
    logSection('🔧 TESTS DE CHATWOOT SERVICE');

    // Test 1: Conexión
    await this.runTest('Test de Conexión', async () => {
      const isConnected = await chatwootService.testConnection(TEST_TENANT_ID);
      if (!isConnected) {
        throw new Error('No se pudo conectar con Chatwoot');
      }
    });

    // Test 2: Envío simple
    await this.runTest('Envío de Mensaje Simple', async () => {
      const result = await chatwootService.sendChatwoot({
        to: TEST_PHONE,
        message: '🧪 Test de envío simple desde CitaPlanner',
        tenantId: TEST_TENANT_ID,
        clientName: TEST_CLIENT_NAME,
      });

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }

      logInfo(`   Message ID: ${result.messageId}`);
    });

    // Test 3: Confirmación de cita
    await this.runTest('Confirmación de Cita', async () => {
      const result = await chatwootService.sendAppointmentConfirmation({
        to: TEST_PHONE,
        tenantId: TEST_TENANT_ID,
        clientName: TEST_CLIENT_NAME,
        appointmentDate: '15 de Noviembre, 2025',
        appointmentTime: '10:00 AM',
        serviceName: 'Servicio de Prueba',
        professionalName: 'Profesional de Prueba',
        branchName: 'Sucursal de Prueba',
      });

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }
    });

    // Test 4: Recordatorio
    await this.runTest('Recordatorio de Cita', async () => {
      const result = await chatwootService.sendAppointmentReminder({
        to: TEST_PHONE,
        tenantId: TEST_TENANT_ID,
        clientName: TEST_CLIENT_NAME,
        appointmentDate: 'mañana',
        appointmentTime: '2:00 PM',
        serviceName: 'Servicio de Prueba',
      });

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }
    });

    // Test 5: Cancelación
    await this.runTest('Cancelación de Cita', async () => {
      const result = await chatwootService.sendAppointmentCancellation({
        to: TEST_PHONE,
        tenantId: TEST_TENANT_ID,
        clientName: TEST_CLIENT_NAME,
        appointmentDate: '20 de Noviembre, 2025',
        appointmentTime: '3:00 PM',
        reason: 'Motivo de prueba',
      });

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }
    });

    // Test 6: Mensaje de marketing
    await this.runTest('Mensaje de Marketing', async () => {
      const result = await chatwootService.sendMarketingMessage({
        to: TEST_PHONE,
        tenantId: TEST_TENANT_ID,
        clientName: TEST_CLIENT_NAME,
        campaignMessage: '🎉 Oferta especial de prueba - 25% de descuento',
      });

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }
    });

    // Test 7: Solicitud de feedback
    await this.runTest('Solicitud de Feedback', async () => {
      const result = await chatwootService.sendFeedbackRequest({
        to: TEST_PHONE,
        tenantId: TEST_TENANT_ID,
        clientName: TEST_CLIENT_NAME,
        serviceName: 'Servicio de Prueba',
        feedbackUrl: 'https://citaplanner.com/feedback/test',
      });

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }
    });
  }

  /**
   * Tests del ChatwootApiService
   */
  async testChatwootApiService() {
    logSection('🔌 TESTS DE CHATWOOT API SERVICE');

    // Test 1: Cargar configuración
    await this.runTest('Cargar Configuración del Tenant', async () => {
      const configured = await chatwootApiService.loadConfigForTenant(TEST_TENANT_ID);
      if (!configured) {
        throw new Error('No se pudo cargar la configuración');
      }
    });

    // Test 2: Test de conexión
    await this.runTest('Test de Conexión API', async () => {
      const isConnected = await chatwootApiService.testConnection();
      if (!isConnected) {
        throw new Error('Conexión fallida');
      }
    });

    // Test 3: Buscar contacto
    let testContact: any = null;
    await this.runTest('Buscar Contacto por Teléfono', async () => {
      testContact = await chatwootApiService.findContactByPhone(TEST_PHONE);
      logInfo(`   Contacto ${testContact ? 'encontrado' : 'no encontrado'}`);
      if (testContact) {
        logInfo(`   Contact ID: ${testContact.id}`);
      }
    });

    // Test 4: Buscar o crear contacto
    await this.runTest('Buscar o Crear Contacto', async () => {
      const contact = await chatwootApiService.findOrCreateContact({
        name: TEST_CLIENT_NAME,
        phone_number: TEST_PHONE,
        identifier: 'test-client-123',
      });

      if (!contact) {
        throw new Error('No se pudo buscar/crear contacto');
      }

      logInfo(`   Contact ID: ${contact.id}`);
    });

    // Test 5: Enviar mensaje completo
    await this.runTest('Envío de Mensaje Completo (Flujo API)', async () => {
      const result = await chatwootApiService.sendMessageToContact({
        to: TEST_PHONE,
        message: '🧪 Test de envío vía API completa',
        tenantId: TEST_TENANT_ID,
      });

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }

      logInfo(`   Message ID: ${result.messageId}`);
    });
  }

  /**
   * Tests del ClientMatcher
   */
  async testClientMatcher() {
    logSection('🔍 TESTS DE CLIENT MATCHER');

    // Test 1: Normalización de teléfonos
    await this.runTest('Normalización de Números de Teléfono', async () => {
      const matcher = chatwootClientMatcher;
      
      const tests = [
        { input: '3331234567', expected: '+523331234567' },
        { input: '+52 333 123 4567', expected: '+523331234567' },
        { input: '(333) 123-4567', expected: '+523331234567' },
      ];

      for (const test of tests) {
        const normalized = matcher.normalizePhoneNumber(test.input);
        if (normalized !== test.expected) {
          throw new Error(
            `Normalización fallida: ${test.input} → ${normalized} (esperado: ${test.expected})`
          );
        }
      }

      logInfo(`   ${tests.length} normalizaciones exitosas`);
    });

    // Test 2: Buscar cliente (si existe en DB de prueba)
    await this.runTest('Buscar Cliente por Teléfono', async () => {
      const client = await chatwootClientMatcher.findClientByPhone(
        TEST_PHONE,
        TEST_TENANT_ID
      );

      if (client) {
        logInfo(`   Cliente encontrado: ${client.firstName} ${client.lastName}`);
      } else {
        logWarning('   Cliente no encontrado en DB (esto es normal en pruebas)');
      }
    });
  }

  /**
   * Tests del NotificationManager
   */
  async testNotificationManager() {
    logSection('📬 TESTS DE NOTIFICATION MANAGER');

    // Test 1: Test de todos los canales
    await this.runTest('Test de Todos los Canales', async () => {
      const status = await notificationManager.testAllChannels(TEST_TENANT_ID);
      
      logInfo(`   Email: ${status.email ? '✅' : '❌'}`);
      logInfo(`   SMS: ${status.sms ? '✅' : '❌'}`);
      logInfo(`   WhatsApp: ${status.whatsapp ? '✅' : '❌'}`);
      logInfo(`   Chatwoot: ${status.chatwoot ? '✅' : '❌'}`);

      if (!status.chatwoot) {
        throw new Error('Chatwoot no está disponible');
      }
    });

    // Test 2: Envío por NotificationManager
    await this.runTest('Envío vía NotificationManager', async () => {
      const result = await notificationManager.sendNotification({
        type: NotificationType.APPOINTMENT_REMINDER,
        channel: NotificationChannel.CHATWOOT,
        recipient: TEST_PHONE,
        message: '🧪 Test vía NotificationManager',
        tenantId: TEST_TENANT_ID,
        recipientName: TEST_CLIENT_NAME,
      });

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }

      logInfo(`   Log ID: ${result.logId}`);
    });
  }

  /**
   * Test de flujo end-to-end
   */
  async testEndToEndFlow() {
    logSection('🚀 TEST DE FLUJO END-TO-END');

    await this.runTest('Flujo Completo de Notificación', async () => {
      logSubSection('1. Configuración del servicio');
      const configured = await chatwootApiService.loadConfigForTenant(TEST_TENANT_ID);
      if (!configured) {
        throw new Error('Configuración falló');
      }

      logSubSection('2. Buscar o crear contacto');
      const contact = await chatwootApiService.findOrCreateContact({
        name: TEST_CLIENT_NAME,
        phone_number: TEST_PHONE,
        identifier: 'test-e2e-client',
      });

      if (!contact) {
        throw new Error('No se pudo obtener contacto');
      }

      logSubSection('3. Enviar notificación');
      const result = await notificationManager.sendNotification({
        type: NotificationType.APPOINTMENT_CONFIRMATION,
        channel: NotificationChannel.CHATWOOT,
        recipient: TEST_PHONE,
        message: `🎉 Flujo E2E completado exitosamente\nTimestamp: ${new Date().toISOString()}`,
        tenantId: TEST_TENANT_ID,
        recipientName: TEST_CLIENT_NAME,
      });

      if (!result.success) {
        throw new Error(result.error || 'Envío falló');
      }

      logSubSection('4. Verificar log en base de datos');
      const log = await prisma.notificationLog.findUnique({
        where: { id: result.logId },
      });

      if (!log) {
        throw new Error('Log no encontrado en BD');
      }

      if (log.status !== 'SENT') {
        throw new Error(`Estado inesperado: ${log.status}`);
      }

      logInfo(`   ✅ Flujo completo exitoso`);
      logInfo(`   Contact ID: ${contact.id}`);
      logInfo(`   Log ID: ${result.logId}`);
      logInfo(`   Status: ${log.status}`);
    });
  }

  /**
   * Ejecuta un test individual
   */
  private async runTest(testName: string, testFn: () => Promise<void>) {
    const startTime = Date.now();
    process.stdout.write(`${colors.gray}⏳ ${testName}...${colors.reset}`);

    try {
      await testFn();
      const duration = Date.now() - startTime;
      process.stdout.write(`\r${colors.green}✅ ${testName}${colors.reset} ${colors.gray}(${duration}ms)${colors.reset}\n`);
      
      this.testResults.push({
        test: testName,
        passed: true,
        duration,
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      process.stdout.write(`\r${colors.red}❌ ${testName}${colors.reset}\n`);
      console.log(`   ${colors.red}Error: ${error.message}${colors.reset}`);
      
      this.testResults.push({
        test: testName,
        passed: false,
        error: error.message,
        duration,
      });
    }

    // Pequeño delay entre tests para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Imprime resumen de todos los tests
   */
  private printSummary() {
    logSection('📊 RESUMEN DE TESTS');

    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => !r.passed).length;
    const total = this.testResults.length;
    const totalDuration = this.testResults.reduce((sum, r) => sum + (r.duration || 0), 0);

    console.log(`Total de tests: ${total}`);
    console.log(`${colors.green}Exitosos: ${passed}${colors.reset}`);
    console.log(`${colors.red}Fallidos: ${failed}${colors.reset}`);
    console.log(`Duración total: ${totalDuration}ms\n`);

    if (failed > 0) {
      console.log(`${colors.red}Tests fallidos:${colors.reset}`);
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  - ${r.test}: ${r.error}`);
        });
      console.log('');
    }

    const successRate = (passed / total) * 100;
    
    if (successRate === 100) {
      console.log(`${colors.green}╔════════════════════════════════════════╗`);
      console.log(`║  ✅ TODOS LOS TESTS PASARON! 🎉         ║`);
      console.log(`╚════════════════════════════════════════╝${colors.reset}\n`);
    } else if (successRate >= 80) {
      console.log(`${colors.yellow}⚠️  La mayoría de los tests pasaron (${successRate.toFixed(1)}%)${colors.reset}\n`);
    } else {
      console.log(`${colors.red}❌ Muchos tests fallaron (${successRate.toFixed(1)}%)${colors.reset}\n`);
    }

    process.exit(failed > 0 ? 1 : 0);
  }
}

// Ejecutar tests
async function main() {
  const tester = new ChatwootIntegrationTester();
  await tester.runAllTests();
}

// Manejar errores no capturados
process.on('unhandledRejection', (error: any) => {
  console.error(`\n${colors.red}Error no manejado: ${error.message}${colors.reset}\n`);
  process.exit(1);
});

// Ejecutar
main();
