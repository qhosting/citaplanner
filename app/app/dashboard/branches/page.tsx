
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { Building } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModuleButtons } from '@/components/module-buttons'

export default async function BranchesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="h-6 w-6" />
            Gestión de Sucursales
          </h1>
          <p className="text-gray-600 mt-1">
            Administra las sucursales de tu negocio
          </p>
        </div>
        <ModuleButtons 
          searchLabel="Buscar"
          addLabel="Nueva Sucursal"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sucursales Activas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Módulo Multi-Sucursal en Desarrollo
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              El módulo completo de gestión multi-sucursal estará disponible próximamente. 
              Incluirá administración completa de múltiples ubicaciones.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                <strong>Funcionalidades planificadas:</strong>
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Gestión de múltiples sucursales</li>
                <li>• Configuración independiente por ubicación</li>
                <li>• Asignación de personal por sucursal</li>
                <li>• Reportes consolidados y por sucursal</li>
                <li>• Horarios personalizados por ubicación</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
