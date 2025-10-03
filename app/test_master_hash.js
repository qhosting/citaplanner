const bcrypt = require('bcryptjs');

const password = 'x0420EZS2025*';
const currentHash = '$2b$10$P/AV363LeWhZGK0kkrON3eGmAlkmiTHKuzZzDKCAppFV.0Gzf0ZaO';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 PRUEBA 1: Verificar hash actual con password');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

bcrypt.compare(password, currentHash).then(isValid => {
  console.log('Password:', password);
  console.log('Hash actual:', currentHash);
  console.log('Resultado:', isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO');
  console.log('');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔨 PRUEBA 2: Generar nuevo hash para el mismo password');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  return bcrypt.hash(password, 10);
}).then(newHash => {
  console.log('Nuevo hash generado:', newHash);
  console.log('');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 PRUEBA 3: Verificar nuevo hash con password');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  return bcrypt.compare(password, newHash).then(isValid => {
    console.log('Password:', password);
    console.log('Nuevo hash:', newHash);
    console.log('Resultado:', isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO');
    console.log('');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 COMPARACIÓN DE HASHES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Hash actual:  ', currentHash);
    console.log('Nuevo hash:   ', newHash);
    console.log('Son iguales:  ', currentHash === newHash ? '✅ SÍ' : '❌ NO (esto es normal en bcrypt)');
    console.log('');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 PRUEBA 4: Probar variaciones del password');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const variations = [
      'x0420EZS2025*',      // Original
      'x0420EZS2025* ',     // Con espacio al final
      ' x0420EZS2025*',     // Con espacio al inicio
      'X0420EZS2025*',      // Primera letra mayúscula
      'x0420ezs2025*',      // Todo minúsculas
    ];
    
    return Promise.all(variations.map(v => 
      bcrypt.compare(v, currentHash).then(result => ({
        password: v,
        valid: result
      }))
    ));
  });
}).then(results => {
  results.forEach(r => {
    const status = r.valid ? '✅' : '❌';
    const display = r.password.replace(/ /g, '·'); // Mostrar espacios como puntos
    console.log(`${status} "${display}"`);
  });
  console.log('');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💡 CONCLUSIÓN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const currentHashWorks = results[0].valid;
  
  if (currentHashWorks) {
    console.log('✅ El hash hardcoded actual ES CORRECTO');
    console.log('✅ El password "x0420EZS2025*" funciona con el hash actual');
    console.log('');
    console.log('🔍 Si el usuario no puede acceder, el problema puede ser:');
    console.log('   1. Está usando una variable de entorno MASTER_PASSWORD_HASH diferente');
    console.log('   2. Hay espacios extra en el password que está ingresando');
    console.log('   3. Problema de mayúsculas/minúsculas');
    console.log('   4. El navegador está guardando un password incorrecto');
  } else {
    console.log('❌ El hash hardcoded actual NO FUNCIONA con el password');
    console.log('🔧 Se necesita actualizar el hash en el código');
  }
  
}).catch(error => {
  console.error('❌ Error:', error);
});
