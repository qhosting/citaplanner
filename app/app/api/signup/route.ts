
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, companyName } = body

    // Validar campos requeridos
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 400 }
      )
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear tenant y usuario en una transacción
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Crear el tenant
      const tenant = await tx.tenant.create({
        data: {
          name: companyName || `${firstName} ${lastName} Business`
        }
      })

      // Crear sucursal principal
      const branch = await tx.branch.create({
        data: {
          name: 'Sucursal Principal',
          tenantId: tenant.id
        }
      })

      // Crear usuario administrador
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'ADMIN',
          tenantId: tenant.id,
          branchId: branch.id
        }
      })

      return { user, tenant, branch }
    })

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName
      }
    })

  } catch (error) {
    console.error('Error creando usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
