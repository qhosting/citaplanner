
'use client';

/**
 * Componente para gestión de asignaciones masivas de profesionales a sucursales
 * Fase 2: Mass Assignment System
 */

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Professional {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  isAssigned?: boolean;
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
  professional: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface BranchAssignmentManagerProps {
  branchId: string;
  branchName: string;
}

export default function BranchAssignmentManager({
  branchId,
  branchName,
}: BranchAssignmentManagerProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [availableProfessionals, setAvailableProfessionals] = useState<Professional[]>([]);
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [assignmentOptions, setAssignmentOptions] = useState({
    isPrimary: false,
    isActive: true,
    startDate: '',
    endDate: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [branchId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar asignaciones actuales
      const assignmentsRes = await fetch(`/api/branches/${branchId}/assignments`);
      const assignmentsData = await assignmentsRes.json();
      
      if (assignmentsData.success) {
        setAssignments(assignmentsData.assignments);
      }

      // Cargar profesionales disponibles
      const professionalsRes = await fetch(`/api/branches/${branchId}/assignments/available`);
      const professionalsData = await professionalsRes.json();
      
      if (professionalsData.success) {
        setAvailableProfessionals(professionalsData.professionals);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfessional = (professionalId: string) => {
    setSelectedProfessionals(prev => {
      if (prev.includes(professionalId)) {
        return prev.filter(id => id !== professionalId);
      } else {
        return [...prev, professionalId];
      }
    });
  };

  const handleSelectAll = () => {
    const unassignedProfessionals = availableProfessionals
      .filter(p => !p.isAssigned)
      .map(p => p.id);
    
    if (selectedProfessionals.length === unassignedProfessionals.length) {
      setSelectedProfessionals([]);
    } else {
      setSelectedProfessionals(unassignedProfessionals);
    }
  };

  const handleAssignProfessionals = async () => {
    if (selectedProfessionals.length === 0) {
      toast.error('Selecciona al menos un profesional');
      return;
    }

    try {
      const response = await fetch(`/api/branches/${branchId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionalIds: selectedProfessionals,
          ...assignmentOptions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setShowModal(false);
        setSelectedProfessionals([]);
        setAssignmentOptions({
          isPrimary: false,
          isActive: true,
          startDate: '',
          endDate: '',
          notes: '',
        });
        loadData();
      } else {
        toast.error(data.error || 'Error al asignar profesionales');
      }
    } catch (error) {
      console.error('Error assigning professionals:', error);
      toast.error('Error al asignar profesionales');
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta asignación?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/branches/${branchId}/assignments/${assignmentId}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Asignación eliminada');
        loadData();
      } else {
        toast.error(data.error || 'Error al eliminar asignación');
      }
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast.error('Error al eliminar asignación');
    }
  };

  const handleToggleActive = async (assignmentId: string, currentStatus: boolean) => {
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
        loadData();
      } else {
        toast.error(data.error || 'Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const handleTogglePrimary = async (assignmentId: string, currentStatus: boolean) => {
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
        loadData();
      } else {
        toast.error(data.error || 'Error al actualizar sucursal primaria');
      }
    } catch (error) {
      console.error('Error toggling primary status:', error);
      toast.error('Error al actualizar sucursal primaria');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const unassignedCount = availableProfessionals.filter(p => !p.isAssigned).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Profesionales Asignados
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Sucursal: {branchName}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Asignar Profesionales ({unassignedCount} disponibles)
        </button>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {assignments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay profesionales asignados a esta sucursal
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profesional
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Primaria
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {assignment.professional.avatar ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={assignment.professional.avatar}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {assignment.professional.firstName[0]}
                              {assignment.professional.lastName[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.professional.firstName}{' '}
                          {assignment.professional.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assignment.professional.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {assignment.professional.phone || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(assignment.id, assignment.isActive)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        assignment.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {assignment.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleTogglePrimary(assignment.id, assignment.isPrimary)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        assignment.isPrimary
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {assignment.isPrimary ? 'Primaria' : 'Secundaria'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRemoveAssignment(assignment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Asignar Profesionales</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Options */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={assignmentOptions.isPrimary}
                    onChange={(e) =>
                      setAssignmentOptions({
                        ...assignmentOptions,
                        isPrimary: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">Marcar como sucursal primaria</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={assignmentOptions.isActive}
                    onChange={(e) =>
                      setAssignmentOptions({
                        ...assignmentOptions,
                        isActive: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">Asignación activa</span>
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de inicio (opcional)
                  </label>
                  <input
                    type="date"
                    value={assignmentOptions.startDate}
                    onChange={(e) =>
                      setAssignmentOptions({
                        ...assignmentOptions,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de fin (opcional)
                  </label>
                  <input
                    type="date"
                    value={assignmentOptions.endDate}
                    onChange={(e) =>
                      setAssignmentOptions({
                        ...assignmentOptions,
                        endDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={assignmentOptions.notes}
                  onChange={(e) =>
                    setAssignmentOptions({
                      ...assignmentOptions,
                      notes: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Notas adicionales sobre la asignación..."
                />
              </div>
            </div>

            {/* Professionals List */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">
                  Seleccionar Profesionales ({selectedProfessionals.length} seleccionados)
                </h4>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedProfessionals.length === unassignedCount
                    ? 'Deseleccionar todos'
                    : 'Seleccionar todos'}
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                {availableProfessionals.map((professional) => (
                  <div
                    key={professional.id}
                    className={`p-3 border-b border-gray-100 last:border-b-0 ${
                      professional.isAssigned ? 'bg-gray-50 opacity-50' : ''
                    }`}
                  >
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProfessionals.includes(professional.id)}
                        onChange={() => handleSelectProfessional(professional.id)}
                        disabled={professional.isAssigned}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium">
                          {professional.firstName} {professional.lastName}
                          {professional.isAssigned && (
                            <span className="ml-2 text-xs text-gray-500">(Ya asignado)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {professional.email} • {professional.phone || 'Sin teléfono'}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignProfessionals}
                disabled={selectedProfessionals.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Asignar {selectedProfessionals.length} Profesional(es)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
