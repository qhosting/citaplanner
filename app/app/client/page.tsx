
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, Plus } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function ClientDashboard() {
  const { data: session } = useSession()
  const clientName = (session?.user as any)?.firstName || 'Cliente'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">¡Bienvenido, {clientName}!</h1>
        <p className="text-muted-foreground">
          Gestiona tus citas y perfil desde aquí
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Nueva Cita</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Reserva una nueva cita con nuestros profesionales
            </p>
            <Button className="w-full">
              Agendar Cita
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg">Mis Citas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Ver y gestionar tus citas programadas
            </p>
            <Button variant="outline" className="w-full">
              Ver Citas
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-lg">Mi Perfil</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Actualiza tu información personal
            </p>
            <Button variant="outline" className="w-full">
              Editar Perfil
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Citas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Próximas Citas</span>
          </CardTitle>
          <CardDescription>
            Tus citas programadas en los próximos días
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center p-4 border rounded-lg">
              <div className="flex-1">
                <p className="font-medium">Corte de Cabello</p>
                <p className="text-sm text-muted-foreground">con María García</p>
                <p className="text-sm text-muted-foreground">Jueves, 21 Sept - 10:00 AM</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Reagendar
                </Button>
                <Button variant="destructive" size="sm">
                  Cancelar
                </Button>
              </div>
            </div>

            <div className="flex items-center p-4 border rounded-lg">
              <div className="flex-1">
                <p className="font-medium">Manicure y Pedicure</p>
                <p className="text-sm text-muted-foreground">con Ana López</p>
                <p className="text-sm text-muted-foreground">Viernes, 22 Sept - 2:00 PM</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Reagendar
                </Button>
                <Button variant="destructive" size="sm">
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial Reciente */}
      <Card>
        <CardHeader>
          <CardTitle>Historial Reciente</CardTitle>
          <CardDescription>
            Tus últimas citas completadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center p-4 border rounded-lg bg-gray-50">
              <div className="flex-1">
                <p className="font-medium">Facial Hidratante</p>
                <p className="text-sm text-muted-foreground">con Sofia Martínez</p>
                <p className="text-sm text-muted-foreground">Lunes, 18 Sept - Completada</p>
              </div>
              <div>
                <Button variant="outline" size="sm">
                  Valorar
                </Button>
              </div>
            </div>

            <div className="flex items-center p-4 border rounded-lg bg-gray-50">
              <div className="flex-1">
                <p className="font-medium">Masaje Relajante</p>
                <p className="text-sm text-muted-foreground">con Carlos Ruiz</p>
                <p className="text-sm text-muted-foreground">Miércoles, 13 Sept - Completada</p>
              </div>
              <div>
                <Button variant="outline" size="sm">
                  Repetir Cita
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
