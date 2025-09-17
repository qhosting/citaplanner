
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { DashboardMetrics } from '@/components/dashboard-metrics'
import { RecentAppointments } from '@/components/recent-appointments'
import { QuickActions } from '@/components/quick-actions'
import { QuickActionsSidebar } from '@/components/quick-actions-sidebar'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Bienvenido, {session.user.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Aquí tienes un resumen de tu negocio hoy
          </p>
        </div>
        <QuickActions />
      </div>

      {/* Métricas principales */}
      <DashboardMetrics tenantId={session.user.tenantId} />

      {/* Sección de citas recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentAppointments tenantId={session.user.tenantId} />
        </div>
        <div className="space-y-6">
          {/* Card de acciones rápidas */}
          <QuickActionsSidebar />
          
          {/* Card de estadísticas adicionales */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Esta Semana</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Citas Completadas</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Nuevos Clientes</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tasa de Asistencia</span>
                <span className="font-medium">0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
