/**
 * Página: Detalle de Comisiones por Profesional
 * /dashboard/commissions/[id]
 */

import { Metadata } from 'next';
import ProfessionalCommissionDetail from '@/components/ProfessionalCommissionDetail';

export const metadata: Metadata = {
  title: 'Detalle de Comisiones | CitaPlanner',
  description: 'Detalle de comisiones del profesional'
};

interface PageProps {
  params: {
    id: string;
  };
}

export default function ProfessionalCommissionPage({ params }: PageProps) {
  return (
    <div className="container mx-auto py-6">
      <ProfessionalCommissionDetail professionalId={params.id} />
    </div>
  );
}
