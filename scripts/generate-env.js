
#!/usr/bin/env node

/**
 * Generador de archivo .env para CitaPlanner
 * 
 * Este script genera un archivo .env con valores seguros y aleatorios
 * para todas las variables necesarias.
 * 
 * Uso:
 *   node scripts/generate-env.js [opciones]
 * 
 * Opciones:
 *   --output <path>    Ruta del archivo de salida (default: .env)
 *   --db-host <host>   Host de la base de datos (default: citaplanner-db)
 *   --db-port <port>   Puerto de la base de datos (default: 5432)
 *   --db-name <name>   Nombre de la base de datos (default: citaplanner)
 *   --db-user <user>   Usuario de la base de datos (default: citaplanner)
 *   --db-pass <pass>   Password de la base de datos (generado si no se proporciona)
 *   --app-url <url>    URL de la aplicación (default: https://citaplanner.com)
 *   --master-pass <p>  Password maestra (se generará el hash)
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Configuración por defecto
const config = {
  output: '.env',
  dbHost: 'citaplanner-db',
  dbPort: '5432',
  dbName: 'citaplanner',
  dbUser: 'citaplanner',
  dbPass: null,
  appUrl: 'https://citaplanner.com',
  masterPass: null,
};

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Generar string aleatorio seguro
function generateSecureString(length = 32) {
  return crypto.randomBytes(length).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, length);
}

// Generar hash bcrypt
async function generateBcryptHash(password) {
  return await bcrypt.hash(password, 10);
}

// Parsear argumentos
function parseArgs() {
  const args = process.argv.slice(2);
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];
    
    switch (arg) {
      case '--output':
        config.output = nextArg;
        i++;
        break;
      case '--db-host':
        config.dbHost = nextArg;
        i++;
        break;
      case '--db-port':
        config.dbPort = nextArg;
        i++;
        break;
      case '--db-name':
        config.dbName = nextArg;
        i++;
        break;
      case '--db-user':
        config.dbUser = nextArg;
        i++;
        break;
      case '--db-pass':
        config.dbPass = nextArg;
        i++;
        break;
      case '--app-url':
        config.appUrl = nextArg;
        i++;
        break;
      case '--master-pass':
        config.masterPass = nextArg;
        i++;
        break;
    }
  }
}

// Generar archivo .env
async function generateEnvFile() {
  log('\n🔧 Generando archivo .env...', colors.cyan);
  
  // Generar valores si no se proporcionaron
  const dbPassword = config.dbPass || generateSecureString(32);
  const nextAuthSecret = generateSecureString(32);
  const masterPassword = config.masterPass || generateSecureString(16);
  const masterPasswordHash = await generateBcryptHash(masterPassword);
  
  // Construir DATABASE_URL
  const databaseUrl = `postgresql://${config.dbUser}:${dbPassword}@${config.dbHost}:${config.dbPort}/${config.dbName}?schema=public`;
  
  // Contenido del archivo .env
  const envContent = `# Configuración de Base de Datos
DATABASE_URL="${databaseUrl}"

# Configuración de NextAuth
NEXTAUTH_URL="${config.appUrl}"
NEXTAUTH_SECRET="${nextAuthSecret}"

# Configuración del Panel Master Admin
MASTER_PASSWORD_HASH="${masterPasswordHash}"

# Configuración de la Aplicación
NODE_ENV="production"
PORT="3000"

# Configuración de Email (Opcional - configurar después)
# EMAIL_SERVER_HOST=""
# EMAIL_SERVER_PORT=""
# EMAIL_SERVER_USER=""
# EMAIL_SERVER_PASSWORD=""
# EMAIL_FROM=""

# Configuración de SMS (Opcional - configurar después)
# TWILIO_ACCOUNT_SID=""
# TWILIO_AUTH_TOKEN=""
# TWILIO_PHONE_NUMBER=""
`;

  // Escribir archivo
  const outputPath = path.resolve(config.output);
  fs.writeFileSync(outputPath, envContent);
  
  log(`✓ Archivo .env generado en: ${outputPath}`, colors.green);
  
  // Mostrar información importante
  console.log('\n' + '='.repeat(70));
  log('CREDENCIALES GENERADAS', colors.cyan);
  console.log('='.repeat(70));
  
  console.log('\n📊 Base de Datos:');
  console.log(`   Host:     ${config.dbHost}`);
  console.log(`   Puerto:   ${config.dbPort}`);
  console.log(`   Database: ${config.dbName}`);
  console.log(`   Usuario:  ${config.dbUser}`);
  console.log(`   Password: ${dbPassword}`);
  
  console.log('\n🔐 Master Admin:');
  console.log(`   Password: ${masterPassword}`);
  console.log(`   Hash:     ${masterPasswordHash}`);
  
  console.log('\n🔑 NextAuth:');
  console.log(`   Secret:   ${nextAuthSecret}`);
  
  console.log('\n⚠️  IMPORTANTE:');
  console.log('   - Guarda estas credenciales en un lugar seguro');
  console.log('   - NO compartas el archivo .env en el repositorio');
  console.log('   - Configura las variables opcionales cuando estés listo');
  
  console.log('\n' + '='.repeat(70) + '\n');
}

// Función principal
async function main() {
  parseArgs();
  await generateEnvFile();
}

// Ejecutar
if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = { generateEnvFile };
