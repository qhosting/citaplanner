'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import ClientView from '@/components/clients/ClientView';
import ClientHistory from '@/components/clients/ClientHistory';
import ClientNotesList from '@/components/clients/ClientNotesList';
import ClientPreferences from '@/components/clients/ClientPreferences';
import type { Client } from '@/lib/clients/types';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/clients')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {client.firstName || ''} {client.lastName || 'Sin nombre'}
            </h1>
            <p className="text-gray-600 mt-1">Perfil del Cliente</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/dashboard/clients/${clientId}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="notes">Notas</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ClientView clientData={client} />
        </TabsContent>

        <TabsContent value="history">
          <ClientHistory clientId={clientId} />
        </TabsContent>

        <TabsContent value="notes">
          {session?.user?.id && (
            <ClientNotesList clientId={clientId} userId={session.user.id} />
          )}
        </TabsContent>

        <TabsContent value="preferences">
          <ClientPreferences clientId={clientId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
