
import { prisma } from '@/lib/prisma';
import { Service, ServiceCategory } from '@prisma/client';

export interface CreateServiceData {
  name: string;
  description?: string;
  price: number;
  duration: number;
  categoryId?: string;
  color?: string;
  isActive?: boolean;
  tenantId: string;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  price?: number;
  duration?: number;
  categoryId?: string;
  color?: string;
  isActive?: boolean;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  tenantId: string;
}

export class ServiceManager {
  // Service CRUD operations
  async createService(data: CreateServiceData): Promise<Service> {
    return prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.duration,
        categoryId: data.categoryId,
        color: data.color || '#3B82F6',
        isActive: data.isActive !== false,
        tenantId: data.tenantId,
      },
      include: {
        category: true,
      },
    });
  }

  async getService(id: string): Promise<Service | null> {
    return prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        serviceUsers: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async getServiceById(id: string, tenantId: string): Promise<Service | null> {
    return prisma.service.findFirst({
      where: { 
        id,
        tenantId 
      },
      include: {
        category: true,
        serviceUsers: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async getServicesByTenant(tenantId: string, includeInactive = false): Promise<Service[]> {
    return prisma.service.findMany({
      where: {
        tenantId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async updateService(id: string, tenantId: string, data: UpdateServiceData): Promise<Service> {
    // Verificar que el servicio pertenece al tenant
    const service = await this.getServiceById(id, tenantId);
    if (!service) {
      throw new Error('Service not found or access denied');
    }

    return prisma.service.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async deleteService(id: string, tenantId: string): Promise<Service> {
    // Verificar que el servicio pertenece al tenant
    const service = await this.getServiceById(id, tenantId);
    if (!service) {
      throw new Error('Service not found or access denied');
    }

    // Verificar si el servicio tiene citas asociadas
    const appointmentCount = await prisma.appointment.count({
      where: { serviceId: id },
    });

    console.log(`[ServiceManager] Checking appointments for service ${id}: ${appointmentCount} found`);

    if (appointmentCount > 0) {
      throw new Error(`APPOINTMENTS_EXIST:${appointmentCount}`);
    }

    return prisma.service.delete({
      where: { id },
    });
  }

  // Category CRUD operations
  async createCategory(data: CreateCategoryData): Promise<ServiceCategory> {
    return prisma.serviceCategory.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color || '#3B82F6',
        isActive: data.isActive !== false,
        tenantId: data.tenantId,
      },
    });
  }

  async getCategory(id: string): Promise<ServiceCategory | null> {
    return prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        services: true,
      },
    });
  }

  async getCategoriesByTenant(tenantId: string, includeInactive = false): Promise<ServiceCategory[]> {
    return prisma.serviceCategory.findMany({
      where: {
        tenantId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        services: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async updateCategory(id: string, data: Partial<CreateCategoryData>): Promise<ServiceCategory> {
    return prisma.serviceCategory.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string): Promise<ServiceCategory> {
    return prisma.serviceCategory.delete({
      where: { id },
    });
  }

  // Utility methods
  async getServicesByCategory(categoryId: string): Promise<Service[]> {
    return prisma.service.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async assignProfessionalToService(serviceId: string, userId: string, commission = 0): Promise<void> {
    await prisma.serviceUser.create({
      data: {
        serviceId,
        userId,
        commission,
      },
    });
  }

  async removeProfessionalFromService(serviceId: string, userId: string): Promise<void> {
    await prisma.serviceUser.deleteMany({
      where: {
        serviceId,
        userId,
      },
    });
  }
}

export const serviceManager = new ServiceManager();
