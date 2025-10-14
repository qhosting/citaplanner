
/**
 * Página de gestión de sucursales asignadas a un profesional
 * Fase 2: Mass Assignment System
 */

import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma/client';
import ProfessionalBranchesManager from '@/components/ProfessionalBranchesManager';

export const metadata: Metadata = {
  title: 'Sucursales Asignadas - CitaPlanner',
  description: 'Gestionar sucursales asignadas al profesional',
};

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ProfessionalBranchesPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Obtener información del profesional
  const professional = await prisma.user.findFirst({
    where: {
      id: params.id,
      tenantId: session.user.tenantId,
      role: { in: ['PROFESSIONAL', 'ADMIN'] },
    },
  });

  if (!professional) {
    redirect('/dashboard/professionals');
  }

  const professionalName = `${professional.firstName} ${professional.lastName}`;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center space-x-2 text-gray-600">
          <li>
            <a href="/dashboard" className="hover:text-blue-600">
              Dashboard
            </a>
          </li>
          <li>→</li>
          <li>
            <a href="/dashboard/professionals" className="hover:text-blue-600">
              Profesionales
            </a>
          </li>
          <li>→</li>
          <li className="text-gray-900 font-medium">{professionalName}</li>
          <li>→</li>
          <li className="text-gray-900 font-medium">Sucursales</li>
        </ol>
      </nav>

      {/* Main Content */}
      <ProfessionalBranchesManager
        professionalId={professional.id}
        professionalName={professionalName}
      />
    </div>
  );
}
