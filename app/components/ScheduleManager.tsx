
/**
 * Componente de Gestión de Horarios
 * 
 * Permite configurar el horario semanal de un profesional con:
 * - Horarios por día de la semana
 * - Múltiples bloques de tiempo por día
 * - Gestión de excepciones (vacaciones, días especiales)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  DayOfWeek, 
  DaySchedule, 
  TimeBlock, 
  ScheduleConfig,
  ScheduleException,
  ExceptionType,
  DAY_NAMES_ES,
  DEFAULT_SCHEDULE
} from '@/app/lib/types/schedule';
import { Clock, Plus, Trash2, Calendar, AlertCircle, Save, X } from 'lucide-react';

interface ScheduleManagerProps {
  professionalId: string;
  professionalName: string;
  initialSchedule?: ScheduleConfig;
  onSave: (schedule: ScheduleConfig) => Promise<void>;
  onCancel?: () => void;
}

export default function ScheduleManager({
  professionalId,
  professionalName,
  initialSchedule,
  onSave,
  onCancel
}: ScheduleManagerProps) {
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    initialSchedule?.defaultSchedule || DEFAULT_SCHEDULE
  );
  const [exceptions, setExceptions] = useState<ScheduleException[]>(
    initialSchedule?.exceptions || []
  );
  const [activeTab, setActiveTab] = useState<'schedule' | 'exceptions'>('schedule');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Actualizar horario de un día
  const updateDaySchedule = (day: DayOfWeek, updates: Partial<DaySchedule>) => {
    setSchedule(prev => prev.map(d => 
      d.day === day ? { ...d, ...updates } : d
    ));
  };

  // Agregar bloque de tiempo a un día
  const addTimeBlock = (day: DayOfWeek) => {
    setSchedule(prev => prev.map(d => {
      if (d.day === day) {
        const lastBlock = d.timeBlocks[d.timeBlocks.length - 1];
        const newBlock: TimeBlock = lastBlock 
          ? { startTime: lastBlock.endTime, endTime: '18:00' }
          : { startTime: '09:00', endTime: '13:00' };
        
        return {
          ...d,
          timeBlocks: [...d.timeBlocks, newBlock]
        };
      }
      return d;
    }));
  };

  // Eliminar bloque de tiempo
  const removeTimeBlock = (day: DayOfWeek, index: number) => {
    setSchedule(prev => prev.map(d => {
      if (d.day === day) {
        return {
          ...d,
          timeBlocks: d.timeBlocks.filter((_, i) => i !== index)
        };
      }
      return d;
    }));
  };

  // Actualizar bloque de tiempo
  const updateTimeBlock = (day: DayOfWeek, index: number, updates: Partial<TimeBlock>) => {
    setSchedule(prev => prev.map(d => {
      if (d.day === day) {
        return {
          ...d,
          timeBlocks: d.timeBlocks.map((block, i) => 
            i === index ? { ...block, ...updates } : block
          )
        };
      }
      return d;
    }));
  };

  // Agregar excepción
  const addException = () => {
    const newException: ScheduleException = {
      id: `temp_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: ExceptionType.VACATION,
      isAvailable: false,
      reason: ''
    };
    setExceptions(prev => [...prev, newException]);
  };

  // Eliminar excepción
  const removeException = (id: string) => {
    setExceptions(prev => prev.filter(e => e.id !== id));
  };

  // Actualizar excepción
  const updateException = (id: string, updates: Partial<ScheduleException>) => {
    setExceptions(prev => prev.map(e => 
      e.id === id ? { ...e, ...updates } : e
    ));
  };

  // Validar y guardar
  const handleSave = async () => {
    setErrors([]);
    setIsSaving(true);

    try {
      // Validaciones básicas
      const validationErrors: string[] = [];

      // Validar que haya al menos un día laboral
      const workingDays = schedule.filter(d => d.isWorkingDay);
      if (workingDays.length === 0) {
        validationErrors.push('Debe haber al menos un día laboral');
      }

      // Validar bloques de tiempo
      schedule.forEach(day => {
        if (day.isWorkingDay && day.timeBlocks.length === 0) {
          validationErrors.push(`${DAY_NAMES_ES[day.day]}: Día laboral sin horarios definidos`);
        }

        day.timeBlocks.forEach((block, index) => {
          const start = timeToMinutes(block.startTime);
          const end = timeToMinutes(block.endTime);

          if (end <= start) {
            validationErrors.push(
              `${DAY_NAMES_ES[day.day]} - Bloque ${index + 1}: La hora de fin debe ser posterior a la de inicio`
            );
          }

          if (end - start < 15) {
            validationErrors.push(
              `${DAY_NAMES_ES[day.day]} - Bloque ${index + 1}: Duración mínima de 15 minutos`
            );
          }
        });
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setIsSaving(false);
        return;
      }

      // Crear configuración completa
      const config: ScheduleConfig = {
        version: '1.0.0',
        defaultSchedule: schedule,
        exceptions: exceptions,
        timezone: 'America/Mexico_City',
        lastUpdated: new Date().toISOString()
      };

      await onSave(config);
    } catch (error) {
      console.error('Error al guardar horario:', error);
      setErrors(['Error al guardar el horario. Por favor, intente nuevamente.']);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper: convertir tiempo a minutos
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Gestión de Horarios
        </h2>
        <p className="text-gray-600">
          Configurar horario de trabajo para <span className="font-semibold">{professionalName}</span>
        </p>
      </div>

      {/* Errores */}
      {errors.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 mb-2">
                Errores de validación:
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'schedule'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Horario Semanal
          </button>
          <button
            onClick={() => setActiveTab('exceptions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'exceptions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Excepciones ({exceptions.length})
          </button>
        </nav>
      </div>

      {/* Contenido */}
      <div className="mb-6">
        {activeTab === 'schedule' ? (
          <WeeklyScheduleEditor
            schedule={schedule}
            onUpdateDay={updateDaySchedule}
            onAddBlock={addTimeBlock}
            onRemoveBlock={removeTimeBlock}
            onUpdateBlock={updateTimeBlock}
          />
        ) : (
          <ExceptionsEditor
            exceptions={exceptions}
            onAdd={addException}
            onRemove={removeException}
            onUpdate={updateException}
          />
        )}
      </div>

      {/* Acciones */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4 inline mr-2" />
            Cancelar
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 inline mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Horario'}
        </button>
      </div>
    </div>
  );
}

/**
 * Editor de horario semanal
 */
interface WeeklyScheduleEditorProps {
  schedule: DaySchedule[];
  onUpdateDay: (day: DayOfWeek, updates: Partial<DaySchedule>) => void;
  onAddBlock: (day: DayOfWeek) => void;
  onRemoveBlock: (day: DayOfWeek, index: number) => void;
  onUpdateBlock: (day: DayOfWeek, index: number, updates: Partial<TimeBlock>) => void;
}

function WeeklyScheduleEditor({
  schedule,
  onUpdateDay,
  onAddBlock,
  onRemoveBlock,
  onUpdateBlock
}: WeeklyScheduleEditorProps) {
  return (
    <div className="space-y-4">
      {schedule.map(daySchedule => (
        <div key={daySchedule.day} className="border border-gray-200 rounded-lg p-4">
          {/* Header del día */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={daySchedule.isWorkingDay}
                onChange={(e) => onUpdateDay(daySchedule.day, { 
                  isWorkingDay: e.target.checked,
                  timeBlocks: e.target.checked ? daySchedule.timeBlocks : []
                })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="font-semibold text-gray-900">
                {DAY_NAMES_ES[daySchedule.day]}
              </span>
            </div>
            {daySchedule.isWorkingDay && (
              <button
                onClick={() => onAddBlock(daySchedule.day)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Agregar bloque
              </button>
            )}
          </div>

          {/* Bloques de tiempo */}
          {daySchedule.isWorkingDay && (
            <div className="space-y-2 ml-7">
              {daySchedule.timeBlocks.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  Sin horarios definidos. Haga clic en "Agregar bloque" para comenzar.
                </p>
              ) : (
                daySchedule.timeBlocks.map((block, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="time"
                      value={block.startTime}
                      onChange={(e) => onUpdateBlock(daySchedule.day, index, { 
                        startTime: e.target.value 
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-gray-500">a</span>
                    <input
                      type="time"
                      value={block.endTime}
                      onChange={(e) => onUpdateBlock(daySchedule.day, index, { 
                        endTime: e.target.value 
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => onRemoveBlock(daySchedule.day, index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar bloque"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Editor de excepciones
 */
interface ExceptionsEditorProps {
  exceptions: ScheduleException[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ScheduleException>) => void;
}

function ExceptionsEditor({
  exceptions,
  onAdd,
  onRemove,
  onUpdate
}: ExceptionsEditorProps) {
  const exceptionTypeLabels: Record<ExceptionType, string> = {
    [ExceptionType.VACATION]: 'Vacaciones',
    [ExceptionType.SICK_LEAVE]: 'Baja médica',
    [ExceptionType.SPECIAL_DAY]: 'Día especial',
    [ExceptionType.HOLIDAY]: 'Festivo',
    [ExceptionType.CUSTOM]: 'Personalizado'
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Defina días especiales donde el horario regular no aplica
        </p>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Nueva Excepción
        </button>
      </div>

      {/* Lista de excepciones */}
      {exceptions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No hay excepciones definidas</p>
          <p className="text-sm text-gray-500">
            Las excepciones permiten definir días especiales como vacaciones o festivos
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {exceptions.map(exception => (
            <div key={exception.id} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={exception.date}
                    onChange={(e) => onUpdate(exception.id!, { date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={exception.type}
                    onChange={(e) => onUpdate(exception.id!, { 
                      type: e.target.value as ExceptionType 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(exceptionTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Disponibilidad */}
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={exception.isAvailable}
                      onChange={(e) => onUpdate(exception.id!, { 
                        isAvailable: e.target.checked 
                      })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Disponible este día (con horario especial)
                    </span>
                  </label>
                </div>

                {/* Razón */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo (opcional)
                  </label>
                  <input
                    type="text"
                    value={exception.reason || ''}
                    onChange={(e) => onUpdate(exception.id!, { reason: e.target.value })}
                    placeholder="Ej: Vacaciones de verano"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Botón eliminar */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => onRemove(exception.id!)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Eliminar excepción
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
