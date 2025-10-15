/**
 * Página centralizada de gestión de horarios
 * Ruta: /dashboard/working-hours
 * 
 * Muestra una vista de todos los profesionales con sus horarios
 * y permite acceder rápidamente a editar los horarios individuales
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  User, 
  Calendar, 
  Building, 
  Edit, 
  CheckCircle, 
  XCircle,
  Loader2,
  Search,
  Filter,
  ChevronRight,
  Users,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Branch {
  id: string;
  name: string;
}

interface BranchAssignment {
  id: string;
  isPrimary: boolean;
  isActive: boolean;
  branch: Branch;
}

interface Professional {
  id: string;
  name: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  };
  email: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  branch: Branch | null;
  workingHoursCount: number;
  appointmentsCount: number;
  branchAssignments: BranchAssignment[];
  hasScheduleConfig: boolean;
}

export default function WorkingHoursPage() {
  const router = useRouter();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    fetchData();
  }, [showInactive]);

  // Auto-refresh cuando la página vuelve a estar visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // También refrescar cuando la ventana recibe el foco
    window.addEventListener('focus', fetchData);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchData);
    };
  }, [showInactive]);

  // Filtrar profesionales
  useEffect(() => {
    filterProfessionals();
  }, [professionals, searchTerm, selectedBranch]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar profesionales
      const profResponse = await fetch(`/api/professionals?includeInactive=${showInactive}`);
      if (!profResponse.ok) {
        throw new Error('Error al cargar profesionales');
      }
      const profData = await profResponse.json();
      setProfessionals(profData.professionals || []);

      // Cargar sucursales
      const branchResponse = await fetch('/api/branches');
      if (branchResponse.ok) {
        const branchData = await branchResponse.json();
        setBranches(branchData.branches || []);
      }

      // Actualizar timestamp de última actualización
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProfessionals = () => {
    let filtered = [...professionals];

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(prof =>
        prof.name.toLowerCase().includes(term) ||
        prof.email.toLowerCase().includes(term) ||
        prof.phone?.toLowerCase().includes(term)
      );
    }

    // Filtrar por sucursal
    if (selectedBranch !== 'all') {
      filtered = filtered.filter(prof => 
        prof.branch?.id === selectedBranch ||
        prof.branchAssignments.some(ba => ba.branch.id === selectedBranch && ba.isActive)
      );
    }

    setFilteredProfessionals(filtered);
  };

  const handleEditSchedule = (professionalId: string) => {
    router.push(`/dashboard/professionals/schedule/${professionalId}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBranchesText = (prof: Professional) => {
    if (prof.branchAssignments.length === 0) {
      return prof.branch?.name || 'Sin sucursal';
    }

    const activeBranches = prof.branchAssignments.filter(ba => ba.isActive);
    if (activeBranches.length === 1) {
      return activeBranches[0].branch.name;
    }

    return `${activeBranches.length} sucursales`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando horarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-600" />
                Gestión de Horarios
              </h1>
              <p className="text-gray-600 mt-2">
                Configura los horarios de trabajo de cada profesional
              </p>
            </div>
            
            {/* Botón de refresh */}
            <button
              onClick={() => {
                fetchData();
                toast.success('Actualizando datos...');
              }}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Profesionales</p>
                  <p className="text-2xl font-bold text-gray-900">{professionals.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Con Horarios</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {professionals.filter(p => p.hasScheduleConfig).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sin Configurar</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {professionals.filter(p => !p.hasScheduleConfig).length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {professionals.filter(p => p.isActive).length}
                  </p>
                </div>
                <User className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por sucursal */}
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">Todas las sucursales</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle inactivos */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Mostrar inactivos
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Lista de profesionales */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredProfessionals.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm || selectedBranch !== 'all'
                  ? 'No se encontraron profesionales con los filtros aplicados'
                  : 'No hay profesionales registrados'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProfessionals.map((professional) => (
                <div
                  key={professional.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    {/* Info del profesional */}
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {professional.avatar ? (
                          <img
                            src={professional.avatar}
                            alt={professional.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {getInitials(professional.name)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Datos */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {professional.name}
                          </h3>
                          {!professional.isActive && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              Inactivo
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {professional.email}
                          </span>
                          {professional.phone && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {professional.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            {getBranchesText(professional)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {professional.appointmentsCount} citas
                          </span>
                        </div>
                      </div>

                      {/* Estado de horario */}
                      <div className="flex items-center gap-2">
                        {professional.hasScheduleConfig ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Horario configurado
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Sin configurar
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botón de acción */}
                    <button
                      onClick={() => handleEditSchedule(professional.id)}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Gestionar Horario</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Mostrando {filteredProfessionals.length} de {professionals.length} profesionales
          </p>
          {lastUpdate && (
            <p className="mt-2 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
