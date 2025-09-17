
'use client'

import { Button } from '@/components/ui/button'
import { CalendarPlus, UserPlus, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickActionsSidebar() {
  const router = useRouter()

  const handleNewAppointment = () => {
    router.push('/dashboard/appointments')
  }

  const handleNewClient = () => {
    router.push('/dashboard/clients')
  }

  const handleNewPayment = () => {
    router.push('/dashboard/payments')
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
      <div className="space-y-3">
        <button 
          onClick={handleNewAppointment}
          className="w-full text-left p-3 rounded-md hover:bg-gray-50 flex items-center gap-3 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <CalendarPlus className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-sm text-gray-700">Nueva Cita</span>
        </button>
        <button 
          onClick={handleNewClient}
          className="w-full text-left p-3 rounded-md hover:bg-gray-50 flex items-center gap-3 transition-colors"
        >
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <UserPlus className="h-4 w-4 text-green-600" />
          </div>
          <span className="text-sm text-gray-700">Nuevo Cliente</span>
        </button>
        <button 
          onClick={handleNewPayment}
          className="w-full text-left p-3 rounded-md hover:bg-gray-50 flex items-center gap-3 transition-colors"
        >
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-purple-600" />
          </div>
          <span className="text-sm text-gray-700">Registrar Pago</span>
        </button>
      </div>
    </div>
  )
}
