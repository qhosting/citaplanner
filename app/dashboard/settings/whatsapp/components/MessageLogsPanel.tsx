
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MessageLogsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs de Mensajes</CardTitle>
        <CardDescription>
          Historial de mensajes enviados por WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay mensajes enviados aún</p>
          <p className="text-sm mt-2">
            Los mensajes aparecerán aquí una vez que se envíen notificaciones
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
