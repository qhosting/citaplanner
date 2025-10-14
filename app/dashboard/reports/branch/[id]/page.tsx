
/**
 * Página: Reporte de Sucursal
 * /dashboard/reports/branch/[id]
 */

import { Metadata } from 'next';
import BranchReportView from '@/components/BranchReportView';

export const metadata: Metadata = {
  title: 'Reporte de Sucursal | CitaPlanner',
  description: 'Reporte detallado de sucursal'
};

interface PageProps {
  params: {
    id: string;
  };
}

export default function BranchReportPage({ params }: PageProps) {
  return (
    <div className="container mx-auto py-6">
      <BranchReportView branchId={params.id} />
    </div>
  );
}
