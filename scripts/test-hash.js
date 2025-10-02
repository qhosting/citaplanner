/**
 * Script de prueba local para verificar el hash de bcrypt
 * 
 * Uso:
 * 1. Configurar MASTER_PASSWORD_HASH en .env o como variable de entorno
 * 2. Ejecutar: node scripts/test-hash.js
 * 
 * Este script prueba:
 * - Si el hash está configurado correctamente
 * - Si el password 'x0420EZS$$$$$' coincide con el hash
 * - Si hay problemas con caracteres especiales
 */

const bcrypt = require('bcryptjs')

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`)
}

async function testHash() {
  log(colors.cyan, '\n=== Test de Hash de Master Password ===\n')

  // El hash que configuraste en Easypanel
  const configuredHash = process.env.MASTER_PASSWORD_HASH || '$2b$10$HR7Cx57ULUAEkjRlk7wYQOLJn1pzRcn0ese632RKujWq0GFqySnRC'
  
  // El password que estás intentando usar
  const testPassword = 'x0420EZS$$$$$'

  log(colors.blue, '1. Información del Hash:')
  console.log('   - Hash configurado:', !!configuredHash)
  console.log('   - Longitud del hash:', configuredHash.length)
  console.log('   - Prefijo:', configuredHash.substring(0, 7))
  console.log('   - Sufijo:', configuredHash.substring(configuredHash.length - 4))
  console.log('   - Hash completo:', configuredHash)

  log(colors.blue, '\n2. Información del Password:')
  console.log('   - Password a probar:', testPassword)
  console.log('   - Longitud:', testPassword.length)
  console.log('   - Contiene $ especiales:', testPassword.includes('$'))
  console.log('   - Cantidad de $:', (testPassword.match(/\$/g) || []).length)

  log(colors.blue, '\n3. Validación del formato del hash:')
  const validFormats = ['$2a$', '$2b$', '$2y$']
  const hasValidFormat = validFormats.some(format => configuredHash.startsWith(format))
  
  if (hasValidFormat) {
    log(colors.green, '   ✓ El hash tiene un formato bcrypt válido')
  } else {
    log(colors.red, '   ✗ El hash NO tiene un formato bcrypt válido')
    log(colors.yellow, '   Debe comenzar con $2a$, $2b$ o $2y$')
    return
  }

  if (configuredHash.length !== 60) {
    log(colors.yellow, `   ⚠ Advertencia: El hash tiene ${configuredHash.length} caracteres (esperado: 60)`)
  } else {
    log(colors.green, '   ✓ El hash tiene la longitud correcta (60 caracteres)')
  }

  log(colors.blue, '\n4. Probando verificación con bcrypt:')
  
  try {
    const isValid = await bcrypt.compare(testPassword, configuredHash)
    
    if (isValid) {
      log(colors.green, '   ✓✓✓ ¡ÉXITO! El password coincide con el hash')
      log(colors.green, '   El hash está configurado correctamente')
      log(colors.yellow, '\n   Si aún no funciona en Easypanel, el problema puede ser:')
      console.log('   - Los símbolos $ en la variable de entorno necesitan escape')
      console.log('   - En Easypanel, intenta usar comillas simples: MASTER_PASSWORD_HASH=\'$2b$10$...\'')
      console.log('   - O escapar cada $: MASTER_PASSWORD_HASH=\\$2b\\$10\\$...')
    } else {
      log(colors.red, '   ✗✗✗ FALLO: El password NO coincide con el hash')
      log(colors.yellow, '\n   Posibles causas:')
      console.log('   - El hash no fue generado con este password')
      console.log('   - Hay espacios o caracteres invisibles en el password')
      console.log('   - El hash está corrupto o incompleto')
      
      log(colors.cyan, '\n   Generando un nuevo hash con el password actual...')
      const newHash = await bcrypt.hash(testPassword, 10)
      console.log('   Nuevo hash generado:', newHash)
      log(colors.yellow, '   Usa este hash en MASTER_PASSWORD_HASH si quieres usar este password')
    }
  } catch (error) {
    log(colors.red, '   ✗ Error al verificar el hash:')
    console.error('   ', error.message)
  }

  log(colors.blue, '\n5. Pruebas adicionales:')
  
  // Probar sin los símbolos $
  const passwordWithoutDollars = testPassword.replace(/\$/g, '')
  log(colors.cyan, `   Probando sin símbolos $: "${passwordWithoutDollars}"`)
  const validWithoutDollars = await bcrypt.compare(passwordWithoutDollars, configuredHash)
  if (validWithoutDollars) {
    log(colors.yellow, '   ⚠ El hash coincide SIN los símbolos $ - puede que se estén perdiendo en la configuración')
  } else {
    log(colors.green, '   ✓ Confirmado: los símbolos $ son parte del password')
  }

  // Probar con un solo $
  const passwordWithOneDollar = 'x0420EZS$'
  log(colors.cyan, `   Probando con un solo $: "${passwordWithOneDollar}"`)
  const validWithOneDollar = await bcrypt.compare(passwordWithOneDollar, configuredHash)
  if (validWithOneDollar) {
    log(colors.yellow, '   ⚠ El hash coincide con un solo $ - los demás se están perdiendo')
  }

  log(colors.cyan, '\n=== Fin del Test ===\n')
}

// Ejecutar el test
testHash().catch(error => {
  log(colors.red, '\nError fatal:')
  console.error(error)
  process.exit(1)
})
