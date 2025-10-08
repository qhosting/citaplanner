'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ClientForm from '@/components/clients/ClientForm';
import type { ClientFormData } from '@/lib/clients/types';

export default function NewClientPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ClientFormData) => {
    try {
      setIsLoading(true);

      // Ensure we have a tenantId
      if (!data.tenantId && session?.user?.tenantId) {
        data.tenantId = session.user.tenantId;
      }

      if (!data.tenantId) {
        toast.error('Error: No se pudo identificar el tenant');
        return;
      }

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al crear el cliente');
      }

      toast.success('Cliente creado correctamente');
      router.push(`/dashboard/clients/${result.data.id}`);
    } catch (err) {
      console.error('Error creating client:', err);
      toast.error(err instanceof Error ? err.message : 'Error al crear el cliente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/clients');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Cliente</h1>
          <p className="text-gray-600 mt-1">Agrega un nuevo cliente a tu base de datos</p>
        </div>
      </div>

      {/* Form */}
      <ClientForm
        initialData={{
          firstName: '',
          lastName: '',
          phone: '',
          tenantId: session?.user?.tenantId || '',
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
}
