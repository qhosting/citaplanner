
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import * as fs from 'fs'
import * as path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json()

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Nombre de archivo requerido' },
        { status: 400 }
      )
    }

    const backupFile = path.join(process.cwd(), 'backups', filename)

    if (!fs.existsSync(backupFile)) {
      return NextResponse.json(
        { success: false, error: 'Archivo de backup no encontrado' },
        { status: 404 }
      )
    }

    // Leer backup
    const backupContent = fs.readFileSync(backupFile, 'utf-8')
    const backup = JSON.parse(backupContent)

    // Limpiar base de datos
    await prisma.appointment.deleteMany({})
    await prisma.payment.deleteMany({})
    await prisma.workingHours.deleteMany({})
    await prisma.service.deleteMany({})
    await prisma.client.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.branch.deleteMany({})
    await prisma.tenant.deleteMany({})

    // Restaurar datos
    if (backup.data.tenants?.length > 0) {
      for (const tenant of backup.data.tenants) {
        await prisma.tenant.create({ data: tenant })
      }
    }

    if (backup.data.branches?.length > 0) {
      for (const branch of backup.data.branches) {
        await prisma.branch.create({ data: branch })
      }
    }

    if (backup.data.users?.length > 0) {
      for (const user of backup.data.users) {
        await prisma.user.create({ data: user })
      }
    }

    if (backup.data.clients?.length > 0) {
      for (const client of backup.data.clients) {
        await prisma.client.create({ data: client })
      }
    }

    if (backup.data.services?.length > 0) {
      for (const service of backup.data.services) {
        await prisma.service.create({ data: service })
      }
    }

    if (backup.data.workingHours?.length > 0) {
      for (const workingHour of backup.data.workingHours) {
        await prisma.workingHours.create({ data: workingHour })
      }
    }

    if (backup.data.appointments?.length > 0) {
      for (const appointment of backup.data.appointments) {
        await prisma.appointment.create({ data: appointment })
      }
    }

    if (backup.data.payments?.length > 0) {
      for (const payment of backup.data.payments) {
        await prisma.payment.create({ data: payment })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Base de datos restaurada exitosamente',
      stats: backup.stats
    })
  } catch (error) {
    console.error('Error al restaurar backup:', error)
    return NextResponse.json(
      { success: false, error: 'Error al restaurar backup' },
      { status: 500 }
    )
  }
}
