"use client";

/**
 * WhatsApp Settings Page
 * 
 * Complete WhatsApp configuration and management panel
 * Features:
 * - WhatsApp configuration (Evolution API)
 * - Message templates management
 * - Message logs
 * - Reminder statistics
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WhatsAppConfigPanel from "./components/WhatsAppConfigPanel";
import MessageTemplatesPanel from "./components/MessageTemplatesPanel";
import MessageLogsPanel from "./components/MessageLogsPanel";
import ReminderStatsPanel from "./components/ReminderStatsPanel";

export default function WhatsAppSettingsPage() {
  const [activeTab, setActiveTab] = useState("config");

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configuración de WhatsApp</h1>
        <p className="text-muted-foreground">
          Administra las notificaciones y recordatorios automáticos por WhatsApp
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="config">Configuración</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <WhatsAppConfigPanel />
        </TabsContent>

        <TabsContent value="templates">
          <MessageTemplatesPanel />
        </TabsContent>

        <TabsContent value="logs">
          <MessageLogsPanel />
        </TabsContent>

        <TabsContent value="stats">
          <ReminderStatsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
