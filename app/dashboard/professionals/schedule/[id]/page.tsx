
/**
 * Página de gestión de horarios de profesionales
 * Ruta: /dashboard/professionals/schedule/[id]
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ScheduleManager from '@/app/components/ScheduleManager';
import { ScheduleConfig } from '@/app/lib/types/schedule';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default function ProfessionalSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const professionalId = params.id as string;

  const [professional, setProfessional] = useState<Professional | null>(null);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del profesional y su horario
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Obtener datos del profesional
        const profResponse = await fetch(`/api/professionals/${professionalId}`);
        if (!profResponse.ok) {
          throw new Error('Error al cargar datos del profesional');
        }
        const profData = await profResponse.json();
        setProfessional(profData.data);

        // Obtener horario
        const scheduleResponse = await fetch(`/api/professionals/${professionalId}/schedule`);
        if (scheduleResponse.ok) {
          const scheduleData = await scheduleResponse.json();
          setScheduleConfig(scheduleData.data.schedule);
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        toast.error('Error al cargar los datos del profesional');
      } finally {
        setIsLoading(false);
      }
    };

    if (professionalId) {
      fetchData();
    }
  }, [professionalId]);

  // Guardar horario
  const handleSave = async (schedule: ScheduleConfig) => {
    try {
      const response = await fetch(`/api/professionals/${professionalId}/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedule }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el horario');
      }

      const data = await response.json();
      setScheduleConfig(data.data.schedule);
      
      toast.success('Horario guardado exitosamente');
      
      // Opcional: redirigir después de guardar
      setTimeout(() => {
        router.push('/dashboard/professionals');
      }, 1500);
    } catch (err) {
      console.error('Error al guardar horario:', err);
      toast.error(err instanceof Error ? err.message : 'Error al guardar el horario');
      throw err; // Re-throw para que el componente maneje el error
    }
  };

  // Cancelar y volver
  const handleCancel = () => {
    router.push('/dashboard/professionals');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos del profesional...</p>
        </div>
      </div>
    );
  }

  if (error || !professional) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Error al cargar datos
            </h2>
            <p className="text-red-600 mb-4">
              {error || 'No se pudo cargar la información del profesional'}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/professionals')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Volver a Profesionales
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/professionals')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Profesionales
          </button>
        </div>

        {/* Componente de gestión de horarios */}
        <ScheduleManager
          professionalId={professionalId}
          professionalName={professional.name}
          initialSchedule={scheduleConfig || undefined}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
