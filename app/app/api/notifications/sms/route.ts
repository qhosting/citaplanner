
import { NextRequest, NextResponse } from 'next/server'
import { smsService } from '@/lib/integrations/sms'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { type, appointmentId, customMessage, recipients } = body

    if (type === 'appointment_reminder' && appointmentId) {
      // Enviar recordatorio de cita
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          client: true,
          service: true,
          tenant: true,
          user: true
        }
      })

      if (!appointment) {
        return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
      }

      const appointmentDate = new Date(appointment.startTime).toLocaleDateString('es-ES')
      const appointmentTime = new Date(appointment.startTime).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })

      const result = await smsService.sendAppointmentReminder(
        appointment.client.phone,
        `${appointment.client.firstName} ${appointment.client.lastName}`,
        appointment.service?.name || 'Servicio',
        appointmentDate,
        appointmentTime,
        appointment.tenant?.name || 'CitaPlanner'
      )

      if (result.success) {
        // Registrar la notificación (comentado hasta que se agregue el modelo)
        // await prisma.notification.create({
        //   data: {
        //     type: 'SMS',
        //     title: 'Recordatorio de cita enviado',
        //     message: `SMS enviado a ${appointment.client.phone}`,
        //     tenantId: appointment.tenantId,
        //     appointmentId: appointmentId,
        //     metadata: JSON.stringify({ messageId: result.messageId })
        //   }
        // })
      }

      return NextResponse.json(result)

    } else if (type === 'custom' && recipients && customMessage) {
      // Enviar mensaje personalizado
      const results = []

      for (const recipient of recipients) {
        const result = await smsService.sendSMS({
          to: recipient.phone,
          message: customMessage,
          sender: session.user.tenantName?.substring(0, 11) || 'CitaPlanner'
        })

        results.push({
          recipient: recipient.phone,
          success: result.success,
          error: result.error
        })

        // Pequeña pausa entre envíos
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      return NextResponse.json({ results })

    } else {
      return NextResponse.json({ error: 'Tipo de notificación no válido' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error sending SMS:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener balance de SMS
    const balance = await smsService.getBalance()
    return NextResponse.json(balance)

  } catch (error) {
    console.error('Error getting SMS balance:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
