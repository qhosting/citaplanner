
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, DollarSign, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function StaffDashboard() {
  const { data: session } = useSession()
  const userName = `${(session?.user as any)?.firstName || ''} ${(session?.user as any)?.lastName || ''}`.trim()
  const userRole = (session?.user as any)?.role

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'PROFESSIONAL':
        return 'Profesional'
      case 'MANAGER':
        return 'Manager'
      case 'RECEPTIONIST':
        return 'Recepcionista'
      default:
        return 'Personal'
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          ¡Hola, {userName}!
        </h1>
        <p className="text-muted-foreground">
          Portal de {getRoleTitle(userRole)} - Tu actividad de hoy
        </p>
      </div>

      {/* KPIs para Staff */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Citas Hoy
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              6 completadas, 2 pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próxima Cita
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2:30 PM</div>
            <p className="text-xs text-muted-foreground">
              María González - Corte
            </p>
          </CardContent>
        </Card>

        {userRole === 'PROFESSIONAL' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Comisiones del Mes
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2,340</div>
                <p className="text-xs text-muted-foreground">
                  +15% vs mes pasado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Clientes Atendidos
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">
                  En este mes
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Agenda del Día */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Mi Agenda de Hoy</span>
          </CardTitle>
          <CardDescription>
            Citas programadas para el día de hoy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center p-4 border rounded-lg bg-green-50">
              <div className="flex-1">
                <p className="font-medium">09:00 - 10:30</p>
                <p className="text-sm font-medium">Ana López - Manicure</p>
                <p className="text-sm text-muted-foreground">Completada</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>

            <div className="flex items-center p-4 border rounded-lg bg-green-50">
              <div className="flex-1">
                <p className="font-medium">11:00 - 12:00</p>
                <p className="text-sm font-medium">Carlos Ruiz - Corte de Cabello</p>
                <p className="text-sm text-muted-foreground">Completada</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>

            <div className="flex items-center p-4 border rounded-lg bg-blue-50">
              <div className="flex-1">
                <p className="font-medium">14:30 - 15:30</p>
                <p className="text-sm font-medium">María González - Peinado</p>
                <p className="text-sm text-muted-foreground">Próxima cita</p>
              </div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>

            <div className="flex items-center p-4 border rounded-lg">
              <div className="flex-1">
                <p className="font-medium">16:00 - 17:30</p>
                <p className="text-sm font-medium">Sofia Martínez - Facial</p>
                <p className="text-sm text-muted-foreground">Programada</p>
              </div>
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información adicional para profesionales */}
      {userRole === 'PROFESSIONAL' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Comisiones de la Semana</CardTitle>
              <CardDescription>
                Detalle de tus comisiones ganadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Lunes</span>
                  <span className="font-medium">$280</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Martes</span>
                  <span className="font-medium">$320</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Miércoles</span>
                  <span className="font-medium">$450</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="font-medium">Total Semanal</span>
                  <span className="font-bold">$1,050</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Servicios Populares</CardTitle>
              <CardDescription>
                Tus servicios más solicitados este mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Corte de Cabello</span>
                  <span className="font-medium">45 citas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Peinado</span>
                  <span className="font-medium">32 citas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Manicure</span>
                  <span className="font-medium">28 citas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Facial</span>
                  <span className="font-medium">22 citas</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
