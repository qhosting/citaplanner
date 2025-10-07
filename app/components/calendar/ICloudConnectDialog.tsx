
/**
 * iCloud Connection Dialog Component
 * Allows users to connect their iCloud calendar
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface ICloudConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (connectionId: string) => void;
}

export function ICloudConnectDialog({
  open,
  onOpenChange,
  onSuccess,
}: ICloudConnectDialogProps) {
  const [step, setStep] = useState<'credentials' | 'calendar-select'>('credentials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [appleId, setAppleId] = useState('');
  const [appSpecificPassword, setAppSpecificPassword] = useState('');
  const [calendars, setCalendars] = useState<any[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/calendar/icloud/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appleId,
          appSpecificPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect');
      }

      if (data.calendars) {
        setCalendars(data.calendars);
        setStep('calendar-select');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectCalendar = async () => {
    if (!selectedCalendar) {
      setError('Please select a calendar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const calendar = calendars.find((cal) => cal.url === selectedCalendar);

      const response = await fetch('/api/calendar/icloud/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appleId,
          appSpecificPassword,
          calendarUrl: selectedCalendar,
          calendarName: calendar?.displayName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect calendar');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.(data.connectionId);
        onOpenChange(false);
        resetForm();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('credentials');
    setAppleId('');
    setAppSpecificPassword('');
    setCalendars([]);
    setSelectedCalendar(null);
    setError(null);
    setSuccess(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Conectar Calendario de iCloud</DialogTitle>
          <DialogDescription>
            Sincroniza tus citas con tu calendario de iCloud automáticamente
          </DialogDescription>
        </DialogHeader>

        {step === 'credentials' && (
          <div className="space-y-4 py-4">
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Instrucciones:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Ve a appleid.apple.com e inicia sesión</li>
                    <li>En "Inicio de sesión y seguridad", selecciona "Contraseñas de apps"</li>
                    <li>Genera una nueva contraseña para "CitaPlanner"</li>
                    <li>Copia la contraseña y pégala abajo</li>
                  </ol>
                  <a
                    href="https://appleid.apple.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:underline mt-2"
                  >
                    Abrir Apple ID <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="appleId">Apple ID (Email)</Label>
              <Input
                id="appleId"
                type="email"
                placeholder="tu@email.com"
                value={appleId}
                onChange={(e) => setAppleId(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña de App</Label>
              <Input
                id="password"
                type="password"
                placeholder="xxxx-xxxx-xxxx-xxxx"
                value={appSpecificPassword}
                onChange={(e) => setAppSpecificPassword(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Formato: xxxx-xxxx-xxxx-xxxx (16 caracteres)
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === 'calendar-select' && (
          <div className="space-y-4 py-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Conexión exitosa. Selecciona el calendario que deseas sincronizar.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Calendarios Disponibles</Label>
              <div className="space-y-2">
                {calendars.map((calendar) => (
                  <div
                    key={calendar.url}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCalendar === calendar.url
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedCalendar(calendar.url)}
                  >
                    <div className="font-medium">{calendar.displayName}</div>
                    {calendar.description && (
                      <div className="text-sm text-muted-foreground">
                        {calendar.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ¡Calendario conectado exitosamente!
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'credentials' && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleTestConnection}
                disabled={loading || !appleId || !appSpecificPassword}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continuar
              </Button>
            </>
          )}

          {step === 'calendar-select' && (
            <>
              <Button
                variant="outline"
                onClick={() => setStep('credentials')}
                disabled={loading || success}
              >
                Atrás
              </Button>
              <Button
                onClick={handleConnectCalendar}
                disabled={loading || !selectedCalendar || success}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {success ? 'Conectado' : 'Conectar Calendario'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
