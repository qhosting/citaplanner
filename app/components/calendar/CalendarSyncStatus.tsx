
/**
 * Calendar Sync Status Component
 * Displays sync status and recent activity
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
} from 'lucide-react';

interface SyncConnection {
  id: string;
  provider: string;
  calendarName: string;
  syncStatus: string;
  lastSyncAt: string | null;
  lastSyncError: string | null;
  syncInterval: number;
  bidirectionalSync: boolean;
  autoExport: boolean;
}

interface CalendarSyncStatusProps {
  userId: string;
}

export function CalendarSyncStatus({ userId }: CalendarSyncStatusProps) {
  const [connections, setConnections] = useState<SyncConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/calendar/icloud/status');
      const data = await response.json();

      if (data.success) {
        setConnections(data.connections);
      }
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (connectionId: string) => {
    setSyncing(connectionId);

    try {
      const response = await fetch('/api/calendar/icloud/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionId }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchConnections();
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(null);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/calendar/export?userId=${userId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `citaplanner-${Date.now()}.ics`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getSyncStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Activo</Badge>;
      case 'PAUSED':
        return <Badge className="bg-yellow-500">Pausado</Badge>;
      case 'ERROR':
        return <Badge className="bg-red-500">Error</Badge>;
      case 'DISCONNECTED':
        return <Badge variant="outline">Desconectado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sincronización de Calendario</CardTitle>
              <CardDescription>
                Gestiona tus conexiones de calendario externo
              </CardDescription>
            </div>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar .ics
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No tienes calendarios conectados. Conecta tu calendario de iCloud para
                sincronizar automáticamente tus citas.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{connection.calendarName}</span>
                      {getSyncStatusBadge(connection.syncStatus)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {connection.provider === 'ICLOUD_CALDAV' && 'iCloud Calendar'}
                    </div>
                    {connection.lastSyncAt && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Última sincronización:{' '}
                        {new Date(connection.lastSyncAt).toLocaleString('es-MX')}
                      </div>
                    )}
                    {connection.lastSyncError && (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <XCircle className="h-3 w-3" />
                        {connection.lastSyncError}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => handleSync(connection.id)}
                    disabled={syncing === connection.id}
                    size="sm"
                  >
                    {syncing === connection.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sincronizar
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
