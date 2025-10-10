
'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell } from 'lucide-react'
import { NotificationStats } from '@/components/notifications/NotificationStats'
import { ConfigurationTab } from '@/components/notifications/ConfigurationTab'
import { TemplatesTab } from '@/components/notifications/TemplatesTab'
import { HistoryTab } from '@/components/notifications/HistoryTab'
import { SendTab } from '@/components/notifications/SendTab'
import { VariableHelper } from '@/components/notifications/VariableHelper'

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Bell className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Notificaciones</h1>
          <p className="text-gray-500">
            Gestiona el sistema de notificaciones multicanal
          </p>
        </div>
      </div>

      <NotificationStats />

      <Tabs defaultValue="configuration" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="configuration">Configuración</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="send">Enviar</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-6">
          <ConfigurationTab />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TemplatesTab />
            </div>
            <div>
              <VariableHelper />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <HistoryTab />
        </TabsContent>

        <TabsContent value="send" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SendTab />
            </div>
            <div>
              <VariableHelper />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
