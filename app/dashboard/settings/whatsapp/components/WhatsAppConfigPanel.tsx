
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function WhatsAppConfigPanel() {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [config, setConfig] = useState({
    apiUrl: "",
    apiKey: "",
    instanceName: "",
    phoneNumber: "",
    isActive: true,
    sendOnCreate: true,
    sendOnUpdate: true,
    sendOnCancel: true,
    sendReminder24h: true,
    sendReminder1h: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/whatsapp/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Configuración guardada exitosamente");
      } else {
        toast.error(data.error || "Error al guardar configuración");
      }
    } catch (error) {
      toast.error("Error al guardar configuración");
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);

    try {
      const response = await fetch("/api/whatsapp/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("✅ Conexión exitosa");
      } else {
        toast.error(data.error || "Error de conexión");
      }
    } catch (error) {
      toast.error("Error al probar conexión");
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Evolution API</CardTitle>
        <CardDescription>
          Configura la conexión con tu instancia de WhatsApp Evolution API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="apiUrl">URL de Evolution API</Label>
              <Input
                id="apiUrl"
                placeholder="https://api.example.com"
                value={config.apiUrl}
                onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Tu API Key"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instanceName">Nombre de Instancia</Label>
                <Input
                  id="instanceName"
                  placeholder="my-instance"
                  value={config.instanceName}
                  onChange={(e) => setConfig({ ...config, instanceName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Número de WhatsApp</Label>
                <Input
                  id="phoneNumber"
                  placeholder="521234567890"
                  value={config.phoneNumber}
                  onChange={(e) => setConfig({ ...config, phoneNumber: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Opciones de Notificación</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sendOnCreate">Enviar al crear cita</Label>
                <Switch
                  id="sendOnCreate"
                  checked={config.sendOnCreate}
                  onCheckedChange={(checked) => setConfig({ ...config, sendOnCreate: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sendOnUpdate">Enviar al modificar cita</Label>
                <Switch
                  id="sendOnUpdate"
                  checked={config.sendOnUpdate}
                  onCheckedChange={(checked) => setConfig({ ...config, sendOnUpdate: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sendOnCancel">Enviar al cancelar cita</Label>
                <Switch
                  id="sendOnCancel"
                  checked={config.sendOnCancel}
                  onCheckedChange={(checked) => setConfig({ ...config, sendOnCancel: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sendReminder24h">Recordatorio 24 horas</Label>
                <Switch
                  id="sendReminder24h"
                  checked={config.sendReminder24h}
                  onCheckedChange={(checked) => setConfig({ ...config, sendReminder24h: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sendReminder1h">Recordatorio 1 hora</Label>
                <Switch
                  id="sendReminder1h"
                  checked={config.sendReminder1h}
                  onCheckedChange={(checked) => setConfig({ ...config, sendReminder1h: checked })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Configuración"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing}
            >
              {testing ? "Probando..." : "Probar Conexión"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
