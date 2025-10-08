'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Loader2, Save, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { ClientPreferencesProps, ClientPreference } from '@/lib/clients/types';

/**
 * Client Preferences Component
 * Displays and edits client preferences
 */
export default function ClientPreferences({ clientId }: ClientPreferencesProps) {
  const [preferences, setPreferences] = useState<ClientPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    preferredDays: [] as string[],
    preferredTimes: [] as string[],
    communicationPreference: 'EMAIL' as 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PHONE' | 'NONE',
    reminderTime: 24,
    language: 'es',
    timezone: 'America/Mexico_City',
  });

  const daysOfWeek = [
    { value: 'MONDAY', label: 'Lunes' },
    { value: 'TUESDAY', label: 'Martes' },
    { value: 'WEDNESDAY', label: 'Miércoles' },
    { value: 'THURSDAY', label: 'Jueves' },
    { value: 'FRIDAY', label: 'Viernes' },
    { value: 'SATURDAY', label: 'Sábado' },
    { value: 'SUNDAY', label: 'Domingo' },
  ];

  const timeSlots = [
    { value: 'MORNING', label: 'Mañana (8AM - 12PM)' },
    { value: 'AFTERNOON', label: 'Tarde (12PM - 6PM)' },
    { value: 'EVENING', label: 'Noche (6PM - 10PM)' },
  ];

  useEffect(() => {
    fetchPreferences();
  }, [clientId]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clients/preferences?clientId=${clientId}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar las preferencias');
      }

      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        const pref = data.data[0];
        setPreferences(pref);
        setFormData({
          preferredDays: pref.preferredDays || [],
          preferredTimes: pref.preferredTimes || [],
          communicationPreference: pref.communicationPreference || 'EMAIL',
          reminderTime: pref.reminderTime || 24,
          language: pref.language || 'es',
          timezone: pref.timezone || 'America/Mexico_City',
        });
      }
    } catch (err) {
      console.error('Error fetching preferences:', err);
      toast.error('Error al cargar las preferencias');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      if (preferences) {
        // Update existing preferences
        const response = await fetch(`/api/clients/preferences/${preferences.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Error al actualizar las preferencias');

        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Error al actualizar las preferencias');

        toast.success('Preferencias actualizadas correctamente');
      } else {
        // Create new preferences
        const response = await fetch('/api/clients/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            ...formData,
          }),
        });

        if (!response.ok) throw new Error('Error al crear las preferencias');

        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Error al crear las preferencias');

        toast.success('Preferencias creadas correctamente');
      }

      setEditing(false);
      fetchPreferences();
    } catch (err) {
      console.error('Error saving preferences:', err);
      toast.error(err instanceof Error ? err.message : 'Error al guardar las preferencias');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDay = (day: string) => {
    setFormData({
      ...formData,
      preferredDays: formData.preferredDays.includes(day)
        ? formData.preferredDays.filter((d) => d !== day)
        : [...formData.preferredDays, day],
    });
  };

  const toggleTime = (time: string) => {
    setFormData({
      ...formData,
      preferredTimes: formData.preferredTimes.includes(time)
        ? formData.preferredTimes.filter((t) => t !== time)
        : [...formData.preferredTimes, time],
    });
  };

  const getCommunicationLabel = (pref: string) => {
    const labels: Record<string, string> = {
      EMAIL: 'Email',
      SMS: 'SMS',
      WHATSAPP: 'WhatsApp',
      PHONE: 'Teléfono',
      NONE: 'Sin preferencia',
    };
    return labels[pref] || pref;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-4 text-sm text-gray-600">Cargando preferencias...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Preferencias del Cliente
          </CardTitle>
          {!editing && (
            <Button onClick={() => setEditing(true)} size="sm" variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Preferred Days */}
            <div>
              <label className="block text-sm font-medium mb-3">Días Preferidos</label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <Badge
                    key={day.value}
                    variant={formData.preferredDays.includes(day.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleDay(day.value)}
                  >
                    {day.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Preferred Times */}
            <div>
              <label className="block text-sm font-medium mb-3">Horarios Preferidos</label>
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((slot) => (
                  <Badge
                    key={slot.value}
                    variant={formData.preferredTimes.includes(slot.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTime(slot.value)}
                  >
                    {slot.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Communication Preference */}
            <div>
              <label className="block text-sm font-medium mb-2">Preferencia de Comunicación</label>
              <Select
                value={formData.communicationPreference}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, communicationPreference: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="PHONE">Teléfono</SelectItem>
                  <SelectItem value="NONE">Sin preferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reminder Time */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tiempo de Recordatorio (horas antes)
              </label>
              <Input
                type="number"
                min="1"
                max="168"
                value={formData.reminderTime}
                onChange={(e) =>
                  setFormData({ ...formData, reminderTime: parseInt(e.target.value) || 24 })
                }
              />
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium mb-2">Idioma</label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium mb-2">Zona Horaria</label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => setFormData({ ...formData, timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Mexico_City">Ciudad de México</SelectItem>
                  <SelectItem value="America/Monterrey">Monterrey</SelectItem>
                  <SelectItem value="America/Cancun">Cancún</SelectItem>
                  <SelectItem value="America/Tijuana">Tijuana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  if (preferences) {
                    setFormData({
                      preferredDays: preferences.preferredDays || [],
                      preferredTimes: preferences.preferredTimes || [],
                      communicationPreference: preferences.communicationPreference || 'EMAIL',
                      reminderTime: preferences.reminderTime || 24,
                      language: preferences.language || 'es',
                      timezone: preferences.timezone || 'America/Mexico_City',
                    });
                  }
                }}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Display Mode */}
            {!preferences ? (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No hay preferencias configuradas</p>
                <Button onClick={() => setEditing(true)}>
                  Configurar Preferencias
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Días Preferidos</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.preferredDays.length > 0 ? (
                      formData.preferredDays.map((day) => (
                        <Badge key={day} variant="outline">
                          {daysOfWeek.find((d) => d.value === day)?.label || day}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">Sin preferencia</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Horarios Preferidos</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.preferredTimes.length > 0 ? (
                      formData.preferredTimes.map((time) => (
                        <Badge key={time} variant="outline">
                          {timeSlots.find((t) => t.value === time)?.label || time}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">Sin preferencia</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Comunicación</p>
                    <p className="text-sm text-gray-900">
                      {getCommunicationLabel(formData.communicationPreference)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600">Recordatorio</p>
                    <p className="text-sm text-gray-900">{formData.reminderTime} horas antes</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600">Idioma</p>
                    <p className="text-sm text-gray-900">
                      {formData.language === 'es' ? 'Español' : 'English'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600">Zona Horaria</p>
                    <p className="text-sm text-gray-900">{formData.timezone}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
