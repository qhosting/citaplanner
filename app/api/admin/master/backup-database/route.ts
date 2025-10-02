
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import * as fs from 'fs'
import * as path from 'path'
import dayjs from 'dayjs'

export async function POST() {
  try {
    const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss')
    const backupDir = path.join(process.cwd(), 'backups')
    const backupFile = path.join(backupDir, `backup_${timestamp}.json`)

    // Crear directorio si no existe
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Obtener todos los datos
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

    const fileSizeMB = (fs.statSync(backupFile).size / 1024 / 1024).toFixed(2)

    return NextResponse.json({
      success: true,
      filename: `backup_${timestamp}.json`,
      size: `${fileSizeMB} MB`,
      stats: backup.stats
    })
  } catch (error) {
    console.error('Error al crear backup:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear backup' },
      { status: 500 }
    )
  }
}
