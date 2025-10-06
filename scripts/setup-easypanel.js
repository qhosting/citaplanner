
#!/usr/bin/env node

/**
 * Script de Automatización de Easypanel para CitaPlanner
 * 
 * Este script automatiza completamente el despliegue en Easypanel:
 * 1. Crea un servicio PostgreSQL
 * 2. Obtiene las credenciales de la base de datos
 * 3. Genera el archivo .env con todas las variables necesarias
 * 4. Configura las variables de entorno en Easypanel
 * 
 * Uso:
 *   node scripts/setup-easypanel.js [opciones]
 * 
 * Opciones:
 *   --dry-run          Simula la ejecución sin hacer cambios reales
 *   --skip-postgres    Omite la creación de PostgreSQL (usa BD existente)
 *   --project-name     Nombre del proyecto en Easypanel (default: CitaPlanner)
 *   --service-name     Nombre del servicio de la app (default: citaplanner-app)
 *   --db-service-name  Nombre del servicio de PostgreSQL (default: citaplanner-db)
 * 
 * Variables de entorno requeridas:
 *   EASYPANEL_URL      URL del servidor Easypanel (ej: https://adm.whatscloud.site)
 *   EASYPANEL_TOKEN    Token de API de Easypanel
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuración
const CONFIG = {
  easypanelUrl: process.env.EASYPANEL_URL || 'https://adm.whatscloud.site',
  easypanelToken: process.env.EASYPANEL_TOKEN || '',
  projectName: 'CitaPlanner',
  appServiceName: 'citaplanner-app',
  dbServiceName: 'citaplanner-db',
  dryRun: false,
  skipPostgres: false,
};

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Funciones de logging
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.cyan);
}

function logStep(step, total, message) {
  log(`\n[${step}/${total}] ${message}`, colors.bright + colors.blue);
}

// Función para hacer peticiones HTTP/HTTPS
function makeRequest(url, options, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const lib = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': CONFIG.easypanelToken,
        ...options.headers,
      },
    };

    if (body) {
      const bodyString = JSON.stringify(body);
      requestOptions.headers['Content-Length'] = Buffer.byteLength(bodyString);
    }

    const req = lib.request(requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ statusCode: res.statusCode, data: parsedData });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsedData)}`));
          }
        } catch (error) {
          reject(new Error(`Error parsing response: ${error.message}\nData: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Función para hacer peticiones a la API de Easypanel (tRPC)
async function easypanelRequest(endpoint, body = null, method = 'POST') {
  const url = `${CONFIG.easypanelUrl}${endpoint}`;
  
  if (CONFIG.dryRun) {
    logInfo(`[DRY RUN] ${method} ${endpoint}`);
    logInfo(`[DRY RUN] Body: ${JSON.stringify(body, null, 2)}`);
    return { result: { data: { json: {} } } };
  }

  try {
    const options = { method };
    
    if (method === 'GET' && body) {
      // Para GET, los parámetros van en la query string
      const params = new URLSearchParams({ input: JSON.stringify({ json: body }) });
      const response = await makeRequest(`${url}?${params}`, options);
      return response.data;
    } else if (method === 'POST') {
      // Para POST, el body va en el cuerpo de la petición
      const response = await makeRequest(url, options, { json: body });
      return response.data;
    }
  } catch (error) {
    logError(`Error en petición a ${endpoint}: ${error.message}`);
    throw error;
  }
}

// Paso 1: Verificar conexión con Easypanel
async function verifyConnection() {
  logStep(1, 7, 'Verificando conexión con Easypanel...');
  
  if (!CONFIG.easypanelToken) {
    throw new Error('EASYPANEL_TOKEN no está configurado. Por favor, configura la variable de entorno.');
  }

  try {
    const response = await easypanelRequest('/api/trpc/auth.getUser', null, 'GET');
    logSuccess(`Conectado como: ${response.result?.data?.json?.username || 'Usuario'}`);
    return true;
  } catch (error) {
    throw new Error(`No se pudo conectar a Easypanel: ${error.message}`);
  }
}

// Paso 2: Verificar o crear proyecto
async function ensureProject() {
  logStep(2, 7, `Verificando proyecto "${CONFIG.projectName}"...`);

  try {
    // Listar proyectos existentes
    const response = await easypanelRequest('/api/trpc/projects.listProjects', null, 'GET');
    const projects = response.result?.data?.json || [];
    
    const projectExists = projects.some(p => p.name === CONFIG.projectName);

    if (projectExists) {
      logSuccess(`Proyecto "${CONFIG.projectName}" ya existe`);
      return true;
    }

    // Crear proyecto
    logInfo(`Creando proyecto "${CONFIG.projectName}"...`);
    await easypanelRequest('/api/trpc/projects.createProject', {
      name: CONFIG.projectName,
    });
    
    logSuccess(`Proyecto "${CONFIG.projectName}" creado exitosamente`);
    return true;
  } catch (error) {
    throw new Error(`Error al gestionar proyecto: ${error.message}`);
  }
}

// Paso 3: Crear servicio PostgreSQL
async function createPostgresService() {
  if (CONFIG.skipPostgres) {
    logStep(3, 7, 'Omitiendo creación de PostgreSQL (--skip-postgres)');
    return null;
  }

  logStep(3, 7, `Creando servicio PostgreSQL "${CONFIG.dbServiceName}"...`);

  // Generar credenciales seguras
  const dbPassword = crypto.randomBytes(32).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  const dbUser = 'citaplanner';
  const dbName = 'citaplanner';

  try {
    // Verificar si el servicio ya existe
    try {
      const inspectResponse = await easypanelRequest('/api/trpc/services.postgres.inspectService', {
        projectName: CONFIG.projectName,
        serviceName: CONFIG.dbServiceName,
      }, 'GET');

      if (inspectResponse.result?.data?.json) {
        logWarning(`Servicio PostgreSQL "${CONFIG.dbServiceName}" ya existe`);
        
        // Intentar obtener las credenciales existentes
        const existingService = inspectResponse.result.data.json;
        return {
          host: `${CONFIG.dbServiceName}`,
          port: 5432,
          database: dbName,
          user: dbUser,
          password: existingService.password || dbPassword,
        };
      }
    } catch (error) {
      // El servicio no existe, continuar con la creación
    }

    // Crear servicio PostgreSQL
    logInfo('Creando nuevo servicio PostgreSQL...');
    await easypanelRequest('/api/trpc/services.postgres.createService', {
      projectName: CONFIG.projectName,
      serviceName: CONFIG.dbServiceName,
      password: dbPassword,
      image: 'postgres:16-alpine',
      domains: [{
        host: '$(EASYPANEL_DOMAIN)',
      }],
    });

    logSuccess('Servicio PostgreSQL creado exitosamente');

    // Esperar un momento para que el servicio se inicialice
    logInfo('Esperando inicialización del servicio...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Configurar variables de entorno del PostgreSQL
    await easypanelRequest('/api/trpc/services.postgres.updateEnv', {
      projectName: CONFIG.projectName,
      serviceName: CONFIG.dbServiceName,
      env: `POSTGRES_USER=${dbUser}\nPOSTGRES_PASSWORD=${dbPassword}\nPOSTGRES_DB=${dbName}`,
    });

    logSuccess('Variables de entorno de PostgreSQL configuradas');

    // Desplegar el servicio
    logInfo('Desplegando servicio PostgreSQL...');
    await easypanelRequest('/api/trpc/services.postgres.deployService', {
      projectName: CONFIG.projectName,
      serviceName: CONFIG.dbServiceName,
    });

    logSuccess('Servicio PostgreSQL desplegado');

    return {
      host: `${CONFIG.dbServiceName}`,
      port: 5432,
      database: dbName,
      user: dbUser,
      password: dbPassword,
    };
  } catch (error) {
    throw new Error(`Error al crear servicio PostgreSQL: ${error.message}`);
  }
}

// Paso 4: Generar archivo .env
async function generateEnvFile(dbCredentials) {
  logStep(4, 7, 'Generando archivo .env...');

  if (!dbCredentials) {
    logWarning('No hay credenciales de BD, usando valores de ejemplo');
    dbCredentials = {
      host: 'citaplanner-db',
      port: 5432,
      database: 'citaplanner',
      user: 'citaplanner',
      password: 'CHANGE_THIS_PASSWORD',
    };
  }

  // Generar secrets seguros
  const nextAuthSecret = crypto.randomBytes(32).toString('base64');
  const masterPasswordHash = '$2b$10$P/AV363LeWhZGK0kkrON3eGmAlkmiTHKuzZzDKCAppFV.0Gzf0ZaO'; // Hash de x0420EZS2025*

  const envContent = `# Configuración de Base de Datos
DATABASE_URL="postgresql://${dbCredentials.user}:${dbCredentials.password}@${dbCredentials.host}:${dbCredentials.port}/${dbCredentials.database}?schema=public"

# Configuración de NextAuth
NEXTAUTH_URL="https://citaplanner.com"
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

  const envPath = path.join(process.cwd(), '.env');
  
  if (CONFIG.dryRun) {
    logInfo('[DRY RUN] Contenido del archivo .env:');
    console.log(envContent);
  } else {
    fs.writeFileSync(envPath, envContent);
    logSuccess(`Archivo .env generado en: ${envPath}`);
  }

  return envContent;
}

// Paso 5: Configurar variables de entorno en Easypanel
async function configureAppEnvironment(envContent) {
  logStep(5, 7, 'Configurando variables de entorno en Easypanel...');

  try {
    // Verificar si el servicio de la app existe
    let appExists = false;
    try {
      const inspectResponse = await easypanelRequest('/api/trpc/services.app.inspectService', {
        projectName: CONFIG.projectName,
        serviceName: CONFIG.appServiceName,
      }, 'GET');

      if (inspectResponse.result?.data?.json) {
        appExists = true;
      }
    } catch (error) {
      // El servicio no existe
    }

    if (!appExists) {
      logWarning(`Servicio de aplicación "${CONFIG.appServiceName}" no existe todavía`);
      logInfo('Las variables de entorno se configurarán cuando se cree el servicio');
      return;
    }

    // Actualizar variables de entorno
    await easypanelRequest('/api/trpc/services.app.updateEnv', {
      projectName: CONFIG.projectName,
      serviceName: CONFIG.appServiceName,
      env: envContent,
    });

    logSuccess('Variables de entorno configuradas en Easypanel');

    // Redesplegar la aplicación
    logInfo('Redesplegando aplicación...');
    await easypanelRequest('/api/trpc/services.app.deployService', {
      projectName: CONFIG.projectName,
      serviceName: CONFIG.appServiceName,
    });

    logSuccess('Aplicación redesplegada con nuevas variables');
  } catch (error) {
    logWarning(`No se pudieron configurar las variables en Easypanel: ${error.message}`);
    logInfo('Puedes configurarlas manualmente desde el panel de Easypanel');
  }
}

// Paso 6: Validar configuración
async function validateConfiguration() {
  logStep(6, 7, 'Validando configuración...');

  const checks = [];

  // Verificar archivo .env
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    checks.push({ name: 'Archivo .env', status: true });
  } else {
    checks.push({ name: 'Archivo .env', status: false });
  }

  // Verificar proyecto en Easypanel
  try {
    const response = await easypanelRequest('/api/trpc/projects.listProjects', null, 'GET');
    const projects = response.result?.data?.json || [];
    const projectExists = projects.some(p => p.name === CONFIG.projectName);
    checks.push({ name: 'Proyecto en Easypanel', status: projectExists });
  } catch (error) {
    checks.push({ name: 'Proyecto en Easypanel', status: false });
  }

  // Mostrar resultados
  console.log('\n' + '='.repeat(50));
  log('Resultados de la validación:', colors.bright);
  console.log('='.repeat(50));
  
  checks.forEach(check => {
    if (check.status) {
      logSuccess(check.name);
    } else {
      logError(check.name);
    }
  });

  const allPassed = checks.every(c => c.status);
  
  console.log('='.repeat(50) + '\n');

  return allPassed;
}

// Paso 7: Mostrar resumen
function showSummary(dbCredentials, envContent) {
  logStep(7, 7, 'Resumen de la configuración');

  console.log('\n' + '='.repeat(70));
  log('CONFIGURACIÓN COMPLETADA', colors.bright + colors.green);
  console.log('='.repeat(70));

  if (dbCredentials) {
    console.log('\n📊 Credenciales de PostgreSQL:');
    console.log(`   Host:     ${dbCredentials.host}`);
    console.log(`   Puerto:   ${dbCredentials.port}`);
    console.log(`   Base de datos: ${dbCredentials.database}`);
    console.log(`   Usuario:  ${dbCredentials.user}`);
    console.log(`   Password: ${dbCredentials.password}`);
  }

  console.log('\n📝 Próximos pasos:');
  console.log('   1. Revisa el archivo .env generado');
  console.log('   2. Configura el servicio de la aplicación en Easypanel');
  console.log('   3. Conecta el repositorio de GitHub');
  console.log('   4. Configura las variables de entorno en Easypanel');
  console.log('   5. Despliega la aplicación');

  console.log('\n📚 Documentación:');
  console.log('   - Ver docs/easypanel_automation.md para más detalles');
  console.log('   - Configuración de Easypanel: ' + CONFIG.easypanelUrl);

  console.log('\n⚠️  Importante:');
  console.log('   - Guarda las credenciales de la base de datos en un lugar seguro');
  console.log('   - No compartas el archivo .env en el repositorio');
  console.log('   - Configura las variables de email y SMS cuando estés listo');

  console.log('\n' + '='.repeat(70) + '\n');
}

// Función principal
async function main() {
  // Parsear argumentos
  const args = process.argv.slice(2);
  args.forEach(arg => {
    if (arg === '--dry-run') CONFIG.dryRun = true;
    if (arg === '--skip-postgres') CONFIG.skipPostgres = true;
    if (arg.startsWith('--project-name=')) CONFIG.projectName = arg.split('=')[1];
    if (arg.startsWith('--service-name=')) CONFIG.appServiceName = arg.split('=')[1];
    if (arg.startsWith('--db-service-name=')) CONFIG.dbServiceName = arg.split('=')[1];
  });

  console.log('\n' + '='.repeat(70));
  log('AUTOMATIZACIÓN DE EASYPANEL PARA CITAPLANNER', colors.bright + colors.cyan);
  console.log('='.repeat(70) + '\n');

  if (CONFIG.dryRun) {
    logWarning('MODO DRY RUN - No se harán cambios reales');
  }

  try {
    // Ejecutar pasos
    await verifyConnection();
    await ensureProject();
    const dbCredentials = await createPostgresService();
    const envContent = await generateEnvFile(dbCredentials);
    await configureAppEnvironment(envContent);
    await validateConfiguration();
    showSummary(dbCredentials, envContent);

    logSuccess('\n¡Automatización completada exitosamente!');
    process.exit(0);
  } catch (error) {
    logError(`\n❌ Error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar
if (require.main === module) {
  main();
}

module.exports = { main };
