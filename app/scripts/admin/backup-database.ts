#!/usr/bin/env tsx
/**
 * Script para hacer backup de la base de datos
 * Uso: tsx scripts/admin/backup-database.ts
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import dayjs from 'dayjs'

const prisma = new PrismaClient()

async function backupDatabase() {
  try {
    console.log('💾 Iniciando backup de base de datos...\n')

    const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss')
    const backupDir = path.join(process.cwd(), 'backups')
    const backupFile = path.join(backupDir, `backup_${timestamp}.json`)

    // Crear directorio de backups si no existe
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Obtener todos los datos
    console.log('📊 Extrayendo datos...')
    
    const [
      tenants,
      branches,
      users,
      clients,
      services,
      appointments,
      payments,
      workingHours
    ] = await Promise.all([
      prisma.tenant.findMany(),
      prisma.branch.findMany(),
      prisma.user.findMany(),
      prisma.client.findMany(),
      prisma.service.findMany(),
      prisma.appointment.findMany(),
      prisma.payment.findMany(),
      prisma.workingHours.findMany()
    ])

    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        database: 'citaplanner'
      },
      data: {
        tenants,
        branches,
        users,
        clients,
        services,
        appointments,
        payments,
        workingHours
      },
      stats: {
        tenants: tenants.length,
        branches: branches.length,
        users: users.length,
        clients: clients.length,
        services: services.length,
        appointments: appointments.length,
        payments: payments.length,
        workingHours: workingHours.length
      }
    }

    // Guardar backup
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2))

    console.log('\n✅ Backup completado exitosamente!')
    console.log('📁 Archivo:', backupFile)
    console.log('📊 Estadísticas:')
    console.log(`   - Tenants: ${backup.stats.tenants}`)
    console.log(`   - Sucursales: ${backup.stats.branches}`)
    console.log(`   - Usuarios: ${backup.stats.users}`)
    console.log(`   - Clientes: ${backup.stats.clients}`)
    console.log(`   - Servicios: ${backup.stats.services}`)
    console.log(`   - Citas: ${backup.stats.appointments}`)
    console.log(`   - Pagos: ${backup.stats.payments}`)
    console.log(`   - Horarios de trabajo: ${backup.stats.workingHours}`)

    const fileSizeMB = (fs.statSync(backupFile).size / 1024 / 1024).toFixed(2)
    console.log(`💾 Tamaño del archivo: ${fileSizeMB} MB`)

  } catch (error) {
    console.error('❌ Error al crear backup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

backupDatabase()
