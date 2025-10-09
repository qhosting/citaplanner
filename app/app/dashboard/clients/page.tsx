'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Client } from '@/lib/clients/types';

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clients');

      if (!response.ok) {
        throw new Error('Error al cargar los clientes');
      }

      const data = await response.json();

      if (data.success) {
        setClients(data.data || []);
      } else {
        throw new Error(data.error || 'Error al cargar los clientes');
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
      toast.error('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingClientId) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/clients/${deletingClientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el cliente');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al eliminar el cliente');
      }

      toast.success('Cliente eliminado correctamente');
      setDeletingClientId(null);
      fetchClients();
    } catch (err) {
      console.error('Error deleting client:', err);
      toast.error(err instanceof Error ? err.message : 'Error al eliminar el cliente');
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (client: Client) => {
    const first = client.firstName?.charAt(0) || '';
    const last = client.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'CL';
  };

  const filteredClients = clients.filter((client) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase();
    const email = client.email?.toLowerCase() || '';
    const phone = client.phone || '';

    return fullName.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6" />
            Gestión de Clientes
          </h1>
          <p className="text-gray-600 mt-1">Administra tu base de clientes</p>
        </div>
        <Button onClick={() => router.push('/dashboard/clients/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Con Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter((c) => c.email).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Con Teléfono</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.filter((c) => c.phone).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Clientes ({filteredClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? 'Intenta con otro término de búsqueda'
                  : 'Comienza agregando tu primer cliente'}
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/dashboard/clients/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Cliente
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="border rounded-lg p-4 hover:border-gray-400 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        {client.profilePhotoUrl ? (
                          <AvatarImage src={client.profilePhotoUrl} alt="Perfil" />
                        ) : (
                          <AvatarFallback className="bg-blue-100 text-blue-800">
                            {getInitials(client)}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {client.firstName || ''} {client.lastName || 'Sin nombre'}
                          </h3>
                          {client.city && (
                            <Badge variant="outline" className="text-xs">
                              {client.city}
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          {client.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{client.email}</span>
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 flex-shrink-0" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                          {client.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{client.address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/clients/${client.id}/edit`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingClientId(client.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingClientId} onOpenChange={() => setDeletingClientId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el perfil del cliente y toda su
              información asociada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
