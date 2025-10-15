
/**
 * Settings Page
 * 
 * Página principal de configuración con tabs
 */

'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, User, Building2, ShieldCheck, Link as LinkIcon } from 'lucide-react';
import ProfileSettings from '@/app/components/settings/ProfileSettings';
import TenantSettings from '@/app/components/settings/TenantSettings';
import SecuritySettings from '@/app/components/settings/SecuritySettings';
import QuickLinks from '@/app/components/settings/QuickLinks';

type TabId = 'profile' | 'tenant' | 'security' | 'links';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
  showForRoles?: string[];
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  // Definir tabs disponibles
  const tabs: Tab[] = [
    {
      id: 'profile',
      label: 'Mi Perfil',
      icon: User,
      component: ProfileSettings,
    },
    {
      id: 'tenant',
      label: 'Empresa',
      icon: Building2,
      component: TenantSettings,
    },
    {
      id: 'security',
      label: 'Seguridad',
      icon: ShieldCheck,
      component: SecuritySettings,
    },
    {
      id: 'links',
      label: 'Enlaces',
      icon: LinkIcon,
      component: QuickLinks,
    },
  ];

  // Verificar autenticación
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  // Obtener componente activo
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ProfileSettings;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tu perfil, empresa y preferencias
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap
                      transition-colors
                      ${isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-200">
          <ActiveComponent />
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            CitaPlanner v1.8.2 - Sistema de Gestión de Citas
          </p>
          <p className="mt-1">
            Sesión iniciada como: <span className="font-semibold">{session?.user?.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
