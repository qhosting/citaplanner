
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * Script de seed IDEMPOTENTE para CitaPlanner
 * 
 * Este script verifica si los datos ya existen antes de insertarlos,
 * asegurando que puede ejecutarse múltiples veces sin duplicar información.
 * 
 * Características:
 * - Verifica existencia de datos antes de crear
 * - Usa upsert para datos que deben ser únicos
 * - No elimina datos existentes
 * - Seguro para ejecutar en cada deploy
 */

async function main() {
  console.log('🌱 Iniciando seed idempotente...')
  console.log('📋 Este script solo creará datos si no existen\n')

  // ============================================
  // 1. VERIFICAR Y CREAR TENANT
  // ============================================
  console.log('1️⃣  Verificando tenant...')
  
  let tenant = await prisma.tenant.findFirst({
    where: { email: 'contacto@bellavita.com' }
  })

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'Bella Vita Spa & Wellness',
        email: 'contacto@bellavita.com',
        phone: '+52 55 1234 5678',
        address: 'Avenida Reforma 123, Col. Centro',
        city: 'Ciudad de México',
        country: 'México'
      }
    })
    console.log('   ✅ Tenant creado:', tenant.name)
  } else {
    console.log('   ℹ️  Tenant ya existe:', tenant.name)
  }

  // ============================================
  // 2. VERIFICAR Y CREAR SUCURSAL
  // ============================================
  console.log('\n2️⃣  Verificando sucursal...')
  
  let branch = await prisma.branch.findFirst({
    where: { 
      tenantId: tenant.id,
      email: 'centro@bellavita.com'
    }
  })

  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        name: 'Sucursal Centro',
        address: 'Avenida Reforma 123, Col. Centro',
        phone: '+52 55 1234 5678',
        email: 'centro@bellavita.com',
        tenantId: tenant.id
      }
    })
    console.log('   ✅ Sucursal creada:', branch.name)
  } else {
    console.log('   ℹ️  Sucursal ya existe:', branch.name)
  }

  // ============================================
  // 3. VERIFICAR Y CREAR USUARIOS
  // ============================================
  console.log('\n3️⃣  Verificando usuarios...')
  
  const usersToCreate = [
    {
      email: 'admin@citaplanner.com',
      password: 'admin123',
      firstName: 'Administrador',
      lastName: 'Principal',
      role: 'ADMIN',
      phone: '+52 55 1111 1111'
    },
    {
      email: 'manager@citaplanner.com',
      password: 'manager123',
      firstName: 'Gerente',
      lastName: 'de Sucursal',
      role: 'MANAGER',
      phone: '+52 55 2222 2222'
    },
    {
      email: 'pro1@citaplanner.com',
      password: 'prof123',
      firstName: 'Estilista',
      lastName: 'Senior',
      role: 'PROFESSIONAL',
      phone: '+52 55 3333 3333'
    },
    {
      email: 'pro2@citaplanner.com',
      password: 'prof123',
      firstName: 'Barbero',
      lastName: 'Profesional',
      role: 'PROFESSIONAL',
      phone: '+52 55 4444 4444'
    },
    {
      email: 'recepcionista@citaplanner.com',
      password: 'prof123',
      firstName: 'Recepcionista',
      lastName: 'Principal',
      role: 'RECEPTIONIST',
      phone: '+52 55 5555 5555'
    }
  ]

  const createdUsers: any[] = []
  
  for (const userData of usersToCreate) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role as any,
          phone: userData.phone,
          tenantId: tenant.id,
          branchId: branch.id
        }
      })
      createdUsers.push(user)
      console.log(`   ✅ Usuario creado: ${user.email} (${user.role})`)
    } else {
      createdUsers.push(existingUser)
      console.log(`   ℹ️  Usuario ya existe: ${existingUser.email} (${existingUser.role})`)
    }
  }

  // Obtener referencias a usuarios específicos
  const adminUser = createdUsers.find(u => u.role === 'ADMIN')
  const professional1 = createdUsers.find(u => u.email === 'pro1@citaplanner.com')
  const professional2 = createdUsers.find(u => u.email === 'pro2@citaplanner.com')
  const receptionist = createdUsers.find(u => u.role === 'RECEPTIONIST')

  // ============================================
  // 4. VERIFICAR Y CREAR SERVICIOS
  // ============================================
  console.log('\n4️⃣  Verificando servicios...')
  
  const servicesToCreate = [
    {
      name: 'Facial Hidratante',
      description: 'Facial completo con productos hidratantes y masaje relajante',
      duration: 60,
      price: 850,
      color: '#3B82F6'
    },
    {
      name: 'Masaje Relajante',
      description: 'Masaje corporal completo con aceites esenciales',
      duration: 90,
      price: 1200,
      color: '#10B981'
    },
    {
      name: 'Manicure y Pedicure',
      description: 'Cuidado completo de manos y pies con esmaltado',
      duration: 120,
      price: 650,
      color: '#F59E0B'
    },
    {
      name: 'Corte de Cabello',
      description: 'Corte y peinado profesional',
      duration: 45,
      price: 450,
      color: '#8B5CF6'
    },
    {
      name: 'Limpieza Facial Profunda',
      description: 'Limpieza facial con extracción de impurezas',
      duration: 75,
      price: 950,
      color: '#EF4444'
    },
    {
      name: 'Masaje Terapéutico',
      description: 'Masaje especializado para dolores musculares',
      duration: 60,
      price: 1000,
      color: '#06B6D4'
    }
  ]

  const services: any[] = []
  
  for (const serviceData of servicesToCreate) {
    const existingService = await prisma.service.findFirst({
      where: {
        name: serviceData.name,
        tenantId: tenant.id
      }
    })

    if (!existingService) {
      const service = await prisma.service.create({
        data: {
          ...serviceData,
          tenantId: tenant.id
        }
      })
      services.push(service)
      console.log(`   ✅ Servicio creado: ${service.name}`)
    } else {
      services.push(existingService)
      console.log(`   ℹ️  Servicio ya existe: ${existingService.name}`)
    }
  }

  // ============================================
  // 5. VERIFICAR Y ASIGNAR SERVICIOS A PROFESIONALES
  // ============================================
  console.log('\n5️⃣  Verificando asignación de servicios...')
  
  const serviceAssignments = [
    { serviceIndex: 0, professional: professional1, commission: 40 }, // Facial Hidratante
    { serviceIndex: 4, professional: professional1, commission: 45 }, // Limpieza Facial
    { serviceIndex: 2, professional: professional1, commission: 30 }, // Manicure
    { serviceIndex: 1, professional: professional2, commission: 35 }, // Masaje Relajante
    { serviceIndex: 5, professional: professional2, commission: 40 }, // Masaje Terapéutico
    { serviceIndex: 3, professional: professional2, commission: 50 }  // Corte de Cabello
  ]

  for (const assignment of serviceAssignments) {
    const service = services[assignment.serviceIndex]
    const professional = assignment.professional

    if (!service || !professional) continue

    const existingAssignment = await prisma.serviceUser.findFirst({
      where: {
        serviceId: service.id,
        userId: professional.id
      }
    })

    if (!existingAssignment) {
      await prisma.serviceUser.create({
        data: {
          serviceId: service.id,
          userId: professional.id,
          commission: assignment.commission
        }
      })
      console.log(`   ✅ Servicio "${service.name}" asignado a ${professional.firstName}`)
    } else {
      console.log(`   ℹ️  Servicio "${service.name}" ya asignado a ${professional.firstName}`)
    }
  }

  // ============================================
  // 6. VERIFICAR Y CREAR CLIENTES
  // ============================================
  console.log('\n6️⃣  Verificando clientes...')
  
  const clientsToCreate = [
    {
      firstName: 'Isabella',
      lastName: 'Torres',
      email: 'isabella.torres@email.com',
      phone: '+52 55 1111 0001',
      address: 'Calle Madero 456, Col. Roma',
      notes: 'Cliente VIP, prefiere tratamientos relajantes'
    },
    {
      firstName: 'Diego',
      lastName: 'Hernández',
      email: 'diego.hernandez@email.com',
      phone: '+52 55 1111 0002',
      address: 'Avenida Insurgentes 789, Col. Condesa'
    },
    {
      firstName: 'Sofía',
      lastName: 'Ramírez',
      email: 'sofia.ramirez@email.com',
      phone: '+52 55 1111 0003',
      address: 'Boulevard Ávila Camacho 321, Col. Polanco',
      notes: 'Alérgica a productos con fragancia'
    },
    {
      firstName: 'Alejandro',
      lastName: 'Morales',
      email: 'alejandro.morales@email.com',
      phone: '+52 55 1111 0004',
      address: 'Calle Álvaro Obregón 654, Col. Coyoacán'
    },
    {
      firstName: 'Camila',
      lastName: 'Vega',
      email: 'camila.vega@email.com',
      phone: '+52 55 1111 0005',
      address: 'Paseo de la Reforma 987, Col. Juárez'
    },
    {
      firstName: 'Fernando',
      lastName: 'Castro',
      email: 'fernando.castro@email.com',
      phone: '+52 55 1111 0006',
      address: 'Avenida Chapultepec 147, Col. Doctores'
    }
  ]

  const clients: any[] = []
  
  for (const clientData of clientsToCreate) {
    const existingClient = await prisma.client.findFirst({
      where: {
        email: clientData.email,
        tenantId: tenant.id
      }
    })

    if (!existingClient) {
      const client = await prisma.client.create({
        data: {
          ...clientData,
          tenantId: tenant.id
        }
      })
      clients.push(client)
      console.log(`   ✅ Cliente creado: ${client.firstName} ${client.lastName}`)
    } else {
      clients.push(existingClient)
      console.log(`   ℹ️  Cliente ya existe: ${existingClient.firstName} ${existingClient.lastName}`)
    }
  }

  // ============================================
  // 7. VERIFICAR Y CREAR HORARIOS DE TRABAJO
  // ============================================
  console.log('\n7️⃣  Verificando horarios de trabajo...')
  
  const existingHours = await prisma.workingHours.findMany({
    where: { branchId: branch.id }
  })

  if (existingHours.length === 0) {
    const workingHoursData = []
    
    // Lunes a viernes (1-5)
    for (let day = 1; day <= 5; day++) {
      workingHoursData.push({
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
        branchId: branch.id
      })
    }
    
    // Sábado
    workingHoursData.push({
      dayOfWeek: 6,
      startTime: '10:00',
      endTime: '16:00',
      branchId: branch.id
    })

    await prisma.workingHours.createMany({
      data: workingHoursData
    })
    
    console.log(`   ✅ Horarios de trabajo creados (${workingHoursData.length} días)`)
  } else {
    console.log(`   ℹ️  Horarios de trabajo ya existen (${existingHours.length} días)`)
  }

  // ============================================
  // 8. VERIFICAR Y CREAR CITAS DE EJEMPLO
  // ============================================
  console.log('\n8️⃣  Verificando citas de ejemplo...')
  
  const existingAppointments = await prisma.appointment.findMany({
    where: { tenantId: tenant.id }
  })

  if (existingAppointments.length === 0 && clients.length > 0) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    const appointmentsData = [
      // Citas de hoy
      {
        startTime: new Date(today.getTime() + 10 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 11 * 60 * 60 * 1000),
        status: 'CONFIRMED',
        notes: 'Primera sesión del tratamiento',
        tenantId: tenant.id,
        branchId: branch.id,
        clientId: clients[0].id,
        serviceId: services[0].id,
        userId: professional1.id
      },
      {
        startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 15.5 * 60 * 60 * 1000),
        status: 'PENDING',
        tenantId: tenant.id,
        branchId: branch.id,
        clientId: clients[1].id,
        serviceId: services[1].id,
        userId: professional2.id
      },
      // Cita de mañana
      {
        startTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 12.25 * 60 * 60 * 1000),
        status: 'CONFIRMED',
        tenantId: tenant.id,
        branchId: branch.id,
        clientId: clients[2].id,
        serviceId: services[4].id,
        userId: professional1.id
      },
      // Citas completadas (semana pasada)
      {
        startTime: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000),
        status: 'COMPLETED',
        notes: 'Cliente muy satisfecha con el resultado',
        tenantId: tenant.id,
        branchId: branch.id,
        clientId: clients[3].id,
        serviceId: services[2].id,
        userId: professional1.id
      },
      {
        startTime: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
        status: 'COMPLETED',
        tenantId: tenant.id,
        branchId: branch.id,
        clientId: clients[4].id,
        serviceId: services[5].id,
        userId: professional2.id
      },
      {
        startTime: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000 + 13.75 * 60 * 60 * 1000),
        status: 'COMPLETED',
        tenantId: tenant.id,
        branchId: branch.id,
        clientId: clients[5].id,
        serviceId: services[3].id,
        userId: professional2.id
      }
    ]

    const createdAppointments = await Promise.all(
      appointmentsData.map(data => prisma.appointment.create({ data }))
    )
    
    console.log(`   ✅ Citas de ejemplo creadas: ${createdAppointments.length}`)

    // Crear pagos para citas completadas
    const completedAppointments = createdAppointments.filter(apt => apt.status === 'COMPLETED')
    
    if (completedAppointments.length > 0 && receptionist) {
      const paymentsData = completedAppointments.map(appointment => {
        const service = services.find(s => s.id === appointment.serviceId)
        
        return {
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

      await Promise.all(
        paymentsData.map(data => prisma.payment.create({ data: data as any }))
      )
      
      console.log(`   ✅ Pagos creados: ${paymentsData.length}`)
    }
  } else {
    console.log(`   ℹ️  Citas ya existen (${existingAppointments.length} citas)`)
  }

  // ============================================
  // RESUMEN FINAL
  // ============================================
  console.log('\n' + '═'.repeat(60))
  console.log('🎉 SEED COMPLETADO EXITOSAMENTE')
  console.log('═'.repeat(60))
  
  const finalCounts = {
    tenants: await prisma.tenant.count(),
    branches: await prisma.branch.count(),
    users: await prisma.user.count(),
    services: await prisma.service.count(),
    clients: await prisma.client.count(),
    appointments: await prisma.appointment.count(),
    payments: await prisma.payment.count()
  }

  console.log('\n📊 Estado actual de la base de datos:')
  console.log(`   • Empresas: ${finalCounts.tenants}`)
  console.log(`   • Sucursales: ${finalCounts.branches}`)
  console.log(`   • Usuarios: ${finalCounts.users}`)
  console.log(`   • Servicios: ${finalCounts.services}`)
  console.log(`   • Clientes: ${finalCounts.clients}`)
  console.log(`   • Citas: ${finalCounts.appointments}`)
  console.log(`   • Pagos: ${finalCounts.payments}`)
  
  console.log('\n🔑 Credenciales de acceso:')
  console.log('   Admin: admin@citaplanner.com / admin123')
  console.log('   Manager: manager@citaplanner.com / manager123')
  console.log('   Profesional 1: pro1@citaplanner.com / prof123')
  console.log('   Profesional 2: pro2@citaplanner.com / prof123')
  console.log('   Recepcionista: recepcionista@citaplanner.com / prof123')
  // ============================================
  // 10. VERIFICAR Y CREAR PLANTILLAS DE NOTIFICACIONES
  // ============================================
  console.log('\n🔔 Verificando plantillas de notificaciones...')
  
  const defaultTemplates = [
    // WhatsApp Templates
    {
      name: 'Recordatorio de Cita - WhatsApp',
      type: 'APPOINTMENT_REMINDER',
      channel: 'WHATSAPP',
      subject: null,
      message: 'Hola {{clientName}}, te recordamos tu cita el {{appointmentDate}} a las {{appointmentTime}} para {{serviceName}}. ¡Te esperamos en {{businessName}}!',
      isActive: true,
      isDefault: true,
      tenantId: tenant.id,
    },
    {
      name: 'Confirmación de Cita - WhatsApp',
      type: 'APPOINTMENT_CONFIRMATION',
      channel: 'WHATSAPP',
      subject: null,
      message: '¡Cita confirmada! {{clientName}}, tu cita está programada para el {{appointmentDate}} a las {{appointmentTime}} para {{serviceName}}. Nos vemos en {{businessName}}.',
      isActive: true,
      isDefault: true,
      tenantId: tenant.id,
    },
    {
      name: 'Cancelación de Cita - WhatsApp',
      type: 'APPOINTMENT_CANCELLATION',
      channel: 'WHATSAPP',
      subject: null,
      message: 'Hola {{clientName}}, tu cita del {{appointmentDate}} a las {{appointmentTime}} ha sido cancelada. Si deseas reagendar, contáctanos en {{businessPhone}}.',
      isActive: true,
      isDefault: true,
      tenantId: tenant.id,
    },
    {
      name: 'Reprogramación de Cita - WhatsApp',
      type: 'APPOINTMENT_RESCHEDULE',
      channel: 'WHATSAPP',
      subject: null,
      message: 'Hola {{clientName}}, tu cita ha sido reprogramada para el {{appointmentDate}} a las {{appointmentTime}}. ¡Te esperamos!',
      isActive: true,
      isDefault: true,
      tenantId: tenant.id,
    },
    {
      name: 'Promoción - WhatsApp',
      type: 'PROMOTION',
      channel: 'WHATSAPP',
      subject: null,
      message: '¡Oferta especial en {{businessName}}! {{promotionMessage}} Válido hasta {{promotionValidUntil}}. ¡No te lo pierdas!',
      isActive: true,
      isDefault: true,
      tenantId: tenant.id,
    },
    {
      name: 'Recordatorio de Pago - WhatsApp',
      type: 'PAYMENT_REMINDER',
      channel: 'WHATSAPP',
      subject: null,
      message: 'Hola {{clientName}}, tienes un pago pendiente de {{amount}}. Por favor, realiza tu pago antes del {{dueDate}}. Gracias.',
      isActive: true,
      isDefault: true,
      tenantId: tenant.id,
    },
    // Push Notification Templates
    {
      name: 'Recordatorio de Cita - Push',
      type: 'APPOINTMENT_REMINDER',
      channel: 'PUSH',
      subject: 'Recordatorio de Cita',
      message: 'Tu cita para {{serviceName}} es el {{appointmentDate}} a las {{appointmentTime}}',
      isActive: true,
      isDefault: true,
      tenantId: tenant.id,
    },
    {
      name: 'Confirmación de Cita - Push',
      type: 'APPOINTMENT_CONFIRMATION',
      channel: 'PUSH',
      subject: 'Cita Confirmada',
      message: 'Tu cita para {{serviceName}} ha sido confirmada para el {{appointmentDate}} a las {{appointmentTime}}',
      isActive: true,
      isDefault: true,
      tenantId: tenant.id,
    },
    {
      name: 'Cancelación de Cita - Push',
      type: 'APPOINTMENT_CANCELLATION',
      channel: 'PUSH',
      subject: 'Cita Cancelada',
      message: 'Tu cita del {{appointmentDate}} a las {{appointmentTime}} ha sido cancelada',
      isActive: true,
      isDefault: true,
      tenantId: tenant.id,
    },
    {
      name: 'Promoción - Push',
      type: 'PROMOTION',
      channel: 'PUSH',
      subject: 'Oferta Especial',
      message: '{{promotionMessage}}',
      isActive: true,
      isDefault: true,
      tenantId: tenant.id,
    },
  ]

  let templatesCreated = 0
  let templatesExisting = 0

  for (const templateData of defaultTemplates) {
    const existing = await prisma.notificationTemplate.findFirst({
      where: {
        name: templateData.name,
        type: templateData.type,
        channel: templateData.channel,
      }
    })

    if (!existing) {
      await prisma.notificationTemplate.create({
        data: templateData
      })
      templatesCreated++
      console.log(`   ✅ Plantilla creada: ${templateData.name}`)
    } else {
      templatesExisting++
    }
  }

  if (templatesCreated > 0) {
    console.log(`   📝 ${templatesCreated} plantillas creadas`)
  }
  if (templatesExisting > 0) {
    console.log(`   ℹ️  ${templatesExisting} plantillas ya existían`)
  }

  console.log('\n' + '═'.repeat(60))
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
