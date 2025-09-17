
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const tenantId = session.user.tenantId

    // Obtener fechas para cálculos
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Consultas en paralelo
    const [
      todayAppointments,
      weeklyRevenue,
      monthlyRevenue,
      totalClients,
      completedAppointments,
      pendingAppointments
    ] = await Promise.all([
      // Citas de hoy
      prisma.appointment.count({
        where: {
          tenantId,
          startTime: {
            gte: today,
            lt: tomorrow
          }
        }
      }),

      // Ingresos de la semana
      prisma.payment.aggregate({
        where: {
          tenantId,
          createdAt: {
            gte: startOfWeek
          },
          status: 'PAID'
        },
        _sum: {
          amount: true
        }
      }),

      // Ingresos del mes
      prisma.payment.aggregate({
        where: {
          tenantId,
          createdAt: {
            gte: startOfMonth
          },
          status: 'PAID'
        },
        _sum: {
          amount: true
        }
      }),

      // Total de clientes
      prisma.client.count({
        where: {
          tenantId,
          isActive: true
        }
      }),

      // Citas completadas (este mes)
      prisma.appointment.count({
        where: {
          tenantId,
          status: 'COMPLETED',
          createdAt: {
            gte: startOfMonth
          }
        }
      }),

      // Citas pendientes (próximas)
      prisma.appointment.count({
        where: {
          tenantId,
          status: 'PENDING',
          startTime: {
            gte: new Date()
          }
        }
      })
    ])

    // Calcular nuevos clientes (este mes)
    const newClients = await prisma.client.count({
      where: {
        tenantId,
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    // Calcular precio promedio de servicios
    const avgServicePrice = await prisma.service.aggregate({
      where: {
        tenantId,
        isActive: true
      },
      _avg: {
        price: true
      }
    })

    const metrics = {
      todayAppointments,
      weeklyRevenue: weeklyRevenue._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      newClients,
      completedAppointments,
      pendingAppointments,
      totalClients,
      averageServicePrice: avgServicePrice._avg.price || 0
    }

    return NextResponse.json(metrics)

  } catch (error) {
    console.error('Error obteniendo métricas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
