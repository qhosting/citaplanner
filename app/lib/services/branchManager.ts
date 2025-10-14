
import { prisma } from '@/lib/prisma';
import { Branch } from '@prisma/client';

export interface CreateBranchData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
  tenantId: string;
}

export interface UpdateBranchData {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export class BranchManager {
  /**
   * Crear una nueva sucursal
   */
  async createBranch(data: CreateBranchData): Promise<Branch> {
    try {
      const branch = await prisma.branch.create({
        data: {
          name: data.name,
          address: data.address,
          phone: data.phone,
          email: data.email,
          isActive: data.isActive !== false,
          tenantId: data.tenantId,
        },
        include: {
          tenant: true,
        },
      });

      console.log(`[BranchManager] Sucursal creada: ${branch.id}`);
      return branch;
    } catch (error) {
      console.error('[BranchManager] Error al crear sucursal:', error);
      throw error;
    }
  }

  /**
   * Obtener una sucursal por ID
   */
  async getBranch(id: string, tenantId: string): Promise<Branch | null> {
    try {
      const branch = await prisma.branch.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          tenant: true,
          users: {
            where: { isActive: true },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          workingHours: true,
        },
      });

      return branch;
    } catch (error) {
      console.error('[BranchManager] Error al obtener sucursal:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las sucursales de un tenant
   */
  async getBranchesByTenant(
    tenantId: string,
    includeInactive = false
  ): Promise<Branch[]> {
    try {
      const branches = await prisma.branch.findMany({
        where: {
          tenantId,
          ...(includeInactive ? {} : { isActive: true }),
        },
        include: {
          users: {
            where: { isActive: true },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          workingHours: true,
        },
        orderBy: [
          { isActive: 'desc' },
          { name: 'asc' },
        ],
      });

      console.log(`[BranchManager] Encontradas ${branches.length} sucursales para tenant ${tenantId}`);
      return branches;
    } catch (error) {
      console.error('[BranchManager] Error al obtener sucursales:', error);
      throw error;
    }
  }

  /**
   * Actualizar una sucursal
   */
  async updateBranch(
    id: string,
    tenantId: string,
    data: UpdateBranchData
  ): Promise<Branch> {
    try {
      // Verificar que la sucursal existe y pertenece al tenant
      const existing = await this.getBranch(id, tenantId);
      if (!existing) {
        throw new Error('Sucursal no encontrada o acceso denegado');
      }

      const branch = await prisma.branch.update({
        where: { id },
        data: {
          name: data.name,
          address: data.address,
          phone: data.phone,
          email: data.email,
          isActive: data.isActive,
        },
        include: {
          tenant: true,
          users: {
            where: { isActive: true },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      });

      console.log(`[BranchManager] Sucursal actualizada: ${branch.id}`);
      return branch;
    } catch (error) {
      console.error('[BranchManager] Error al actualizar sucursal:', error);
      throw error;
    }
  }

  /**
   * Eliminar (desactivar) una sucursal
   */
  async deleteBranch(id: string, tenantId: string): Promise<Branch> {
    try {
      // Verificar que la sucursal existe y pertenece al tenant
      const existing = await this.getBranch(id, tenantId);
      if (!existing) {
        throw new Error('Sucursal no encontrada o acceso denegado');
      }

      // Verificar si tiene usuarios asignados
      const usersCount = await prisma.user.count({
        where: {
          branchId: id,
          isActive: true,
        },
      });

      if (usersCount > 0) {
        throw new Error(`USERS_ASSIGNED:${usersCount}`);
      }

      // Verificar si tiene citas futuras
      const futureAppointments = await prisma.appointment.count({
        where: {
          branchId: id,
          startTime: {
            gte: new Date(),
          },
        },
      });

      if (futureAppointments > 0) {
        throw new Error(`APPOINTMENTS_EXIST:${futureAppointments}`);
      }

      // Desactivar en lugar de eliminar
      const branch = await prisma.branch.update({
        where: { id },
        data: { isActive: false },
        include: {
          tenant: true,
        },
      });

      console.log(`[BranchManager] Sucursal desactivada: ${branch.id}`);
      return branch;
    } catch (error) {
      console.error('[BranchManager] Error al eliminar sucursal:', error);
      throw error;
    }
  }

  /**
   * Buscar sucursales por nombre
   */
  async searchBranches(tenantId: string, query: string): Promise<Branch[]> {
    try {
      const branches = await prisma.branch.findMany({
        where: {
          tenantId,
          isActive: true,
          name: { contains: query, mode: 'insensitive' },
        },
        include: {
          users: {
            where: { isActive: true },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      return branches;
    } catch (error) {
      console.error('[BranchManager] Error al buscar sucursales:', error);
      throw error;
    }
  }
}

export const branchManager = new BranchManager();
