const bcrypt = require('bcryptjs');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     DIAGNÓSTICO COMPLETO - MASTER PASSWORD AUTH            ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

const password = 'x0420EZS2025*';
const currentHash = '$2b$10$P/AV363LeWhZGK0kkrON3eGmAlkmiTHKuzZzDKCAppFV.0Gzf0ZaO';

// Verificar variables de entorno
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 PASO 1: Verificar Variables de Entorno');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('MASTER_PASSWORD_HASH:', process.env.MASTER_PASSWORD_HASH ? '✅ CONFIGURADA' : '❌ NO CONFIGURADA (usando fallback)');
console.log('ENABLE_MASTER_DEBUG:', process.env.ENABLE_MASTER_DEBUG || 'false');
console.log('');

// Determinar qué hash se usará
const effectiveHash = process.env.MASTER_PASSWORD_HASH || currentHash;
const usingEnvHash = !!process.env.MASTER_PASSWORD_HASH;

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 PASO 2: Hash Efectivo que se Usará');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Fuente:', usingEnvHash ? '🔐 Variable de Entorno' : '📝 Hardcoded Fallback');
console.log('Hash:', effectiveHash);
console.log('Prefijo:', effectiveHash.substring(0, 7));
console.log('Longitud:', effectiveHash.length);
console.log('');

// Verificar el hash efectivo
bcrypt.compare(password, effectiveHash).then(isValid => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 PASO 3: Verificar Password con Hash Efectivo');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Password:', password);
  console.log('Resultado:', isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO');
  console.log('');
  
  if (usingEnvHash && !isValid) {
    console.log('⚠️  PROBLEMA DETECTADO:');
    console.log('   La variable de entorno MASTER_PASSWORD_HASH está configurada');
    console.log('   pero NO coincide con el password esperado.');
    console.log('');
    console.log('💡 SOLUCIÓN:');
    console.log('   1. Verificar que MASTER_PASSWORD_HASH en Easypanel sea correcto');
    console.log('   2. O eliminar MASTER_PASSWORD_HASH para usar el fallback');
    console.log('');
  }
  
  // Si hay variable de entorno, también probar el fallback
  if (usingEnvHash) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 PASO 4: Verificar Hash Hardcoded (Fallback)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return bcrypt.compare(password, currentHash);
  }
  return Promise.resolve(null);
}).then(fallbackValid => {
  if (fallbackValid !== null) {
    console.log('Hash Fallback:', currentHash);
    console.log('Resultado:', fallbackValid ? '✅ VÁLIDO' : '❌ INVÁLIDO');
    console.log('');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 RESUMEN Y RECOMENDACIONES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (usingEnvHash) {
    console.log('🔐 Estado: Usando variable de entorno MASTER_PASSWORD_HASH');
    console.log('');
    console.log('✅ RECOMENDACIONES:');
    console.log('   1. Verificar en Easypanel > Environment que MASTER_PASSWORD_HASH');
    console.log('      tenga el valor correcto');
    console.log('   2. Si el hash es incorrecto, actualizarlo con:');
    console.log('      ' + currentHash);
    console.log('   3. Después de actualizar, reiniciar el contenedor');
    console.log('   4. Habilitar debug con ENABLE_MASTER_DEBUG=true para ver logs');
  } else {
    console.log('📝 Estado: Usando hash hardcoded (fallback)');
    console.log('');
    console.log('✅ El hash hardcoded es correcto para: x0420EZS2025*');
    console.log('');
    console.log('🔍 Si el usuario no puede acceder:');
    console.log('   1. Verificar que NO haya MASTER_PASSWORD_HASH en Easypanel');
    console.log('   2. Verificar que el password no tenga espacios extra');
    console.log('   3. Verificar mayúsculas/minúsculas (es case-sensitive)');
    console.log('   4. Limpiar caché del navegador');
    console.log('   5. Probar en modo incógnito');
    console.log('   6. Habilitar debug con ENABLE_MASTER_DEBUG=true');
  }
  
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔧 COMANDOS ÚTILES PARA EASYPANEL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Para habilitar debug (ver logs detallados):');
  console.log('  Variable: ENABLE_MASTER_DEBUG');
  console.log('  Valor: true');
  console.log('');
  console.log('Para usar hash personalizado:');
  console.log('  Variable: MASTER_PASSWORD_HASH');
  console.log('  Valor: ' + currentHash);
  console.log('');
  console.log('Para generar nuevo hash:');
  console.log('  cd app && npm run generate-hash');
  console.log('');
  
}).catch(error => {
  console.error('❌ Error:', error);
});
