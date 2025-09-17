
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModuleButtons } from '@/components/module-buttons'

export default async function WorkingHoursPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Horarios Laborales
          </h1>
          <p className="text-gray-600 mt-1">
            Configura los horarios de trabajo del personal
          </p>
        </div>
        <ModuleButtons 
          searchLabel="Buscar"
          addLabel="Configurar Horario"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Horarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Módulo de Horarios en Desarrollo
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              El módulo completo de gestión de horarios estará disponible próximamente. 
              Incluirá configuración flexible de horarios laborales.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                <strong>Funcionalidades planificadas:</strong>
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Configuración de horarios por profesional</li>
                <li>• Horarios especiales y excepciones</li>
                <li>• Bloqueo de períodos no disponibles</li>
                <li>• Gestión de vacaciones</li>
                <li>• Horarios diferenciados por día</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
