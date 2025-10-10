/**
 * Client Service
 * Manages client operations using the simple Client model
 */

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface CreateClientInput {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address?: string;
  birthday?: Date;
  notes?: string;
  tenantId: string;
}

export interface UpdateClientInput extends Partial<CreateClientInput> {
  id: string;
}

export interface ClientFilters {
  tenantId: string;
  search?: string;
  isActive?: boolean;
  skip?: number;
  take?: number;
}

/**
 * Create a new client
 */
export async function createClient(data: CreateClientInput) {
  try {
    // Validate tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: data.tenantId },
    });

    if (!tenant) {
      console.error(`❌ Tenant not found: ${data.tenantId}`);
      console.error('📊 User session tenantId:', data.tenantId);
      
      // List available tenants for debugging
      const availableTenants = await prisma.tenant.findMany({
        select: { id: true, name: true, email: true, isActive: true }
      });
      console.error('📋 Available tenants:', JSON.stringify(availableTenants, null, 2));
      
      throw new Error(
        `Tenant no encontrado (${data.tenantId}). ` +
        'Verifique que su cuenta esté correctamente configurada. ' +
        'Si el problema persiste, contacte al administrador.'
      );
    }

    // Check if client with same phone already exists for this tenant
    const existingClient = await prisma.client.findUnique({
      where: {
        phone_tenantId: {
          phone: data.phone,
          tenantId: data.tenantId,
        },
      },
    });

    if (existingClient) {
      throw new Error('Ya existe un cliente con este número de teléfono');
    }

    const client = await prisma.client.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        birthday: data.birthday,
        notes: data.notes,
        tenantId: data.tenantId,
        isActive: true,
      },
    });

    return { success: true, data: client };
  } catch (error) {
    console.error('Error creating client:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear el cliente',
    };
  }
}

/**
 * Get client by ID
 */
export async function getClient(id: string) {
  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        appointments: {
          orderBy: { startTime: 'desc' },
          take: 10,
          include: {
            service: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        sales: {
          orderBy: { saleDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!client) {
      return { success: false, error: 'Cliente no encontrado' };
    }

    return { success: true, data: client };
  } catch (error) {
    console.error('Error fetching client:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener el cliente',
    };
  }
}

/**
 * Update client
 */
export async function updateClient(data: UpdateClientInput) {
  try {
    const { id, ...updateData } = data;

    // If phone is being updated, check for duplicates
    if (updateData.phone) {
      const existingClient = await prisma.client.findFirst({
        where: {
          phone: updateData.phone,
          tenantId: updateData.tenantId,
          id: { not: id },
        },
      });

      if (existingClient) {
        throw new Error('Ya existe otro cliente con este número de teléfono');
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    return { success: true, data: client };
  } catch (error) {
    console.error('Error updating client:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el cliente',
    };
  }
}

/**
 * Delete client (soft delete)
 */
export async function deleteClient(id: string) {
  try {
    const client = await prisma.client.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, data: client };
  } catch (error) {
    console.error('Error deleting client:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar el cliente',
    };
  }
}

/**
 * List clients with filters
 */
export async function listClients(filters: ClientFilters) {
  try {
    const { tenantId, search, isActive = true, skip = 0, take = 50 } = filters;

    const where: Prisma.ClientWhereInput = {
      tenantId,
      isActive,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ]);

    return {
      success: true,
      data: clients,
      pagination: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    };
  } catch (error) {
    console.error('Error listing clients:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al listar clientes',
    };
  }
}

/**
 * Get client statistics
 */
export async function getClientStats(clientId: string) {
  try {
    const [appointmentCount, totalSpent, lastAppointment] = await Promise.all([
      prisma.appointment.count({
        where: { clientId, status: 'COMPLETED' },
      }),
      prisma.payment.aggregate({
        where: { clientId },
        _sum: { amount: true },
      }),
      prisma.appointment.findFirst({
        where: { clientId },
        orderBy: { startTime: 'desc' },
        include: { service: true },
      }),
    ]);

    return {
      success: true,
      data: {
        totalAppointments: appointmentCount,
        totalSpent: totalSpent._sum.amount || 0,
        lastVisit: lastAppointment?.startTime || null,
        lastService: lastAppointment?.service?.name || null,
      },
    };
  } catch (error) {
    console.error('Error fetching client stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener estadísticas',
    };
  }
}
