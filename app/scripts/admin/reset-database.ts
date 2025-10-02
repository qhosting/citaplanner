#!/usr/bin/env tsx
/**
 * Script para resetear completamente la base de datos
 * ⚠️ PELIGRO: Esto eliminará TODOS los datos
 * Uso: tsx scripts/admin/reset-database.ts
 */

import { PrismaClient } from '@prisma/client'
import * as readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function resetDatabase() {
  try {
    console.log('⚠️  ADVERTENCIA: RESETEO COMPLETO DE BASE DE DATOS ⚠️')
    console.log('Esta acción eliminará TODOS los datos de la base de datos.')
    console.log('Esta acción NO se puede deshacer.\n')

    const confirmation1 = await question('¿Está seguro que desea continuar? (escriba "SI" para confirmar): ')
    
    if (confirmation1 !== 'SI') {
      console.log('❌ Operación cancelada')
      rl.close()
      return
    }

    const confirmation2 = await question('Confirme nuevamente escribiendo "RESETEAR": ')
    
    if (confirmation2 !== 'RESETEAR') {
      console.log('❌ Operación cancelada')
      rl.close()
      return
    }

    console.log('\n🗑️  Iniciando reseteo de base de datos...\n')

    // Orden de eliminación respetando las relaciones de foreign keys
    console.log('Eliminando appointments...')
    await prisma.appointment.deleteMany({})
    
    console.log('Eliminando payments...')
    await prisma.payment.deleteMany({})
    
    console.log('Eliminando workingHours...')
    await prisma.workingHours.deleteMany({})
    
    console.log('Eliminando services...')
    await prisma.service.deleteMany({})
    
    console.log('Eliminando clients...')
    await prisma.client.deleteMany({})
    
    console.log('Eliminando users...')
    await prisma.user.deleteMany({})
    
    console.log('Eliminando branches...')
    await prisma.branch.deleteMany({})
    
    console.log('Eliminando tenants...')
    await prisma.tenant.deleteMany({})

    console.log('\n✅ Base de datos reseteada exitosamente!')
    console.log('💡 Puede ejecutar el seed para crear datos de prueba: npm run seed')

  } catch (error) {
    console.error('❌ Error al resetear base de datos:', error)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

resetDatabase()
