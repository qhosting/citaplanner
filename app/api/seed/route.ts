
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * ⚠️ SEED DATABASE ENDPOINT
 * 
 * Este endpoint ejecuta el script de seed para poblar la base de datos con datos de prueba.
 * 
 * SEGURIDAD:
 * - Solo funciona si NODE_ENV !== 'production' O si se proporciona un token válido
 * - Token de seguridad: Debe coincidir con SEED_TOKEN en variables de entorno
 * - Si no hay SEED_TOKEN configurado, solo funciona en desarrollo
 * 
 * USO:
 * POST /api/seed
 * Headers: { "x-seed-token": "tu-token-secreto" } (opcional en desarrollo)
 * 
 * DATOS QUE SE CREARÁN:
 * - 1 Tenant (Empresa): Bella Vita Spa & Wellness
 * - 1 Branch (Sucursal): Sucursal Centro
 * - 5 Usuarios:
 *   • Admin: admin@citaplanner.com / admin123
 *   • Manager: manager@citaplanner.com / manager123
 *   • Profesional 1: pro1@citaplanner.com / prof123
 *   • Profesional 2: pro2@citaplanner.com / prof123
 *   • Recepcionista: recepcionista@citaplanner.com / prof123
 * - 6 Servicios (tratamientos de spa)
 * - 6 Clientes
 * - 6 Citas (algunas completadas, algunas pendientes)
 * - 3 Pagos (para citas completadas)
 * 
 * ⚠️ ADVERTENCIA: Este endpoint ELIMINARÁ todos los usuarios existentes antes de crear los nuevos.
 * 
 * CÓMO ELIMINAR ESTE ENDPOINT DESPUÉS DE USARLO:
 * 1. Eliminar este archivo: /app/api/seed/route.ts
 * 2. Eliminar la página UI: /app/admin/seed/page.tsx
 * 3. Commit y push los cambios
 * 4. Redesplegar la aplicación
 */

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    console.log(`[SEED:${requestId}] 🌱 === SOLICITUD DE SEED ===`)
    console.log(`[SEED:${requestId}] 📅 Timestamp:`, new Date().toISOString())
    
    // VERIFICACIÓN DE SEGURIDAD
    const nodeEnv = process.env.NODE_ENV
    const seedToken = process.env.SEED_TOKEN
    const requestToken = request.headers.get('x-seed-token')
    
    console.log(`[SEED:${requestId}] 🔒 Verificación de seguridad:`)
    console.log(`[SEED:${requestId}]   - NODE_ENV: ${nodeEnv}`)
    console.log(`[SEED:${requestId}]   - SEED_TOKEN configurado: ${!!seedToken}`)
    console.log(`[SEED:${requestId}]   - Token en request: ${!!requestToken}`)
    
    // Permitir en desarrollo sin token
    if (nodeEnv === 'production') {
      if (!seedToken) {
        console.log(`[SEED:${requestId}] ❌ Producción sin SEED_TOKEN configurado`)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Seed endpoint deshabilitado en producción. Configure SEED_TOKEN para habilitarlo.' 
          },
          { status: 403 }
        )
      }
      
      if (requestToken !== seedToken) {
        console.log(`[SEED:${requestId}] ❌ Token inválido`)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Token de seguridad inválido' 
          },
          { status: 403 }
        )
      }
    }
    
    console.log(`[SEED:${requestId}] ✅ Verificación de seguridad pasada`)
    console.log(`[SEED:${requestId}] 🚀 Iniciando seed...`)
    
    // EJECUTAR SEED
    const result = await executeSeed(requestId)
    
    console.log(`[SEED:${requestId}] 🎉 Seed completado exitosamente`)
    
    return NextResponse.json({
      success: true,
      message: 'Base de datos poblada exitosamente',
      data: result,
      requestId,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error(`[SEED:${requestId}] ❌ Error ejecutando seed:`, error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error desconocido',
        requestId,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

async function executeSeed(requestId: string) {
  console.log(`[SEED:${requestId}] 🗑️  Eliminando usuarios existentes...`)
  await prisma.user.deleteMany({})
  console.log(`[SEED:${requestId}] ✅ Usuarios eliminados`)

  // Crear tenant de prueba
  console.log(`[SEED:${requestId}] 🏢 Creando tenant...`)
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Bella Vita Spa & Wellness',
      email: 'contacto@bellavita.com',
      phone: '+52 55 1234 5678',
      address: 'Avenida Reforma 123, Col. Centro',
      city: 'Ciudad de México',
      country: 'México'
    }
  })
  console.log(`[SEED:${requestId}] ✅ Tenant creado: ${tenant.name}`)

  // Crear sucursal principal
  console.log(`[SEED:${requestId}] 🏪 Creando sucursal...`)
  const branch = await prisma.branch.create({
    data: {
      name: 'Sucursal Centro',
      address: 'Avenida Reforma 123, Col. Centro',
      phone: '+52 55 1234 5678',
      email: 'centro@bellavita.com',
      tenantId: tenant.id
    }
  })
  console.log(`[SEED:${requestId}] ✅ Sucursal creada: ${branch.name}`)

  // Hashear contraseñas
  console.log(`[SEED:${requestId}] 🔐 Hasheando contraseñas...`)
  const adminPassword = await bcrypt.hash('admin123', 10)
  const managerPassword = await bcrypt.hash('manager123', 10)
  const professionalPassword = await bcrypt.hash('prof123', 10)

  // Crear usuarios
  console.log(`[SEED:${requestId}] 👥 Creando usuarios...`)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@citaplanner.com',
      password: adminPassword,
      firstName: 'Administrador',
      lastName: 'Principal',
      role: 'ADMIN',
      phone: '+52 55 1111 1111',
      tenantId: tenant.id,
      branchId: branch.id
    }
  })

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@citaplanner.com',
      password: managerPassword,
      firstName: 'Gerente',
      lastName: 'de Sucursal',
      role: 'MANAGER',
      phone: '+52 55 2222 2222',
      tenantId: tenant.id,
      branchId: branch.id
    }
  })

  const professional1 = await prisma.user.create({
    data: {
      email: 'pro1@citaplanner.com',
      password: professionalPassword,
      firstName: 'Estilista',
      lastName: 'Senior',
      role: 'PROFESSIONAL',
      phone: '+52 55 3333 3333',
      tenantId: tenant.id,
      branchId: branch.id
    }
  })

  const professional2 = await prisma.user.create({
    data: {
      email: 'pro2@citaplanner.com',
      password: professionalPassword,
      firstName: 'Barbero',
      lastName: 'Profesional',
      role: 'PROFESSIONAL',
      phone: '+52 55 4444 4444',
      tenantId: tenant.id,
      branchId: branch.id
    }
  })

  const receptionist = await prisma.user.create({
    data: {
      email: 'recepcionista@citaplanner.com',
      password: professionalPassword,
      firstName: 'Recepcionista',
      lastName: 'Principal',
      role: 'RECEPTIONIST',
      phone: '+52 55 5555 5555',
      tenantId: tenant.id,
      branchId: branch.id
    }
  })

  console.log(`[SEED:${requestId}] ✅ 5 usuarios creados`)

  // Crear servicios
  console.log(`[SEED:${requestId}] 💆 Creando servicios...`)
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Masaje Relajante',
        description: 'Masaje de cuerpo completo con aceites esenciales',
        duration: 60,
        price: 800,
        tenantId: tenant.id,
        branchId: branch.id
      }
    }),
    prisma.service.create({
      data: {
        name: 'Facial Hidratante',
        description: 'Tratamiento facial profundo con productos premium',
        duration: 90,
        price: 1200,
        tenantId: tenant.id,
        branchId: branch.id
      }
    }),
    prisma.service.create({
      data: {
        name: 'Manicure y Pedicure',
        description: 'Cuidado completo de manos y pies',
        duration: 120,
        price: 600,
        tenantId: tenant.id,
        branchId: branch.id
      }
    }),
    prisma.service.create({
      data: {
        name: 'Corte de Cabello',
        description: 'Corte y peinado profesional',
        duration: 45,
        price: 350,
        tenantId: tenant.id,
        branchId: branch.id
      }
    }),
    prisma.service.create({
      data: {
        name: 'Depilación con Cera',
        description: 'Depilación profesional de piernas completas',
        duration: 75,
        price: 450,
        tenantId: tenant.id,
        branchId: branch.id
      }
    }),
    prisma.service.create({
      data: {
        name: 'Tratamiento Capilar',
        description: 'Hidratación profunda y reparación del cabello',
        duration: 60,
        price: 550,
        tenantId: tenant.id,
        branchId: branch.id
      }
    })
  ])

  console.log(`[SEED:${requestId}] ✅ ${services.length} servicios creados`)

  // Crear clientes
  console.log(`[SEED:${requestId}] 👤 Creando clientes...`)
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        firstName: 'María',
        lastName: 'González',
        email: 'maria.gonzalez@email.com',
        phone: '+52 55 9876 5432',
        tenantId: tenant.id,
        branchId: branch.id
      }
    }),
    prisma.client.create({
      data: {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@email.com',
        phone: '+52 55 8765 4321',
        tenantId: tenant.id,
        branchId: branch.id
      }
    }),
    prisma.client.create({
      data: {
        firstName: 'Ana',
        lastName: 'Martínez',
        email: 'ana.martinez@email.com',
        phone: '+52 55 7654 3210',
        tenantId: tenant.id,
        branchId: branch.id
      }
    }),
    prisma.client.create({
      data: {
        firstName: 'Carlos',
        lastName: 'López',
        email: 'carlos.lopez@email.com',
        phone: '+52 55 6543 2109',
        tenantId: tenant.id,
        branchId: branch.id
      }
    }),
    prisma.client.create({
      data: {
        firstName: 'Laura',
        lastName: 'Hernández',
        email: 'laura.hernandez@email.com',
        phone: '+52 55 5432 1098',
        tenantId: tenant.id,
        branchId: branch.id
      }
    }),
    prisma.client.create({
      data: {
        firstName: 'Roberto',
        lastName: 'García',
        email: 'roberto.garcia@email.com',
        phone: '+52 55 4321 0987',
        tenantId: tenant.id,
        branchId: branch.id
      }
    })
  ])

  console.log(`[SEED:${requestId}] ✅ ${clients.length} clientes creados`)

  // Crear horarios de trabajo
  console.log(`[SEED:${requestId}] 🕐 Creando horarios de trabajo...`)
  const workingHours = await Promise.all(
    [0, 1, 2, 3, 4, 5, 6].map(dayOfWeek =>
      prisma.workingHours.create({
        data: {
          dayOfWeek,
          startTime: dayOfWeek === 0 ? '10:00' : '09:00',
          endTime: dayOfWeek === 0 ? '16:00' : '18:00',
          branchId: branch.id
        }
      })
    )
  )

  console.log(`[SEED:${requestId}] ✅ Horarios de trabajo creados`)

  // Crear citas
  console.log(`[SEED:${requestId}] 📅 Creando citas...`)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const appointments = await Promise.all([
    // Citas de hoy
    prisma.appointment.create({
      data: {
        startTime: new Date(today.getTime() + 10 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 11 * 60 * 60 * 1000),
        status: 'CONFIRMED',
        notes: 'Primera sesión del tratamiento',
        tenantId: tenant.id,
        branchId: branch.id,
        clientId: clients[0].id,
        serviceId: services[0].id,
        userId: professional1.id
      }
    }),
    prisma.appointment.create({
      data: {
        startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 15.5 * 60 * 60 * 1000),
        status: 'PENDING',
        tenantId: tenant.id,
        branchId: branch.id,
        clientId: clients[1].id,
        serviceId: services[1].id,
        userId: professional2.id
      }
    }),
    // Citas de mañana
    prisma.appointment.create({
      data: {
        startTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 12.25 * 60 * 60 * 1000),
        status: 'CONFIRMED',
        tenantId: tenant.id,
        branchId: branch.id,
        clientId: clients[2].id,
        serviceId: services[4].id,
        userId: professional1.id
      }
    }),
    // Citas completadas
    prisma.appointment.create({
      data: {
        startTime: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000),
        status: 'COMPLETED',
        notes: 'Cliente muy satisfecha con el resultado',
        tenantId: tenant.id,
        branchId: branch.id,
        clientId: clients[3].id,
        serviceId: services[2].id,
        userId: professional1.id
      }
    }),
    prisma.appointment.create({
      data: {
        startTime: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
        status: 'COMPLETED',
        tenantId: tenant.id,
        branchId: branch.id,
        clientId: clients[4].id,
        serviceId: services[5].id,
        userId: professional2.id
      }
    }),
    prisma.appointment.create({
      data: {
        startTime: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000 + 13.75 * 60 * 60 * 1000),
        status: 'COMPLETED',
        tenantId: tenant.id,
        branchId: branch.id,
        clientId: clients[5].id,
        serviceId: services[3].id,
        userId: professional2.id
      }
    })
  ])

  console.log(`[SEED:${requestId}] ✅ ${appointments.length} citas creadas`)

  // Crear pagos
  console.log(`[SEED:${requestId}] 💰 Creando pagos...`)
  const completedAppointments = appointments.filter(apt => apt.status === 'COMPLETED')
  
  const payments = await Promise.all(completedAppointments.map(appointment => {
    const service = services.find(s => s.id === appointment.serviceId)
    
    return prisma.payment.create({
      data: {
        amount: service?.price || 500,
        paymentMethod: Math.random() > 0.5 ? 'CASH' : 'CREDIT_CARD',
        status: 'PAID',
        tenantId: tenant.id,
        branchId: branch.id,
        clientId: appointment.clientId,
        appointmentId: appointment.id,
        userId: receptionist.id,
        createdAt: appointment.endTime
      }
    })
  }))

  console.log(`[SEED:${requestId}] ✅ ${payments.length} pagos creados`)

  // Retornar resumen
  return {
    tenant: {
      id: tenant.id,
      name: tenant.name
    },
    branch: {
      id: branch.id,
      name: branch.name
    },
    users: [
      { email: 'admin@citaplanner.com', password: 'admin123', role: 'ADMIN', name: 'Administrador Principal' },
      { email: 'manager@citaplanner.com', password: 'manager123', role: 'MANAGER', name: 'Gerente de Sucursal' },
      { email: 'pro1@citaplanner.com', password: 'prof123', role: 'PROFESSIONAL', name: 'Estilista Senior' },
      { email: 'pro2@citaplanner.com', password: 'prof123', role: 'PROFESSIONAL', name: 'Barbero Profesional' },
      { email: 'recepcionista@citaplanner.com', password: 'prof123', role: 'RECEPTIONIST', name: 'Recepcionista Principal' }
    ],
    counts: {
      services: services.length,
      clients: clients.length,
      appointments: appointments.length,
      payments: payments.length,
      workingHours: workingHours.length
    }
  }
}
