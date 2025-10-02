
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    // Eliminar todos los datos en orden correcto (respetando foreign keys)
    await prisma.appointment.deleteMany({})
    await prisma.payment.deleteMany({})
    await prisma.workingHours.deleteMany({})
    await prisma.service.deleteMany({})
    await prisma.client.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.branch.deleteMany({})
    await prisma.tenant.deleteMany({})

    return NextResponse.json({
      success: true,
      message: 'Base de datos reseteada exitosamente'
    })
  } catch (error) {
    console.error('Error al resetear base de datos:', error)
    return NextResponse.json(
      { success: false, error: 'Error al resetear base de datos' },
      { status: 500 }
    )
  }
}
