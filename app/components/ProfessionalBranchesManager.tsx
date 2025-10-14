
'use client';

/**
 * Componente para gestión de sucursales asignadas a un profesional
 * Fase 2: Mass Assignment System
 */

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface Assignment {
  id: string;
  professionalId: string;
  branchId: string;
  isPrimary: boolean;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  notes?: string;
  branch: Branch;
  createdAt: string;
  updatedAt: string;
}

interface ProfessionalBranchesManagerProps {
  professionalId: string;
  professionalName: string;
}

export default function ProfessionalBranchesManager({
  professionalId,
  professionalName,
}: ProfessionalBranchesManagerProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, [professionalId]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/professionals/${professionalId}/assignments`);
      const data = await response.json();

      if (data.success) {
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast.error('Error al cargar asignaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePrimary = async (assignmentId: string, branchId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(
        `/api/branches/${branchId}/assignments/${assignmentId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPrimary: !currentStatus }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Sucursal primaria actualizada');
        loadAssignments();
      } else {
        toast.error(data.error || 'Error al actualizar');
      }
    } catch (error) {
      console.error('Error toggling primary:', error);
      toast.error('Error al actualizar');
    }
  };

  const handleToggleActive = async (assignmentId: string, branchId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(
        `/api/branches/${branchId}/assignments/${assignmentId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Estado actualizado');
        loadAssignments();
      } else {
        toast.error(data.error || 'Error al actualizar');
      }
    } catch (error) {
      console.error('Error toggling active:', error);
      toast.error('Error al actualizar');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Sucursales Asignadas
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Profesional: {professionalName}
        </p>
      </div>

      {/* Assignments Grid */}
      {assignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Este profesional no está asignado a ninguna sucursal
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className={`bg-white rounded-lg shadow p-6 border-2 ${
                assignment.isPrimary
                  ? 'border-blue-500'
                  : 'border-transparent'
              } ${!assignment.isActive ? 'opacity-60' : ''}`}
            >
              {/* Branch Info */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {assignment.branch.name}
                  </h3>
                  {assignment.isPrimary && (
                    <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                      Primaria
                    </span>
                  )}
                </div>
                
                {assignment.branch.address && (
                  <p className="text-sm text-gray-600 mb-1">
                    📍 {assignment.branch.address}
                  </p>
                )}
                
                {assignment.branch.phone && (
                  <p className="text-sm text-gray-600 mb-1">
                    📞 {assignment.branch.phone}
                  </p>
                )}
                
                {assignment.branch.email && (
                  <p className="text-sm text-gray-600">
                    ✉️ {assignment.branch.email}
                  </p>
                )}
              </div>

              {/* Assignment Details */}
              {(assignment.startDate || assignment.endDate || assignment.notes) && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                  {assignment.startDate && (
                    <p className="text-gray-700 mb-1">
                      <strong>Inicio:</strong>{' '}
                      {new Date(assignment.startDate).toLocaleDateString('es-MX')}
                    </p>
                  )}
                  {assignment.endDate && (
                    <p className="text-gray-700 mb-1">
                      <strong>Fin:</strong>{' '}
                      {new Date(assignment.endDate).toLocaleDateString('es-MX')}
                    </p>
                  )}
                  {assignment.notes && (
                    <p className="text-gray-700">
                      <strong>Notas:</strong> {assignment.notes}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    handleTogglePrimary(
                      assignment.id,
                      assignment.branchId,
                      assignment.isPrimary
                    )
                  }
                  className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    assignment.isPrimary
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {assignment.isPrimary ? '★ Primaria' : '☆ Hacer Primaria'}
                </button>
                
                <button
                  onClick={() =>
                    handleToggleActive(
                      assignment.id,
                      assignment.branchId,
                      assignment.isActive
                    )
                  }
                  className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    assignment.isActive
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {assignment.isActive ? '✓ Activa' : '✗ Inactiva'}
                </button>
              </div>

              {/* Metadata */}
              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                <p>
                  Asignado: {new Date(assignment.createdAt).toLocaleDateString('es-MX')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {assignments.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Total de sucursales: {assignments.length}
              </p>
              <p className="text-sm text-blue-700">
                Activas: {assignments.filter(a => a.isActive).length} •
                Primaria: {assignments.filter(a => a.isPrimary).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
