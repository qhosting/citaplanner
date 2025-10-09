'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ClientForm from '@/components/clients/ClientForm';
import type { Client, ClientFormData } from '@/lib/clients/types';

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clients/${clientId}`);

      if (!response.ok) {
        throw new Error('Error al cargar el cliente');
      }

      const data = await response.json();

      if (data.success) {
        setClient(data.data);
      } else {
        throw new Error(data.error || 'Error al cargar el cliente');
      }
    } catch (err) {
      console.error('Error fetching client:', err);
      toast.error('Error al cargar el cliente');
      router.push('/dashboard/clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: ClientFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el cliente');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al actualizar el cliente');
      }

      toast.success('Cliente actualizado correctamente');
      router.push(`/dashboard/clients/${clientId}`);
    } catch (err) {
      console.error('Error updating client:', err);
      toast.error(err instanceof Error ? err.message : 'Error al actualizar el cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/clients/${clientId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Cargando información del cliente...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Cliente no encontrado</p>
        <Button onClick={() => router.push('/dashboard/clients')} className="mt-4">
          Volver a Clientes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Cliente</h1>
          <p className="text-gray-600 mt-1">
            {client.firstName || ''} {client.lastName || 'Sin nombre'}
          </p>
        </div>
      </div>

      {/* Form */}
      <ClientForm
        initialData={{
          firstName: client.firstName,
          lastName: client.lastName,
          phone: client.phone,
          email: client.email || '',
          address: client.address || '',
          birthday: client.birthday || undefined,
          notes: client.notes || '',
          tenantId: client.tenantId,
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  );
}
