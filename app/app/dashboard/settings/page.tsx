
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { Settings, User, Building, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SaveButton } from '@/components/module-buttons'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Configuración
          </h1>
          <p className="text-gray-600 mt-1">
            Administra la configuración de tu cuenta y negocio
          </p>
        </div>
        <SaveButton label="Guardar Cambios" />
      </div>

      <div className="grid gap-6">
        {/* Configuración del Perfil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil de Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Configuración de Perfil
              </h3>
              <p className="text-gray-600 mb-4">
                Próximamente podrás editar tu información personal, cambiar contraseña y más.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de la Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Configuración de Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Datos de la Empresa
              </h3>
              <p className="text-gray-600 mb-4">
                Próximamente podrás configurar los datos de tu empresa, logo, información de contacto y más.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Configuración de Notificaciones
              </h3>
              <p className="text-gray-600 mb-4">
                Próximamente podrás configurar tus preferencias de notificaciones por email, SMS y más.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
