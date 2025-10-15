
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TEMPLATE_TYPES = [
  { value: "APPOINTMENT_CREATED", label: "Cita Creada", color: "bg-green-500" },
  { value: "APPOINTMENT_UPDATED", label: "Cita Modificada", color: "bg-blue-500" },
  { value: "APPOINTMENT_CANCELLED", label: "Cita Cancelada", color: "bg-red-500" },
  { value: "REMINDER_24H", label: "Recordatorio 24h", color: "bg-yellow-500" },
  { value: "REMINDER_1H", label: "Recordatorio 1h", color: "bg-orange-500" },
];

export default function MessageTemplatesPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plantillas de Mensajes</CardTitle>
          <CardDescription>
            Gestiona las plantillas de mensajes de WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {TEMPLATE_TYPES.map((type) => (
              <div
                key={type.value}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${type.color}`} />
                  <div>
                    <h4 className="font-semibold">{type.label}</h4>
                    <p className="text-sm text-muted-foreground">
                      Variables disponibles: {"{cliente}"}, {"{fecha}"}, {"{hora}"}, {"{profesional}"}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Por Defecto</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
