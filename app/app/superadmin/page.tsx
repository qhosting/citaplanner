
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Building2, Users, DollarSign } from 'lucide-react'

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel Super Administrador</h1>
        <p className="text-muted-foreground">
          Vista general del sistema CitaPlanner
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tenants
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuarios Activos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">
              +7% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">
              +19% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Citas del Mes
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,847</div>
            <p className="text-xs text-muted-foreground">
              +23% desde el mes pasado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Areas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tenants Recientes</CardTitle>
            <CardDescription>
              Empresas registradas recientemente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">BS</span>
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">Bella Studio</p>
                  <p className="text-sm text-muted-foreground">Registrado hace 2 días</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">ES</span>
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">Estética Sofia</p>
                  <p className="text-sm text-muted-foreground">Registrado hace 3 días</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad del Sistema</CardTitle>
            <CardDescription>
              Eventos recientes en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="ml-4 text-sm">Nuevo tenant registrado: Spa Zen</p>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="ml-4 text-sm">Actualización de sistema completada</p>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <p className="ml-4 text-sm">Mantenimiento programado en 2 días</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
