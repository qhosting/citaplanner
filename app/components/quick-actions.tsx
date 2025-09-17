
'use client'

import { Button } from '@/components/ui/button'
import { CalendarPlus, UserPlus, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickActions() {
  const router = useRouter()

  return (
    <div className="flex flex-wrap gap-3">
      <Button 
        onClick={() => router.push('/dashboard/appointments')}
        className="flex items-center gap-2"
      >
        <CalendarPlus className="h-4 w-4" />
        Nueva Cita
      </Button>
      
      <Button 
        variant="outline"
        onClick={() => router.push('/dashboard/clients')}
        className="flex items-center gap-2"
      >
        <UserPlus className="h-4 w-4" />
        Nuevo Cliente
      </Button>
      
      <Button 
        variant="outline"
        onClick={() => router.push('/dashboard/payments')}
        className="flex items-center gap-2"
      >
        <CreditCard className="h-4 w-4" />
        Registrar Pago
      </Button>
    </div>
  )
}
