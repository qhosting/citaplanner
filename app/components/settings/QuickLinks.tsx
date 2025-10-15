
/**
 * Component: Quick Links
 * 
 * Enlaces rápidos a otras páginas de configuración
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Building2, Clock, BarChart3, Calendar, ChevronRight } from 'lucide-react';

export default function QuickLinks() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  const isProfessional = session?.user?.role === 'PROFESSIONAL';

  const links = [
    {
      title: 'Gestión de Sucursales',
      description: 'Administra las sucursales de tu empresa',
      href: '/dashboard/branches',
      icon: Building2,
      color: 'blue',
      show: isAdmin,
    },
    {
      title: 'Horarios de Trabajo',
      description: 'Configura tus horarios disponibles',
      href: '/dashboard/working-hours',
      icon: Clock,
      color: 'green',
      show: isProfessional || isAdmin,
    },
    {
      title: 'Reportes',
      description: 'Visualiza estadísticas y reportes',
      href: '/dashboard/reports',
      icon: BarChart3,
      color: 'purple',
      show: true,
    },
    {
      title: 'Calendario',
      description: 'Gestiona tus citas y disponibilidad',
      href: '/dashboard/calendar',
      icon: Calendar,
      color: 'orange',
      show: true,
    },
  ];

  const visibleLinks = links.filter(link => link.show);

  if (visibleLinks.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Enlaces Rápidos</h2>
        <p className="text-sm text-gray-500 mt-1">
          Acceso directo a otras configuraciones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            orange: 'bg-orange-100 text-orange-600',
          }[link.color];

          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className={`p-3 rounded-lg ${colorClasses} mr-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {link.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {link.description}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
