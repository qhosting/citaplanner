
/**
 * Notification Preferences Page
 * 
 * Página para configurar preferencias de notificaciones
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageSquare, Phone, Save, Volume2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface NotificationPreferences {
  enablePushNotifications: boolean;
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
  enableWhatsAppNotifications: boolean;
  notifyAppointmentCreated: boolean;
  notifyAppointmentUpdated: boolean;
  notifyAppointmentCancelled: boolean;
  notifyAppointmentReminder: boolean;
  notifyScheduleChanges: boolean;
  notifySystemAlerts: boolean;
  enableSounds: boolean;
  enableDesktopNotifications: boolean;
  enableToastNotifications: boolean;
  reminderMinutesBefore: number[];
}

export default function NotificationPreferencesPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enablePushNotifications: true,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    enableWhatsAppNotifications: false,
    notifyAppointmentCreated: true,
    notifyAppointmentUpdated: true,
    notifyAppointmentCancelled: true,
    notifyAppointmentReminder: true,
    notifyScheduleChanges: true,
    notifySystemAlerts: true,
    enableSounds: true,
    enableDesktopNotifications: true,
    enableToastNotifications: true,
    reminderMinutesBefore: [1440, 60], // 24 horas y 1 hora
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast.success('Preferencias guardadas correctamente');
        
        // Guardar configuración de sonidos en localStorage
        localStorage.setItem(
          'notification_sounds',
          preferences.enableSounds.toString()
        );
      } else {
        toast.error('Error al guardar preferencias');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Error al guardar preferencias');
    } finally {
      setSaving(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Permisos de notificaciones otorgados');
        setPreferences({
          ...preferences,
          enableDesktopNotifications: true,
        });
      } else {
        toast.error('Permisos de notificaciones denegados');
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Cargando preferencias...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Preferencias de Notificaciones</h1>
        <p className="text-muted-foreground">
          Personaliza cómo y cuándo quieres recibir notificaciones
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Canales de Notificación
          </CardTitle>
          <CardDescription>
            Selecciona los canales por los que deseas recibir notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="push">Notificaciones Push</Label>
                <p className="text-sm text-muted-foreground">
                  Notificaciones en la aplicación
                </p>
              </div>
            </div>
            <Switch
              id="push"
              checked={preferences.enablePushNotifications}
              onCheckedChange={(checked) =>
                setPreferences({
                  ...preferences,
                  enablePushNotifications: checked,
                })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="email">Notificaciones por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir notificaciones en tu correo electrónico
                </p>
              </div>
            </div>
            <Switch
              id="email"
              checked={preferences.enableEmailNotifications}
              onCheckedChange={(checked) =>
                setPreferences({
                  ...preferences,
                  enableEmailNotifications: checked,
                })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="sms">Notificaciones por SMS</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir notificaciones por mensaje de texto
                </p>
              </div>
            </div>
            <Switch
              id="sms"
              checked={preferences.enableSMSNotifications}
              onCheckedChange={(checked) =>
                setPreferences({
                  ...preferences,
                  enableSMSNotifications: checked,
                })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="whatsapp">Notificaciones por WhatsApp</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir notificaciones en WhatsApp
                </p>
              </div>
            </div>
            <Switch
              id="whatsapp"
              checked={preferences.enableWhatsAppNotifications}
              onCheckedChange={(checked) =>
                setPreferences({
                  ...preferences,
                  enableWhatsAppNotifications: checked,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipos de Notificaciones</CardTitle>
          <CardDescription>
            Selecciona qué eventos quieres que te notifiquen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="created">Citas creadas</Label>
            <Switch
              id="created"
              checked={preferences.notifyAppointmentCreated}
              onCheckedChange={(checked) =>
                setPreferences({
                  ...preferences,
                  notifyAppointmentCreated: checked,
                })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="updated">Citas actualizadas</Label>
            <Switch
              id="updated"
              checked={preferences.notifyAppointmentUpdated}
              onCheckedChange={(checked) =>
                setPreferences({
                  ...preferences,
                  notifyAppointmentUpdated: checked,
                })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="cancelled">Citas canceladas</Label>
            <Switch
              id="cancelled"
              checked={preferences.notifyAppointmentCancelled}
              onCheckedChange={(checked) =>
                setPreferences({
                  ...preferences,
                  notifyAppointmentCancelled: checked,
                })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="reminder">Recordatorios de citas</Label>
            <Switch
              id="reminder"
              checked={preferences.notifyAppointmentReminder}
              onCheckedChange={(checked) =>
                setPreferences({
                  ...preferences,
                  notifyAppointmentReminder: checked,
                })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="schedule">Cambios de horarios</Label>
            <Switch
              id="schedule"
              checked={preferences.notifyScheduleChanges}
              onCheckedChange={(checked) =>
                setPreferences({
                  ...preferences,
                  notifyScheduleChanges: checked,
                })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="system">Alertas del sistema</Label>
            <Switch
              id="system"
              checked={preferences.notifySystemAlerts}
              onCheckedChange={(checked) =>
                setPreferences({
                  ...preferences,
                  notifySystemAlerts: checked,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Configuración de Interfaz
          </CardTitle>
          <CardDescription>
            Personaliza la experiencia de notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sounds">Sonidos de notificación</Label>
              <p className="text-sm text-muted-foreground">
                Reproducir sonido al recibir notificaciones
              </p>
            </div>
            <Switch
              id="sounds"
              checked={preferences.enableSounds}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, enableSounds: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="desktop">Notificaciones de escritorio</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar notificaciones del navegador
              </p>
            </div>
            <Switch
              id="desktop"
              checked={preferences.enableDesktopNotifications}
              onCheckedChange={(checked) => {
                if (checked && 'Notification' in window) {
                  requestNotificationPermission();
                } else {
                  setPreferences({
                    ...preferences,
                    enableDesktopNotifications: checked,
                  });
                }
              }}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="toast">Toasts en pantalla</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar notificaciones emergentes en la aplicación
              </p>
            </div>
            <Switch
              id="toast"
              checked={preferences.enableToastNotifications}
              onCheckedChange={(checked) =>
                setPreferences({
                  ...preferences,
                  enableToastNotifications: checked,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Preferencias'}
        </Button>
      </div>
    </div>
  );
}

