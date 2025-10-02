
/**
 * Script para generar un hash de master password compatible con bcryptjs
 * 
 * Uso:
 *   npm run generate-hash
 *   npm run generate-hash -- "mi_password_seguro"
 * 
 * Este script genera hashes con prefijo $2a$ que son totalmente compatibles
 * con bcryptjs usado en la aplicación Next.js
 */

import bcrypt from 'bcryptjs'
import * as readline from 'readline'

const SALT_ROUNDS = 12

async function generateHash(password: string): Promise<string> {
  console.log('\n🔐 Generando hash de master password...\n')
  
  const hash = await bcrypt.hash(password, SALT_ROUNDS)
  
  console.log('✅ Hash generado exitosamente!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📋 MASTER_PASSWORD_HASH:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(hash)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  console.log('📝 Instrucciones:')
  console.log('1. Copia el hash completo de arriba')
  console.log('2. En Easypanel, ve a tu aplicación > Environment')
  console.log('3. Actualiza la variable MASTER_PASSWORD_HASH con este valor')
  console.log('4. Guarda los cambios y reinicia el contenedor\n')
  
  console.log('ℹ️  Información técnica:')
  console.log(`   - Algoritmo: bcryptjs`)
  console.log(`   - Salt rounds: ${SALT_ROUNDS}`)
  console.log(`   - Prefijo: ${hash.substring(0, 4)}`)
  console.log(`   - Longitud: ${hash.length} caracteres`)
  console.log(`   - Compatible: ✅ bcryptjs (Node.js)\n`)
  
  // Verificar que el hash funciona
  const isValid = await bcrypt.compare(password, hash)
  if (isValid) {
    console.log('✅ Verificación: El hash fue validado correctamente\n')
  } else {
    console.error('❌ ERROR: El hash generado no pudo ser verificado\n')
  }
  
  return hash
}

async function promptPassword(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question('🔑 Ingresa el master password: ', (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║     Generador de Master Password Hash (bcryptjs)          ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  let password: string

  // Verificar si se pasó el password como argumento
  if (process.argv.length > 2) {
    password = process.argv[2]
    console.log('📝 Usando password del argumento de línea de comandos\n')
  } else {
    password = await promptPassword()
  }

  if (!password || password.trim().length === 0) {
    console.error('❌ Error: El password no puede estar vacío\n')
    process.exit(1)
  }

  if (password.length < 8) {
    console.warn('⚠️  Advertencia: Se recomienda usar un password de al menos 8 caracteres\n')
  }

  try {
    await generateHash(password)
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error al generar el hash:', error)
    process.exit(1)
  }
}

main()

