
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // ELIMINAR TODOS LOS USUARIOS EXISTENTES
  console.log('🗑️  Eliminando usuarios existentes...')
  await prisma.user.deleteMany({})
  console.log('✅ Usuarios eliminados')

  // Crear tenant de prueba
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

  console.log('✅ Tenant creado:', tenant.name)

  // Crear sucursal principal
  const branch = await prisma.branch.create({
    data: {
      name: 'Sucursal Centro',
      address: 'Avenida Reforma 123, Col. Centro',
      phone: '+52 55 1234 5678',
      email: 'centro@bellavita.com',
      tenantId: tenant.id
    }
  })

  console.log('✅ Sucursal creada:', branch.name)

  // Hashear contraseñas para los nuevos usuarios
  const adminPassword = await bcrypt.hash('admin123', 10)
  const managerPassword = await bcrypt.hash('manager123', 10)
  const professionalPassword = await bcrypt.hash('prof123', 10)

  // Crear los 5 nuevos usuarios con credenciales en español
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

  console.log('✅ Usuarios creados')

  // Crear servicios
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Facial Hidratante',
        description: 'Facial completo con productos hidratantes y masaje relajante',
        duration: 60,
        price: 850,
        color: '#3B82F6',
        tenantId: tenant.id
      }
    }),
    prisma.service.create({
      data: {
        name: 'Masaje Relajante',
        description: 'Masaje corporal completo con aceites esenciales',
        duration: 90,
        price: 1200,
        color: '#10B981',
        tenantId: tenant.id
      }
    }),
    prisma.service.create({
      data: {
        name: 'Manicure y Pedicure',
        description: 'Cuidado completo de manos y pies con esmaltado',
        duration: 120,
        price: 650,
        color: '#F59E0B',
        tenantId: tenant.id
      }
    }),
    prisma.service.create({
      data: {
        name: 'Corte de Cabello',
        description: 'Corte y peinado profesional',
        duration: 45,
        price: 450,
        color: '#8B5CF6',
        tenantId: tenant.id
      }
    }),
    prisma.service.create({
      data: {
        name: 'Limpieza Facial Profunda',
        description: 'Limpieza facial con extracción de impurezas',
        duration: 75,
        price: 950,
        color: '#EF4444',
        tenantId: tenant.id
      }
    }),
    prisma.service.create({
      data: {
        name: 'Masaje Terapéutico',
        description: 'Masaje especializado para dolores musculares',
        duration: 60,
        price: 1000,
        color: '#06B6D4',
        tenantId: tenant.id
      }
    })
  ])

  console.log('✅ Servicios creados:', services.length)

  // Asignar servicios a profesionales
  await Promise.all([
    // Estilista Senior - Especialista en faciales y cuidado de la piel
    prisma.serviceUser.create({
      data: {
        serviceId: services[0].id, // Facial Hidratante
        userId: professional1.id,
        commission: 40
      }
    }),
    prisma.serviceUser.create({
      data: {
        serviceId: services[4].id, // Limpieza Facial Profunda
        userId: professional1.id,
        commission: 45
      }
    }),
    
    // Barbero - Especialista en masajes
    prisma.serviceUser.create({
      data: {
        serviceId: services[1].id, // Masaje Relajante
        userId: professional2.id,
        commission: 35
      }
    }),
    prisma.serviceUser.create({
      data: {
        serviceId: services[5].id, // Masaje Terapéutico
        userId: professional2.id,
        commission: 40
      }
    }),
    
    // Estilista Senior también hace manicure
    prisma.serviceUser.create({
      data: {
        serviceId: services[2].id, // Manicure y Pedicure
        userId: professional1.id,
        commission: 30
      }
    }),
    
    // Barbero también hace cortes
    prisma.serviceUser.create({
      data: {
        serviceId: services[3].id, // Corte de Cabello
        userId: professional2.id,
        commission: 50
      }
    })
  ])

  console.log('✅ Servicios asignados a profesionales')

  // Crear clientes
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        firstName: 'Isabella',
        lastName: 'Torres',
        email: 'isabella.torres@email.com',
        phone: '+52 55 1111 0001',
        address: 'Calle Madero 456, Col. Roma',
        notes: 'Cliente VIP, prefiere tratamientos relajantes',
        tenantId: tenant.id
      }
    }),
    prisma.client.create({
      data: {
        firstName: 'Diego',
        lastName: 'Hernández',
        email: 'diego.hernandez@email.com',
        phone: '+52 55 1111 0002',
        address: 'Avenida Insurgentes 789, Col. Condesa',
        tenantId: tenant.id
      }
    }),
    prisma.client.create({
      data: {
        firstName: 'Sofía',
        lastName: 'Ramírez',
        email: 'sofia.ramirez@email.com',
        phone: '+52 55 1111 0003',
        address: 'Boulevard Ávila Camacho 321, Col. Polanco',
        notes: 'Alérgica a productos con fragancia',
        tenantId: tenant.id
      }
    }),
    prisma.client.create({
      data: {
        firstName: 'Alejandro',
        lastName: 'Morales',
        email: 'alejandro.morales@email.com',
        phone: '+52 55 1111 0004',
        address: 'Calle Álvaro Obregón 654, Col. Coyoacán',
        tenantId: tenant.id
      }
    }),
    prisma.client.create({
      data: {
        firstName: 'Camila',
        lastName: 'Vega',
        email: 'camila.vega@email.com',
        phone: '+52 55 1111 0005',
        address: 'Paseo de la Reforma 987, Col. Juárez',
        tenantId: tenant.id
      }
    }),
    prisma.client.create({
      data: {
        firstName: 'Fernando',
        lastName: 'Castro',
        email: 'fernando.castro@email.com',
        phone: '+52 55 1111 0006',
        address: 'Avenida Chapultepec 147, Col. Doctores',
        tenantId: tenant.id
      }
    })
  ])

  console.log('✅ Clientes creados:', clients.length)

  // Crear horarios de trabajo
  const workingHours: any[] = []
  // Horarios de lunes a viernes (1-5)
  for (let day = 1; day <= 5; day++) {
    workingHours.push(
      prisma.workingHours.create({
        data: {
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
          branchId: branch.id
        }
      })
    )
  }
  
  // Sábados
  workingHours.push(
    prisma.workingHours.create({
      data: {
        dayOfWeek: 6,
        startTime: '10:00',
        endTime: '16:00',
        branchId: branch.id
      }
    })
  )

  await Promise.all(workingHours)

  console.log('✅ Horarios de trabajo creados')

  // Crear citas de ejemplo
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const appointments = await Promise.all([
    // Citas de hoy
    prisma.appointment.create({
      data: {
        startTime: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10:00 AM
        endTime: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11:00 AM
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
        startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2:00 PM
        endTime: new Date(today.getTime() + 15.5 * 60 * 60 * 1000), // 3:30 PM
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
        startTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), // Mañana 11:00 AM
        endTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 12.25 * 60 * 60 * 1000), // 12:15 PM
        status: 'CONFIRMED',
        tenantId: tenant.id,
        branchId: branch.id,
        clientId: clients[2].id,
        serviceId: services[4].id,
        userId: professional1.id
      }
    }),

    // Citas de la semana pasada (completadas)
    prisma.appointment.create({
      data: {
        startTime: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // Hace 3 días
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
        startTime: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000), // Hace 2 días
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
        startTime: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000), // Ayer
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

  console.log('✅ Citas creadas:', appointments.length)

  // Crear pagos para las citas completadas
  const completedAppointments = appointments.filter(apt => apt.status === 'COMPLETED')
  
  const payments = await Promise.all(completedAppointments.map(appointment => {
    // Obtener el servicio para el precio
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

  console.log('✅ Pagos creados:', payments.length)

  console.log('\n🎉 Seed completado exitosamente!')
  console.log('\n📋 Datos creados:')
  console.log(`   • 1 Empresa: ${tenant.name}`)
  console.log(`   • 1 Sucursal: ${branch.name}`)
  console.log(`   • 5 Usuarios (1 Admin, 1 Manager, 2 Profesionales, 1 Recepcionista)`)
  console.log(`   • ${services.length} Servicios`)
  console.log(`   • ${clients.length} Clientes`)
  console.log(`   • ${appointments.length} Citas`)
  console.log(`   • ${payments.length} Pagos`)
  console.log('\n🔑 Credenciales de acceso:')
  console.log('   Admin: admin@citaplanner.com / admin123')
  console.log('   Manager: manager@citaplanner.com / manager123')
  console.log('   Profesional 1: pro1@citaplanner.com / prof123')
  console.log('   Profesional 2: pro2@citaplanner.com / prof123')
  console.log('   Recepcionista: recepcionista@citaplanner.com / prof123')
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
