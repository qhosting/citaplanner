
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReminderStatsPanel() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Recordatorios 24h</CardTitle>
          <CardDescription>Últimos 30 días</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">0</div>
          <p className="text-sm text-muted-foreground mt-2">
            Mensajes enviados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recordatorios 1h</CardTitle>
          <CardDescription>Últimos 30 días</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">0</div>
          <p className="text-sm text-muted-foreground mt-2">
            Mensajes enviados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasa de Éxito</CardTitle>
          <CardDescription>Mensajes entregados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">100%</div>
          <p className="text-sm text-muted-foreground mt-2">
            0 enviados / 0 entregados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Errores</CardTitle>
          <CardDescription>Últimos 30 días</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">0</div>
          <p className="text-sm text-muted-foreground mt-2">
            Mensajes fallidos
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
