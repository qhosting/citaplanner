
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModuleButtons } from '@/components/module-buttons'

export default async function ClientsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6" />
            Gestión de Clientes
          </h1>
          <p className="text-gray-600 mt-1">
            CRM básico para administrar tu base de clientes
          </p>
        </div>
        <ModuleButtons 
          searchLabel="Buscar"
          addLabel="Nuevo Cliente"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Base de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Módulo CRM en Desarrollo
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              El módulo completo de CRM estará disponible próximamente. 
              Incluirá fichas detalladas de clientes, historial completo y más.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                <strong>Funcionalidades planificadas:</strong>
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Fichas de cliente centralizadas</li>
                <li>• Historial completo de citas</li>
                <li>• Notas y campos personalizables</li>
                <li>• Búsqueda y filtrado avanzado</li>
                <li>• Segmentación de clientes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
