
'use client'

import { Session } from 'next-auth'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  CalendarDays, 
  Home, 
  Users, 
  UserCheck, 
  CreditCard, 
  Settings,
  Building,
  Clock
} from 'lucide-react'

interface DashboardNavProps {
  session: Session
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, current: false },
  { name: 'Agenda', href: '/dashboard/appointments', icon: CalendarDays, current: false },
  { name: 'Clientes', href: '/dashboard/clients', icon: Users, current: false },
  { name: 'Pagos', href: '/dashboard/payments', icon: CreditCard, current: false },
  { name: 'Servicios', href: '/dashboard/services', icon: UserCheck, current: false },
  { name: 'Sucursales', href: '/dashboard/branches', icon: Building, current: false },
  { name: 'Horarios', href: '/dashboard/working-hours', icon: Clock, current: false },
  { name: 'Configuración', href: '/dashboard/settings', icon: Settings, current: false },
]

export function DashboardNav({ session }: DashboardNavProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg border-r border-gray-200 pt-16 hidden lg:block">
      <div className="flex flex-col h-full">
        {/* Información del tenant */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.tenant?.name}
              </p>
              <p className="text-xs text-gray-600">
                {session?.user?.branch?.name || 'Principal'}
              </p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 flex-shrink-0 h-5 w-5',
                    isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Footer con versión */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            CitaPlanner MVP v1.0
          </p>
        </div>
      </div>
    </nav>
  )
}
