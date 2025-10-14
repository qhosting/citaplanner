
import { prisma } from '@/lib/prisma';
import { User, UserRole } from '@prisma/client';

export interface CreateProfessionalData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  password?: string;
  specialties?: string[]; // Array de especialidades
  dateOfBirth?: Date;
  branchId?: string;
  isActive?: boolean;
  tenantId: string;
}

export interface UpdateProfessionalData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  specialties?: string[];
  dateOfBirth?: Date;
  branchId?: string;
  isActive?: boolean;
}

export class ProfessionalManager {
  /**
   * Crear un nuevo profesional
   */
  async createProfessional(data: CreateProfessionalData): Promise<User> {
    try {
      // Verificar si el email ya existe
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      // Crear el profesional con rol PROFESSIONAL
      const professional = await prisma.user.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          avatar: data.avatar,
          password: data.password, // En producción, debe estar hasheado
          role: UserRole.PROFESSIONAL,
          isActive: data.isActive !== false,
          tenantId: data.tenantId,
          branchId: data.branchId,
        },
        include: {
          branch: true,
          tenant: true,
        },
      });

      console.log(`[ProfessionalManager] Profesional creado: ${professional.id}`);
      return professional;
    } catch (error) {
      console.error('[ProfessionalManager] Error al crear profesional:', error);
      throw error;
    }
  }

  /**
   * Obtener un profesional por ID
   */
  async getProfessional(id: string, tenantId: string): Promise<User | null> {
    try {
      const professional = await prisma.user.findFirst({
        where: {
          id,
          tenantId,
          role: UserRole.PROFESSIONAL,
        },
        include: {
          branch: true,
          tenant: true,
          workingHours: true,
          serviceUsers: {
            include: {
              service: true,
            },
          },
        },
      });

      return professional;
    } catch (error) {
      console.error('[ProfessionalManager] Error al obtener profesional:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los profesionales de un tenant
   */
  async getProfessionalsByTenant(
    tenantId: string,
    includeInactive = false
  ): Promise<User[]> {
    try {
      const professionals = await prisma.user.findMany({
        where: {
          tenantId,
          role: UserRole.PROFESSIONAL,
          ...(includeInactive ? {} : { isActive: true }),
        },
        include: {
          branch: true,
          workingHours: true,
          serviceUsers: {
            include: {
              service: true,
            },
          },
        },
        orderBy: [
          { isActive: 'desc' },
          { firstName: 'asc' },
        ],
      });

      console.log(`[ProfessionalManager] Encontrados ${professionals.length} profesionales para tenant ${tenantId}`);
      return professionals;
    } catch (error) {
      console.error('[ProfessionalManager] Error al obtener profesionales:', error);
      throw error;
    }
  }

  /**
   * Actualizar un profesional
   */
  async updateProfessional(
    id: string,
    tenantId: string,
    data: UpdateProfessionalData
  ): Promise<User> {
    try {
      // Verificar que el profesional existe y pertenece al tenant
      const existing = await this.getProfessional(id, tenantId);
      if (!existing) {
        throw new Error('Profesional no encontrado o acceso denegado');
      }

      // Si se está actualizando el email, verificar que no exista
      if (data.email && data.email !== existing.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: data.email },
        });

        if (emailExists) {
          throw new Error('El email ya está registrado');
        }
      }

      const professional = await prisma.user.update({
        where: { id },
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          avatar: data.avatar,
          branchId: data.branchId,
          isActive: data.isActive,
        },
        include: {
          branch: true,
          tenant: true,
          workingHours: true,
        },
      });

      console.log(`[ProfessionalManager] Profesional actualizado: ${professional.id}`);
      return professional;
    } catch (error) {
      console.error('[ProfessionalManager] Error al actualizar profesional:', error);
      throw error;
    }
  }

  /**
   * Eliminar (desactivar) un profesional
   */
  async deleteProfessional(id: string, tenantId: string): Promise<User> {
    try {
      // Verificar que el profesional existe y pertenece al tenant
      const existing = await this.getProfessional(id, tenantId);
      if (!existing) {
        throw new Error('Profesional no encontrado o acceso denegado');
      }

      // Verificar si tiene citas futuras
      const futureAppointments = await prisma.appointment.count({
        where: {
          userId: id,
          startTime: {
            gte: new Date(),
          },
        },
      });

      if (futureAppointments > 0) {
        throw new Error(`APPOINTMENTS_EXIST:${futureAppointments}`);
      }

      // Desactivar en lugar de eliminar
      const professional = await prisma.user.update({
        where: { id },
        data: { isActive: false },
        include: {
          branch: true,
          tenant: true,
        },
      });

      console.log(`[ProfessionalManager] Profesional desactivado: ${professional.id}`);
      return professional;
    } catch (error) {
      console.error('[ProfessionalManager] Error al eliminar profesional:', error);
      throw error;
    }
  }

  /**
   * Buscar profesionales por nombre o email
   */
  async searchProfessionals(
    tenantId: string,
    query: string
  ): Promise<User[]> {
    try {
      const professionals = await prisma.user.findMany({
        where: {
          tenantId,
          role: UserRole.PROFESSIONAL,
          isActive: true,
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          branch: true,
        },
        orderBy: {
          firstName: 'asc',
        },
      });

      return professionals;
    } catch (error) {
      console.error('[ProfessionalManager] Error al buscar profesionales:', error);
      throw error;
    }
  }
}

export const professionalManager = new ProfessionalManager();
