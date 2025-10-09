
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  AlertCircle,
  FileText,
} from 'lucide-react';
import type { ClientProfileViewProps } from '@/lib/clients/types';

/**
 * Client Profile View Component
 * Displays client profile information in read-only format
 */
export default function ClientProfileView({ clientData }: ClientProfileViewProps) {
  const getInitials = () => {
    const first = clientData.firstName?.charAt(0) || '';
    const last = clientData.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'CL';
  };

  const getGenderLabel = (gender: string | null) => {
    switch (gender) {
      case 'MASCULINO':
        return 'Masculino';
      case 'FEMENINO':
        return 'Femenino';
      case 'OTRO':
        return 'Otro';
      case 'PREFIERO_NO_DECIR':
        return 'Prefiero no decir';
      default:
        return 'No especificado';
    }
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
      {/* Header with Photo */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24">
              {clientData.profilePhotoUrl ? (
                <AvatarImage src={clientData.profilePhotoUrl} alt="Perfil" />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-800 text-2xl">
                  {getInitials()}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900">
                {clientData.firstName || ''} {clientData.lastName || 'Sin nombre'}
              </h2>
              {clientData.email && (
                <p className="text-gray-600 mt-1">{clientData.email}</p>
              )}
              {clientData.phone && (
                <p className="text-gray-600">{clientData.phone}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                {clientData.occupation && (
                  <Badge variant="outline">{clientData.occupation}</Badge>
                )}
                {clientData.city && (
                  <Badge variant="outline">{clientData.city}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoRow
              icon={Calendar}
              label="Fecha de Nacimiento"
              value={clientData.dateOfBirth ? formatDate(clientData.dateOfBirth) : null}
            />
            <InfoRow
              icon={User}
              label="Género"
              value={getGenderLabel(clientData.gender)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Información de Contacto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InfoRow icon={Mail} label="Email Principal" value={clientData.email} />
              <InfoRow icon={Mail} label="Email Alternativo" value={clientData.alternateEmail} />
            </div>
            <div className="space-y-4">
              <InfoRow icon={Phone} label="Teléfono Principal" value={clientData.phone} />
              <InfoRow icon={Phone} label="Teléfono Alternativo" value={clientData.alternatePhone} />
            </div>
          </div>

          {(clientData.address || clientData.city || clientData.state) && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Dirección</p>
                  <div className="text-sm text-gray-900 space-y-1">
                    {clientData.address && <p>{clientData.address}</p>}
                    {(clientData.city || clientData.state || clientData.postalCode) && (
                      <p>
                        {[clientData.city, clientData.state, clientData.postalCode]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                    {clientData.country && <p>{clientData.country}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Information */}
      {(clientData.occupation || clientData.company) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Información Profesional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoRow icon={Briefcase} label="Ocupación" value={clientData.occupation} />
              <InfoRow icon={Briefcase} label="Empresa" value={clientData.company} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Contact */}
      {(clientData.emergencyContactName || clientData.emergencyContactPhone) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Contacto de Emergencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoRow
                icon={User}
                label="Nombre"
                value={clientData.emergencyContactName}
              />
              <InfoRow
                icon={Phone}
                label="Teléfono"
                value={clientData.emergencyContactPhone}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Notes */}
      {clientData.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notas Adicionales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {clientData.notes}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium">Creado:</span>{' '}
              {formatDate(clientData.createdAt)}
            </div>
            <div>
              <span className="font-medium">Actualizado:</span>{' '}
              {formatDate(clientData.updatedAt)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
