
/**
 * Servicio de gestión de asignaciones masivas de profesionales a sucursales
 * Fase 2: Mass Assignment System
 */

import { prisma } from '@/lib/prisma/client';
import {
  BranchAssignment,
  BranchAssignmentInput,
  MassAssignmentRequest,
  MassAssignmentToBranchesRequest,
  BranchAssignmentWithDetails,
  AssignmentStats,
  ValidationResult,
  BulkOperationResult,
} from '@/lib/types/branchAssignment';

export class BranchAssignmentManager {
  /**
   * Valida una asignación antes de crearla
   */
  static async validateAssignment(
    input: BranchAssignmentInput,
    tenantId: string
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Verificar que el profesional existe y pertenece al tenant
      const professional = await prisma.user.findFirst({
        where: {
          id: input.professionalId,
          tenantId,
          role: { in: ['PROFESSIONAL', 'ADMIN'] },
        },
      });

      if (!professional) {
        errors.push('Profesional no encontrado o no pertenece a este tenant');
      }

      // Verificar que la sucursal existe y pertenece al tenant
      const branch = await prisma.branch.findFirst({
        where: {
          id: input.branchId,
          tenantId,
        },
      });

      if (!branch) {
        errors.push('Sucursal no encontrada o no pertenece a este tenant');
      }

      // Verificar fechas
      if (input.startDate && input.endDate) {
        const start = new Date(input.startDate);
        const end = new Date(input.endDate);
        
        if (end <= start) {
          errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
        }
      }

      // Verificar si ya existe una asignación activa
      if (professional && branch) {
        const existingAssignment = await prisma.branchAssignment.findFirst({
          where: {
            professionalId: input.professionalId,
            branchId: input.branchId,
            isActive: true,
          },
        });

        if (existingAssignment) {
          warnings.push('Ya existe una asignación activa para este profesional en esta sucursal');
        }
      }

      // Si se marca como primaria, verificar que no haya otra primaria activa
      if (input.isPrimary && professional) {
        const existingPrimary = await prisma.branchAssignment.findFirst({
          where: {
            professionalId: input.professionalId,
            isPrimary: true,
            isActive: true,
            branchId: { not: input.branchId },
          },
        });

        if (existingPrimary) {
          warnings.push('El profesional ya tiene otra sucursal marcada como primaria');
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      console.error('Error validating assignment:', error);
      return {
        isValid: false,
        errors: ['Error al validar la asignación'],
        warnings,
      };
    }
  }

  /**
   * Crea una asignación individual
   */
  static async createAssignment(
    input: BranchAssignmentInput,
    tenantId: string
  ): Promise<BranchAssignment> {
    try {
      // Validar primero
      const validation = await this.validateAssignment(input, tenantId);
      if (!validation.isValid) {
        throw new Error(`Validación fallida: ${validation.errors.join(', ')}`);
      }

      // Si se marca como primaria, desactivar otras primarias
      if (input.isPrimary) {
        await prisma.branchAssignment.updateMany({
          where: {
            professionalId: input.professionalId,
            isPrimary: true,
            isActive: true,
          },
          data: {
            isPrimary: false,
          },
        });
      }

      // Crear la asignación
      const assignment = await prisma.branchAssignment.create({
        data: {
          professionalId: input.professionalId,
          branchId: input.branchId,
          tenantId,
          isPrimary: input.isPrimary ?? false,
          isActive: input.isActive ?? true,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          notes: input.notes,
          scheduleOverride: input.scheduleOverride,
        },
      });

      console.log('✅ Assignment created:', assignment.id);
      return assignment as BranchAssignment;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  }

  /**
   * Asigna múltiples profesionales a una sucursal
   */
  static async assignProfessionalsToBranch(
    request: MassAssignmentRequest,
    tenantId: string
  ): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: true,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
      assignments: [],
    };

    try {
      // Verificar que la sucursal existe
      const branch = await prisma.branch.findFirst({
        where: { id: request.branchId, tenantId },
      });

      if (!branch) {
        throw new Error('Sucursal no encontrada');
      }

      // Procesar cada profesional
      for (const professionalId of request.professionalIds) {
        try {
          const input: BranchAssignmentInput = {
            professionalId,
            branchId: request.branchId,
            isPrimary: request.isPrimary,
            isActive: request.isActive,
            startDate: request.startDate,
            endDate: request.endDate,
            notes: request.notes,
          };

          // Verificar si ya existe
          const existing = await prisma.branchAssignment.findFirst({
            where: {
              professionalId,
              branchId: request.branchId,
            },
          });

          if (existing) {
            // Actualizar existente
            const updated = await prisma.branchAssignment.update({
              where: { id: existing.id },
              data: {
                isPrimary: input.isPrimary ?? existing.isPrimary,
                isActive: input.isActive ?? existing.isActive,
                startDate: input.startDate ? new Date(input.startDate) : existing.startDate,
                endDate: input.endDate ? new Date(input.endDate) : existing.endDate,
                notes: input.notes ?? existing.notes,
              },
            });
            result.updated++;
            result.assignments.push(updated as BranchAssignment);
          } else {
            // Crear nueva
            const assignment = await this.createAssignment(input, tenantId);
            result.created++;
            result.assignments.push(assignment);
          }
        } catch (error) {
          result.failed++;
          result.errors.push({
            professionalId,
            branchId: request.branchId,
            error: error instanceof Error ? error.message : 'Error desconocido',
          });
        }
      }

      result.success = result.failed === 0;
      console.log('✅ Mass assignment completed:', result);
      return result;
    } catch (error) {
      console.error('Error in mass assignment:', error);
      throw error;
    }
  }

