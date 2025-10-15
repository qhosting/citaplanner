/**
 * DashboardQuickActions Component
 * 
 * Componente que muestra accesos rápidos a funciones principales del dashboard
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CalendarPlus, 
  UserPlus, 
  Calendar, 
  BarChart3, 
  CreditCard, 
  Settings,
  ShoppingCart,
  Users,
  Clock,
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  bgColor: string;
}

export default function DashboardQuickActions() {
  const quickActions: QuickAction[] = [
    {
      title: 'Nueva Cita',
      description: 'Agendar nueva cita',
      icon: CalendarPlus,
      href: '/dashboard/appointments',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Nuevo Cliente',
      description: 'Registrar cliente',
      icon: UserPlus,
      href: '/dashboard/clients',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Ver Calendario',
      description: 'Calendario de citas',
      icon: Calendar,
      href: '/dashboard/calendar',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Reportes',
      description: 'Ver reportes',
      icon: BarChart3,
      href: '/dashboard/reports',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Ventas',
      description: 'Punto de venta',
      icon: ShoppingCart,
      href: '/dashboard/sales/pos',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      title: 'Clientes',
      description: 'Ver clientes',
      icon: Users,
      href: '/dashboard/clients',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Horarios',
      description: 'Gestión de horarios',
      icon: Clock,
      href: '/dashboard/working-hours',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: Settings,
      href: '/dashboard/settings',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Accesos Rápidos</CardTitle>
        <p className="text-sm text-gray-500">
          Accede rápidamente a las funciones principales
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.href}
                className="group"
              >
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer">
                  <div className={`p-2 rounded-lg ${action.bgColor} group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {action.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
