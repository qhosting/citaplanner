
/**
 * Página: Reporte de Profesional
 * /dashboard/reports/professional/[id]
 */

import { Metadata } from 'next';
import ProfessionalReportView from '@/components/ProfessionalReportView';

export const metadata: Metadata = {
  title: 'Reporte de Profesional | CitaPlanner',
  description: 'Reporte detallado de profesional'
};

interface PageProps {
  params: {
    id: string;
  };
}

export default function ProfessionalReportPage({ params }: PageProps) {
  return (
    <div className="container mx-auto py-6">
      <ProfessionalReportView professionalId={params.id} />
    </div>
  );
}
