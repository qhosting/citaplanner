
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { UserCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModuleButtons } from '@/components/module-buttons'

export default async function ServicesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="h-6 w-6" />
            Catálogo de Servicios
          </h1>
          <p className="text-gray-600 mt-1">
            Administra los servicios que ofrece tu negocio
          </p>
        </div>
        <ModuleButtons 
          searchLabel="Buscar"
          addLabel="Nuevo Servicio"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Servicios Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Módulo de Servicios en Desarrollo
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              El módulo completo de gestión de servicios estará disponible próximamente. 
              Incluirá catálogo completo, asignación de profesionales y más.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                <strong>Funcionalidades planificadas:</strong>
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Catálogo completo de servicios</li>
                <li>• Configuración de precios y duración</li>
                <li>• Asignación de profesionales</li>
                <li>• Gestión de comisiones por servicio</li>
                <li>• Categorización y organización</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
