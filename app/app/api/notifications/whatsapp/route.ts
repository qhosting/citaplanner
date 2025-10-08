
import { NextRequest, NextResponse } from 'next/server'
import { whatsappService } from '@/lib/integrations/whatsapp'
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
    const { type, appointmentId, customMessage, recipients, imageUrl } = body

    if (type === 'appointment_reminder' && appointmentId) {
      // Enviar recordatorio de cita por WhatsApp
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          client: true,
          service: true,
          tenant: true,
          user: true,
          branch: true
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

      const result = await whatsappService.sendAppointmentReminder(
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
        //     type: 'WHATSAPP',
        //     title: 'Recordatorio de cita enviado',
        //     message: `WhatsApp enviado a ${appointment.client.phone}`,
        //     tenantId: appointment.tenantId,
        //     appointmentId: appointmentId,
        //     metadata: JSON.stringify({ messageId: result.messageId })
        //   }
        // })
      }

      return NextResponse.json(result)

    } else if (type === 'appointment_confirmation' && appointmentId) {
      // Enviar confirmación de cita
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          client: true,
          service: true,
          tenant: true,
          branch: true
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

      const result = await whatsappService.sendAppointmentConfirmation(
        appointment.client.phone,
        `${appointment.client.firstName} ${appointment.client.lastName}`,
        appointment.service?.name || 'Servicio',
        appointmentDate,
        appointmentTime,
        appointment.tenant?.name || 'CitaPlanner',
        appointment.branch?.address || undefined
      )

      return NextResponse.json(result)

    } else if (type === 'custom' && recipients && customMessage) {
      // Enviar mensaje personalizado
      const results: any[] = []

      for (const recipient of recipients) {
        let result
        
        if (imageUrl) {
          result = await whatsappService.sendImageMessage(
            recipient.phone,
            imageUrl,
            customMessage
          )
        } else {
          result = await whatsappService.sendMessage({
            to: recipient.phone,
            message: customMessage
          })
        }

        results.push({
          recipient: recipient.phone,
          success: result.success,
          error: result.error
        })

        // Pausa entre envíos
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      return NextResponse.json({ results })

    } else {
      return NextResponse.json({ error: 'Tipo de notificación no válido' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error sending WhatsApp:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar estado de la instancia de WhatsApp
    const status = await whatsappService.getInstanceStatus()
    return NextResponse.json(status)

  } catch (error) {
    console.error('Error getting WhatsApp status:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
