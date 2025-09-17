
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { CalendarDays } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModuleButtons } from '@/components/module-buttons'

export default async function AppointmentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            Gestión de Citas
          </h1>
          <p className="text-gray-600 mt-1">
            Administra las citas de tu negocio
          </p>
        </div>
        <ModuleButtons 
          searchLabel="Buscar"
          addLabel="Nueva Cita"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximas Citas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CalendarDays className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Módulo en Desarrollo
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              El módulo completo de gestión de citas estará disponible próximamente. 
              Incluirá calendario interactivo, gestión de estados y más funcionalidades.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                <strong>Funcionalidades planificadas:</strong>
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Calendario interactivo con vista semanal/mensual</li>
                <li>• Drag & drop para reagendar citas</li>
                <li>• Gestión de estados (Confirmada, Pendiente, etc.)</li>
                <li>• Portal de reservas online</li>
                <li>• Notificaciones y recordatorios</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
