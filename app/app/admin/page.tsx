
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, DollarSign, TrendingUp } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const tenantName = (session?.user as any)?.tenantName || 'Mi Empresa'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Vista general de {tenantName}
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Citas Hoy
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              +5% desde ayer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Activos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              +12% este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos del Mes
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,350</div>
            <p className="text-xs text-muted-foreground">
              +25% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa de Ocupación
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              +3% desde la semana pasada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Citas del Día</CardTitle>
            <CardDescription>
              Próximas citas programadas para hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">09:00 - María González</p>
                  <p className="text-sm text-muted-foreground">Corte y Peinado</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">10:30 - Ana López</p>
                  <p className="text-sm text-muted-foreground">Manicure</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">14:00 - Carlos Ruiz</p>
                  <p className="text-sm text-muted-foreground">Masaje</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuraciones Rápidas</CardTitle>
            <CardDescription>
              Acciones frecuentes para administrar tu negocio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <button 
                onClick={() => router.push('/dashboard/services')}
                className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium">Gestionar Servicios</p>
                <p className="text-sm text-muted-foreground">Agregar o editar servicios disponibles</p>
              </button>
              <button 
                onClick={() => router.push('/dashboard/working-hours')}
                className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium">Configurar Personal</p>
                <p className="text-sm text-muted-foreground">Administrar profesionales y horarios</p>
              </button>
              <button 
                onClick={() => router.push('/admin/reports')}
                className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium">Ver Reportes</p>
                <p className="text-sm text-muted-foreground">Analizar rendimiento y métricas</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
