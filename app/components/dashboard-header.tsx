
'use client'

import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CalendarDays, LogOut, User, Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'react-hot-toast'

interface DashboardHeaderProps {
  session: Session
}

export function DashboardHeader({ session }: DashboardHeaderProps) {
  const router = useRouter()
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  const handleProfileClick = () => {
    toast('Función de perfil en desarrollo')
    // Futura navegación: router.push('/profile')
  }

  const handleNotificationsClick = () => {
    toast('Función de notificaciones en desarrollo')
    // Futura navegación: router.push('/notifications')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y título */}
          <div className="flex items-center">
            <div className="flex-shrink-0 lg:hidden">
              <CalendarDays className="h-8 w-8 text-blue-600" />
            </div>
            <div className="hidden lg:flex lg:items-center lg:gap-3">
              <CalendarDays className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">CitaPlanner</h1>
                <p className="text-xs text-gray-600">{session?.user?.tenant?.name}</p>
              </div>
            </div>
          </div>

          {/* Navegación derecha */}
          <div className="flex items-center gap-4">
            {/* Notificaciones */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={handleNotificationsClick}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* Menu de usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-10">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:block font-medium">
                    {session?.user?.firstName} {session?.user?.lastName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {session?.user?.firstName} {session?.user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session?.user?.email}
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      {session?.user?.role?.replace('_', ' ')}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <button 
                    className="w-full text-red-600" 
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </button>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <button className="w-full" onClick={handleProfileClick}>
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
