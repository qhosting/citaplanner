
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { 
  Calendar, 
  Users, 
  DollarSign,
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export function StaffSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  
  const userRole = (session?.user as any)?.role

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'PROFESSIONAL':
        return 'Profesional'
      case 'MANAGER':
        return 'Manager'
      case 'RECEPTIONIST':
        return 'Recepcionista'
      default:
        return 'Personal'
    }
  }

  // Menú básico para todos los roles de staff
  const baseMenuItems = [
    {
      title: 'Panel de Control',
      href: '/staff',
      icon: BarChart3
    },
    {
      title: 'Mi Agenda',
      href: '/staff/schedule',
      icon: Calendar
    }
  ]

  // Menú adicional para profesionales
  const professionalMenuItems = [
    {
      title: 'Mis Comisiones',
      href: '/staff/commissions',
      icon: DollarSign
    },
    {
      title: 'Mis Clientes',
      href: '/staff/clients',
      icon: Users
    }
  ]

  // Menú adicional para managers y recepcionistas
  const managerMenuItems = [
    {
      title: 'Gestión de Citas',
      href: '/staff/appointments',
      icon: Calendar
    },
    {
      title: 'Clientes',
      href: '/staff/clients',
      icon: Users
    }
  ]

  const settingsMenuItem = {
    title: 'Mi Perfil',
    href: '/staff/profile',
    icon: Settings
  }

  // Construir menú según rol
  let menuItems = [...baseMenuItems]
  
  if (userRole === 'PROFESSIONAL') {
    menuItems = [...menuItems, ...professionalMenuItems]
  } else if (['MANAGER', 'RECEPTIONIST'].includes(userRole)) {
    menuItems = [...menuItems, ...managerMenuItems]
  }
  
  menuItems.push(settingsMenuItem)

  return (
    <div className={`bg-white shadow-lg ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-800">CitaPlanner</h1>
              <p className="text-xs text-gray-500 flex items-center">
                <User className="h-3 w-3 mr-1" />
                {getRoleTitle(userRole)}
              </p>
            </div>
          )}
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
