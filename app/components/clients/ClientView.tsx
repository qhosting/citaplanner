'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
} from 'lucide-react';
import type { ClientViewProps } from '@/lib/clients/types';

/**
 * Client View Component
 * Displays client information in read-only format
 */
export default function ClientView({ clientData }: ClientViewProps) {
  const getInitials = () => {
    const first = clientData.firstName?.charAt(0) || '';
    const last = clientData.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'CL';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null }) => {
    if (!value) return null;
    
    return (
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-sm text-gray-900">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-blue-100 text-blue-800 text-2xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {clientData.firstName} {clientData.lastName}
                </h2>
                <Badge variant={clientData.isActive ? 'default' : 'secondary'}>
                  {clientData.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <p className="text-gray-600">
                Cliente desde {formatDate(clientData.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow icon={Phone} label="Teléfono" value={clientData.phone} />
          <InfoRow icon={Mail} label="Email" value={clientData.email} />
          <InfoRow icon={MapPin} label="Dirección" value={clientData.address} />
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow 
            icon={Calendar} 
            label="Fecha de Nacimiento" 
            value={clientData.birthday ? formatDate(clientData.birthday) : null} 
          />
        </CardContent>
      </Card>

      {/* Notes */}
      {clientData.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {clientData.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
