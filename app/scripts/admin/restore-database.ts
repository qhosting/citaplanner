#!/usr/bin/env tsx
/**
 * Script para restaurar backup de la base de datos
 * ⚠️ PELIGRO: Esto reemplazará los datos actuales
 * Uso: tsx scripts/admin/restore-database.ts <archivo-backup>
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
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

async function restoreDatabase(backupFilePath?: string) {
  try {
    console.log('🔄 Restaurador de Base de Datos - CitaPlanner\n')

    // Si no se proporciona archivo, listar backups disponibles
    if (!backupFilePath) {
      const backupDir = path.join(process.cwd(), 'backups')
      
      if (!fs.existsSync(backupDir)) {
        console.log('❌ No se encontró el directorio de backups')
        rl.close()
        return
      }

      const backupFiles = fs.readdirSync(backupDir)
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse()

      if (backupFiles.length === 0) {
        console.log('❌ No hay backups disponibles')
        rl.close()
        return
      }

      console.log('Backups disponibles:')
      backupFiles.forEach((file, idx) => {
        const filePath = path.join(backupDir, file)
        const stats = fs.statSync(filePath)
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
        console.log(`${idx + 1}. ${file} (${sizeMB} MB)`)
      })

      const choice = await question('\nSeleccione backup a restaurar (número): ')
      const selectedFile = backupFiles[parseInt(choice) - 1]
      
      if (!selectedFile) {
        console.log('❌ Selección inválida')
        rl.close()
        return
      }

      backupFilePath = path.join(backupDir, selectedFile)
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(backupFilePath)) {
      console.log('❌ El archivo de backup no existe:', backupFilePath)
      rl.close()
      return
    }

    console.log('\n⚠️  ADVERTENCIA: Esta operación reemplazará todos los datos actuales')
    const confirmation = await question('¿Desea continuar? (escriba "SI" para confirmar): ')
    
    if (confirmation !== 'SI') {
      console.log('❌ Operación cancelada')
      rl.close()
      return
    }

    // Leer archivo de backup
    console.log('\n📖 Leyendo archivo de backup...')
    const backupContent = fs.readFileSync(backupFilePath, 'utf-8')
    const backup = JSON.parse(backupContent)

    console.log('📊 Información del backup:')
    console.log('   Fecha:', backup.metadata.timestamp)
    console.log('   Versión:', backup.metadata.version)
    console.log('\n🗑️  Limpiando base de datos actual...')

    // Limpiar base de datos
    await prisma.appointment.deleteMany({})
    await prisma.payment.deleteMany({})
    await prisma.workingHours.deleteMany({})
    await prisma.service.deleteMany({})
    await prisma.client.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.branch.deleteMany({})
    await prisma.tenant.deleteMany({})

    console.log('✅ Base de datos limpiada')
    console.log('\n📥 Restaurando datos...')

    // Restaurar datos en orden
    if (backup.data.tenants?.length > 0) {
      console.log(`Restaurando ${backup.data.tenants.length} tenants...`)
      for (const tenant of backup.data.tenants) {
        await prisma.tenant.create({ data: tenant })
      }
    }

    if (backup.data.branches?.length > 0) {
      console.log(`Restaurando ${backup.data.branches.length} sucursales...`)
      for (const branch of backup.data.branches) {
        await prisma.branch.create({ data: branch })
      }
    }

    if (backup.data.users?.length > 0) {
      console.log(`Restaurando ${backup.data.users.length} usuarios...`)
      for (const user of backup.data.users) {
        await prisma.user.create({ data: user })
      }
    }

    if (backup.data.clients?.length > 0) {
      console.log(`Restaurando ${backup.data.clients.length} clientes...`)
      for (const client of backup.data.clients) {
        await prisma.client.create({ data: client })
      }
    }

    if (backup.data.services?.length > 0) {
      console.log(`Restaurando ${backup.data.services.length} servicios...`)
      for (const service of backup.data.services) {
        await prisma.service.create({ data: service })
      }
    }

    if (backup.data.workingHours?.length > 0) {
      console.log(`Restaurando ${backup.data.workingHours.length} horarios de trabajo...`)
      for (const workingHour of backup.data.workingHours) {
        await prisma.workingHours.create({ data: workingHour })
      }
    }

    if (backup.data.appointments?.length > 0) {
      console.log(`Restaurando ${backup.data.appointments.length} citas...`)
      for (const appointment of backup.data.appointments) {
        await prisma.appointment.create({ data: appointment })
      }
    }

    if (backup.data.payments?.length > 0) {
      console.log(`Restaurando ${backup.data.payments.length} pagos...`)
      for (const payment of backup.data.payments) {
        await prisma.payment.create({ data: payment })
      }
    }

    console.log('\n✅ Base de datos restaurada exitosamente!')
    console.log('📊 Datos restaurados:')
    console.log(`   - Tenants: ${backup.stats.tenants}`)
    console.log(`   - Sucursales: ${backup.stats.branches}`)
    console.log(`   - Usuarios: ${backup.stats.users}`)
    console.log(`   - Clientes: ${backup.stats.clients}`)
    console.log(`   - Servicios: ${backup.stats.services}`)
    console.log(`   - Horarios de trabajo: ${backup.stats.workingHours || 0}`)
    console.log(`   - Citas: ${backup.stats.appointments}`)
    console.log(`   - Pagos: ${backup.stats.payments}`)

  } catch (error) {
    console.error('❌ Error al restaurar backup:', error)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

// Obtener archivo de backup de los argumentos
const backupFile = process.argv[2]
restoreDatabase(backupFile)
