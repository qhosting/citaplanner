
/**
 * Página de gestión de asignaciones de profesionales a una sucursal
 * Fase 2: Mass Assignment System
 */

import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma/client';
import BranchAssignmentManager from '@/components/BranchAssignmentManager';

export const metadata: Metadata = {
  title: 'Gestión de Profesionales - CitaPlanner',
  description: 'Asignar profesionales a sucursales',
};

interface PageProps {
  params: {
    id: string;
  };
}

export default async function BranchAssignmentsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Obtener información de la sucursal
  const branch = await prisma.branch.findFirst({
    where: {
      id: params.id,
      tenantId: session.user.tenantId,
    },
  });

  if (!branch) {
    redirect('/dashboard/branches');
  }

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
            <a href="/dashboard/branches" className="hover:text-blue-600">
              Sucursales
            </a>
          </li>
          <li>→</li>
          <li className="text-gray-900 font-medium">{branch.name}</li>
          <li>→</li>
          <li className="text-gray-900 font-medium">Profesionales</li>
        </ol>
      </nav>

      {/* Main Content */}
      <BranchAssignmentManager
        branchId={branch.id}
        branchName={branch.name}
      />
    </div>
  );
}
