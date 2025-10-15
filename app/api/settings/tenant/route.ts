
/**
 * API: Tenant Settings
 * 
 * Endpoint para actualizar configuración de empresa (solo ADMIN)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { PrismaClient, UserRole } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema de validación
const tenantUpdateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  email: z.string().email('Email inválido').optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  logo: z.string().url('URL inválida').optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color inválido').optional(),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color inválido').optional(),
  allowOnlineBooking: z.boolean().optional(),
  requireClientPhone: z.boolean().optional(),
  requireClientEmail: z.boolean().optional(),
  bookingAdvanceDays: z.number().int().min(1).max(365).optional(),
});

/**
 * GET - Obtener configuración actual del tenant
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true, role: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        timezone: true,
        currency: true,
        logo: true,
        primaryColor: true,
        secondaryColor: true,
        allowOnlineBooking: true,
        requireClientPhone: true,
        requireClientEmail: true,
        bookingAdvanceDays: true,
      }
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: tenant });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener configuración' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Actualizar configuración del tenant (solo ADMIN)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true, role: true }
    });

    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'No autorizado. Solo administradores pueden modificar configuración de empresa.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = tenantUpdateSchema.parse(body);

    const updatedTenant = await prisma.tenant.update({
      where: { id: user.tenantId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        timezone: true,
        currency: true,
        logo: true,
        primaryColor: true,
        secondaryColor: true,
        allowOnlineBooking: true,
        requireClientPhone: true,
        requireClientEmail: true,
        bookingAdvanceDays: true,
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: updatedTenant,
      message: 'Configuración actualizada exitosamente'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating tenant:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar configuración' },
      { status: 500 }
    );
  }
}