  /**
   * Asigna un profesional a múltiples sucursales
   */
  static async assignProfessionalToBranches(
    request: MassAssignmentToBranchesRequest,
    tenantId: string
  ): Promise<BulkOperationResult> {
    const result: BulkOperationResult = {
      success: true,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
      assignments: [],
    };

    try {
      // Verificar que el profesional existe
      const professional = await prisma.user.findFirst({
        where: {
          id: request.professionalId,
          tenantId,
          role: { in: ['PROFESSIONAL', 'ADMIN'] },
        },
      });

      if (!professional) {
        throw new Error('Profesional no encontrado');
      }

      // Procesar cada sucursal
      for (const branchId of request.branchIds) {
        try {
          const input: BranchAssignmentInput = {
            professionalId: request.professionalId,
            branchId,
            isPrimary: request.isPrimary,
            isActive: request.isActive,
            startDate: request.startDate,
            endDate: request.endDate,
            notes: request.notes,
          };

          // Verificar si ya existe
          const existing = await prisma.branchAssignment.findFirst({
            where: {
              professionalId: request.professionalId,
              branchId,
            },
          });

          if (existing) {
            // Actualizar existente
            const updated = await prisma.branchAssignment.update({
              where: { id: existing.id },
              data: {
                isPrimary: input.isPrimary ?? existing.isPrimary,
                isActive: input.isActive ?? existing.isActive,
                startDate: input.startDate ? new Date(input.startDate) : existing.startDate,
                endDate: input.endDate ? new Date(input.endDate) : existing.endDate,
                notes: input.notes ?? existing.notes,
              },
            });
            result.updated++;
            result.assignments.push(updated as BranchAssignment);
          } else {
            // Crear nueva
            const assignment = await this.createAssignment(input, tenantId);
            result.created++;
            result.assignments.push(assignment);
          }
        } catch (error) {
          result.failed++;
          result.errors.push({
            professionalId: request.professionalId,
            branchId,
            error: error instanceof Error ? error.message : 'Error desconocido',
          });
        }
      }

      result.success = result.failed === 0;
      console.log('✅ Mass assignment to branches completed:', result);
      return result;
    } catch (error) {
      console.error('Error in mass assignment to branches:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las asignaciones de una sucursal
   */
  static async getBranchAssignments(
    branchId: string,
    tenantId: string,
    includeInactive = false
  ): Promise<BranchAssignmentWithDetails[]> {
    try {
      const assignments = await prisma.branchAssignment.findMany({
        where: {
          branchId,
          tenantId,
          ...(includeInactive ? {} : { isActive: true }),
        },
        include: {
          professional: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true,
              role: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true,
              email: true,
            },
          },
        },
        orderBy: [
          { isPrimary: 'desc' },
          { professional: { firstName: 'asc' } },
        ],
      });

      return assignments as unknown as BranchAssignmentWithDetails[];
    } catch (error) {
      console.error('Error getting branch assignments:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las asignaciones de un profesional
   */
  static async getProfessionalAssignments(
    professionalId: string,
    tenantId: string,
    includeInactive = false
  ): Promise<BranchAssignmentWithDetails[]> {
    try {
      const assignments = await prisma.branchAssignment.findMany({
        where: {
          professionalId,
          tenantId,
          ...(includeInactive ? {} : { isActive: true }),
        },
        include: {
          professional: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true,
              role: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true,
              email: true,
            },
          },
        },
        orderBy: [
          { isPrimary: 'desc' },
          { branch: { name: 'asc' } },
        ],
      });

      return assignments as unknown as BranchAssignmentWithDetails[];
    } catch (error) {
      console.error('Error getting professional assignments:', error);
      throw error;
    }
  }

  /**
   * Actualiza una asignación
   */
  static async updateAssignment(
    assignmentId: string,
    updates: Partial<BranchAssignmentInput>,
    tenantId: string
  ): Promise<BranchAssignment> {
    try {
      // Verificar que la asignación existe y pertenece al tenant
      const existing = await prisma.branchAssignment.findFirst({
        where: { id: assignmentId, tenantId },
      });

      if (!existing) {
        throw new Error('Asignación no encontrada');
      }

      // Si se marca como primaria, desactivar otras primarias
      if (updates.isPrimary) {
        await prisma.branchAssignment.updateMany({
          where: {
            professionalId: existing.professionalId,
            isPrimary: true,
            isActive: true,
            id: { not: assignmentId },
          },
          data: {
            isPrimary: false,
          },
        });
      }

      const updated = await prisma.branchAssignment.update({
        where: { id: assignmentId },
        data: {
          isPrimary: updates.isPrimary,
          isActive: updates.isActive,
          startDate: updates.startDate ? new Date(updates.startDate) : undefined,
          endDate: updates.endDate ? new Date(updates.endDate) : undefined,
          notes: updates.notes,
          scheduleOverride: updates.scheduleOverride,
        },
      });

      console.log('✅ Assignment updated:', assignmentId);
      return updated as BranchAssignment;
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  }

  /**
   * Elimina una asignación
   */
  static async deleteAssignment(
    assignmentId: string,
    tenantId: string
  ): Promise<void> {
    try {
      await prisma.branchAssignment.delete({
        where: {
          id: assignmentId,
          tenantId,
        },
      });

      console.log('✅ Assignment deleted:', assignmentId);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de asignaciones
   */
  static async getAssignmentStats(tenantId: string): Promise<AssignmentStats> {
    try {
      const [
        totalAssignments,
        activeAssignments,
        inactiveAssignments,
        primaryAssignments,
        professionalCount,
        branchCount,
      ] = await Promise.all([
        prisma.branchAssignment.count({ where: { tenantId } }),
        prisma.branchAssignment.count({ where: { tenantId, isActive: true } }),
        prisma.branchAssignment.count({ where: { tenantId, isActive: false } }),
        prisma.branchAssignment.count({ where: { tenantId, isPrimary: true, isActive: true } }),
        prisma.branchAssignment.groupBy({
          by: ['professionalId'],
          where: { tenantId, isActive: true },
        }).then(result => result.length),
        prisma.branchAssignment.groupBy({
          by: ['branchId'],
          where: { tenantId, isActive: true },
        }).then(result => result.length),
      ]);

      return {
        totalAssignments,
        activeAssignments,
        inactiveAssignments,
        primaryAssignments,
        professionalCount,
        branchCount,
      };
    } catch (error) {
      console.error('Error getting assignment stats:', error);
      throw error;
    }
  }

  /**
   * Obtiene profesionales disponibles para asignar a una sucursal
   */
  static async getAvailableProfessionals(
    branchId: string,
    tenantId: string
  ): Promise<any[]> {
    try {
      // Obtener todos los profesionales del tenant
      const allProfessionals = await prisma.user.findMany({
        where: {
          tenantId,
          role: { in: ['PROFESSIONAL', 'ADMIN'] },
          isActive: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
        },
      });

      // Obtener profesionales ya asignados a esta sucursal
      const assignedProfessionals = await prisma.branchAssignment.findMany({
        where: {
          branchId,
          tenantId,
          isActive: true,
        },
        select: {
          professionalId: true,
        },
      });

      const assignedIds = new Set(assignedProfessionals.map(a => a.professionalId));

      // Filtrar profesionales no asignados
      return allProfessionals.map(prof => ({
        ...prof,
        isAssigned: assignedIds.has(prof.id),
      }));
    } catch (error) {
      console.error('Error getting available professionals:', error);
      throw error;
    }
  }
}
