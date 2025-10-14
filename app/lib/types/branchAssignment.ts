
/**
 * Tipos y estructuras para asignación masiva de profesionales a sucursales
 * Fase 2: Mass Assignment System
 */

export interface BranchAssignment {
  id: string;
  professionalId: string;
  branchId: string;
  isPrimary: boolean; // Indica si es la sucursal principal del profesional
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  
  // Horario específico para esta sucursal (opcional, sobrescribe el horario general)
  scheduleOverride?: any; // ScheduleConfig from schedule.ts
  
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchAssignmentInput {
  professionalId: string;
  branchId: string;
  isPrimary?: boolean;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  notes?: string;
  scheduleOverride?: any;
}

export interface MassAssignmentRequest {
  professionalIds: string[];
  branchId: string;
  isPrimary?: boolean;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface MassAssignmentToBranchesRequest {
  professionalId: string;
  branchIds: string[];
  isPrimary?: boolean;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface BranchAssignmentWithDetails extends BranchAssignment {
  professional: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: string;
  };
  branch: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

export interface AssignmentStats {
  totalAssignments: number;
  activeAssignments: number;
  inactiveAssignments: number;
  primaryAssignments: number;
  professionalCount: number;
  branchCount: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BulkOperationResult {
  success: boolean;
  created: number;
  updated: number;
  failed: number;
  errors: Array<{
    professionalId?: string;
    branchId?: string;
    error: string;
  }>;
  assignments: BranchAssignment[];
}
