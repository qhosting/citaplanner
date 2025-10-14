
/**
 * Página: Dashboard de Reportes General
 * /dashboard/reports
 */

import { Metadata } from 'next';
import ReportDashboard from '@/components/ReportDashboard';

export const metadata: Metadata = {
  title: 'Reportes | CitaPlanner',
  description: 'Dashboard de reportes y estadísticas'
};

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Reportes y Estadísticas</h1>
        <p className="text-muted-foreground">
          Visualiza el desempeño general de tu negocio
        </p>
      </div>
      <ReportDashboard />
    </div>
  );
}
