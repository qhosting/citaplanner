/**
 * Página: Dashboard de Comisiones
 * /dashboard/commissions
 */

import { Metadata } from 'next';
import CommissionDashboard from '@/components/CommissionDashboard';

export const metadata: Metadata = {
  title: 'Comisiones | CitaPlanner',
  description: 'Gestión de comisiones de profesionales'
};

export default function CommissionsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Comisiones</h1>
        <p className="text-muted-foreground">
          Visualiza y administra las comisiones de tus profesionales
        </p>
      </div>
      <CommissionDashboard />
    </div>
  );
}
