
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ModuleButtons } from '@/components/module-buttons'

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Gestión de Pagos
          </h1>
          <p className="text-gray-600 mt-1">
            POS simplificado para registrar pagos y comisiones
          </p>
        </div>
        <ModuleButtons 
          searchLabel="Buscar"
          addLabel="Registrar Pago"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Módulo POS en Desarrollo
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              El módulo completo de POS estará disponible próximamente. 
              Incluirá registro de ventas, cálculo de comisiones y más.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                <strong>Funcionalidades planificadas:</strong>
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Registro de pagos de servicios</li>
                <li>• Múltiples métodos de pago</li>
                <li>• Cálculo automático de comisiones</li>
                <li>• Gestión de caja diaria</li>
                <li>• Reportes de ventas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
