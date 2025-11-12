
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { 
  Calendar, 
  Users, 
  CreditCard,
  Package,
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Crown,
  MessageSquare,
  MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/realtime-notifications'

const menuItems = [
  {
    title: 'Panel de Control',
    href: '/admin',
    icon: BarChart3
  },
  {
    title: 'Agenda y Citas',
    href: '/admin/appointments',
    icon: Calendar
  },
  {
    title: 'Clientes (CRM)',
    href: '/admin/clients',
    icon: Users
  },
  {
    title: 'Punto de Venta',
    href: '/admin/pos',
    icon: CreditCard
  },
  {
    title: 'Inventario',
    href: '/admin/inventory',
    icon: Package
  },
  {
    title: 'Marketing',
    href: '/admin/marketing',
    icon: MessageSquare
  },
  {
    title: 'Sucursales',
    href: '/admin/branches',
    icon: MapPin
  },
  {
    title: 'Reportes',
    href: '/admin/reports',
    icon: BarChart3
  },
  {
    title: 'Configuración',
    href: '/admin/settings',
    icon: Settings
  }
]

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className={`bg-white shadow-lg ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-800">CitaPlanner</h1>
              <p className="text-xs text-gray-500 flex items-center">
                <Crown className="h-3 w-3 mr-1" />
                Administrador
              </p>
            </div>
          )}
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2"
            >
              {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}>
                <Icon className="h-5 w-5" />
                {!isCollapsed && (
                  <span className="ml-3 text-sm font-medium">{item.title}</span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className={`${isCollapsed ? 'text-center' : ''}`}>
          {!isCollapsed && session && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-800">
                {(session.user as any)?.firstName} {(session.user as any)?.lastName}
              </p>
              <p className="text-xs text-gray-500">{session.user?.email}</p>
              <p className="text-xs text-gray-400">
                {(session.user as any)?.tenantName}
              </p>
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => signOut()}
            className={`${isCollapsed ? 'w-8 h-8 p-0' : 'w-full'}`}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Cerrar Sesión</span>}
          </Button>
        </div>
      </div>
    </div>
  )
}
