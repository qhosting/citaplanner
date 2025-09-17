
import { NextRequest, NextResponse } from 'next/server'
import { openPayService } from '@/lib/integrations/openpay'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { appointmentId, amount, cardData, customerData } = body

    // Validar datos requeridos
    if (!appointmentId || !amount || !cardData || !customerData) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Buscar la cita
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: true,
        service: true,
        tenant: true
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      )
    }

    // Crear el pago con OpenPay
    const paymentResult = await openPayService.createPayment({
      amount: amount,
      currency: 'MXN',
      description: `Pago por ${appointment.service?.name}`,
      orderId: `APT-${appointmentId}`,
      customer: {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone
      }
    })

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error },
        { status: 400 }
      )
    }

    // Guardar el pago en la base de datos
    const payment = await prisma.payment.create({
      data: {
        amount: amount,
        paymentMethod: 'CREDIT_CARD',
        status: 'PAID',
        appointmentId: appointmentId,
        tenantId: appointment.tenantId,
        branchId: appointment.branchId,
        clientId: appointment.clientId,
        userId: (session.user as any).id
        // transactionId: paymentResult.transactionId || '',
        // metadata: JSON.stringify(paymentResult.data)
      }
    })

    // Actualizar el estado de la cita
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'CONFIRMED'
      }
    })

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      transactionId: paymentResult.transactionId,
      message: 'Pago procesado exitosamente'
    })

  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
