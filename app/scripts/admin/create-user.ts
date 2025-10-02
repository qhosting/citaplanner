#!/usr/bin/env tsx
/**
 * Script para crear usuarios manualmente desde la línea de comandos
 * Uso: tsx scripts/admin/create-user.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function createUser() {
  try {
    console.log('🔧 Creador de Usuarios - CitaPlanner\n')

    // Obtener datos del usuario
    const email = await question('Email del usuario: ')
    const password = await question('Contraseña: ')
    const firstName = await question('Nombre: ')
    const lastName = await question('Apellido: ')
    const phone = await question('Teléfono (opcional): ')
    
    console.log('\nRoles disponibles:')
    console.log('1. SUPERADMIN - Acceso total al sistema')
    console.log('2. ADMIN - Administrador de tenant')
    console.log('3. MANAGER - Gerente de sucursal')
    console.log('4. PROFESSIONAL - Profesional/Staff')
    console.log('5. RECEPTIONIST - Recepcionista')
    
    const roleChoice = await question('\nSeleccione rol (1-5): ')
    
    const roleMap: { [key: string]: string } = {
      '1': 'SUPERADMIN',
      '2': 'ADMIN',
      '3': 'MANAGER',
      '4': 'PROFESSIONAL',
      '5': 'RECEPTIONIST'
    }
    
    const role = roleMap[roleChoice] || 'PROFESSIONAL'

    // Listar tenants disponibles (tenantId es requerido)
    const tenants = await prisma.tenant.findMany({
      select: { id: true, name: true }
    })

    if (tenants.length === 0) {
      console.log('\n⚠️  No hay tenants disponibles. Cree uno primero.')
      rl.close()
      return
    }

    let tenantId: string
    let branchId: string | undefined

    if (tenants.length === 1) {
      // Si solo hay un tenant, usarlo automáticamente
      tenantId = tenants[0].id
      console.log(`\nUsando tenant: ${tenants[0].name}`)
    } else {
      console.log('\nTenants disponibles:')
      tenants.forEach((t, idx) => {
        console.log(`${idx + 1}. ${t.name} (ID: ${t.id})`)
      })

      const tenantChoice = await question('\nSeleccione tenant (número): ')
      const selectedTenant = tenants[parseInt(tenantChoice) - 1]
      
      if (!selectedTenant) {
        console.log('❌ Tenant inválido')
        rl.close()
        return
      }

      tenantId = selectedTenant.id
    }

    // Listar branches del tenant
    const branches = await prisma.branch.findMany({
      where: { tenantId },
      select: { id: true, name: true }
    })

    if (branches.length === 0) {
      console.log('\n⚠️  No hay sucursales disponibles para este tenant.')
      branchId = undefined
    } else if (branches.length === 1) {
      branchId = branches[0].id
      console.log(`Usando sucursal: ${branches[0].name}`)
    } else {
      console.log('\nSucursales disponibles:')
      branches.forEach((b, idx) => {
        console.log(`${idx + 1}. ${b.name} (ID: ${b.id})`)
      })

      const branchChoice = await question('\nSeleccione sucursal (número): ')
      const selectedBranch = branches[parseInt(branchChoice) - 1]
      
      if (!selectedBranch) {
        console.log('❌ Sucursal inválida')
        rl.close()
        return
      }

      branchId = selectedBranch.id
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || undefined,
        role: role as any,
        tenantId,
        branchId
      }
    })

    console.log('\n✅ Usuario creado exitosamente!')
    console.log('📧 Email:', user.email)
    console.log('👤 Nombre:', `${user.firstName} ${user.lastName}`)
    console.log('🔑 Rol:', user.role)
    console.log('🆔 ID:', user.id)

  } catch (error) {
    console.error('❌ Error al crear usuario:', error)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

createUser()
