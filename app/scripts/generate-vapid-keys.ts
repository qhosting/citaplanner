
/**
 * Script para generar claves VAPID para Web Push Notifications
 * 
 * Uso:
 * npx ts-node scripts/generate-vapid-keys.ts
 * 
 * Las claves generadas deben agregarse al archivo .env:
 * NEXT_PUBLIC_VAPID_PUBLIC_KEY=<clave_publica>
 * VAPID_PRIVATE_KEY=<clave_privada>
 * VAPID_SUBJECT=mailto:admin@citaplanner.com
 */

import webPush from 'web-push';

function generateVapidKeys() {
  console.log('🔑 Generando claves VAPID para Web Push Notifications...\n');

  const vapidKeys = webPush.generateVAPIDKeys();

  console.log('✅ Claves VAPID generadas exitosamente!\n');
  console.log('📋 Copia estas claves a tu archivo .env:\n');
  console.log('─'.repeat(80));
  console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
  console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
  console.log(`VAPID_SUBJECT=mailto:admin@citaplanner.com`);
  console.log('─'.repeat(80));
  console.log('\n⚠️  IMPORTANTE:');
  console.log('   - La clave pública (NEXT_PUBLIC_*) es accesible desde el cliente');
  console.log('   - La clave privada debe mantenerse SECRETA');
  console.log('   - VAPID_SUBJECT debe ser un mailto: o la URL de tu sitio');
  console.log('   - Estas claves son únicas para tu aplicación');
  console.log('   - NO las compartas públicamente ni las subas a Git\n');
}

generateVapidKeys();
