
/**
 * Component: Tenant Settings
 * 
 * Formulario para configuración de empresa (solo ADMIN)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Loader2, Building2, Mail, Phone, MapPin, Globe, DollarSign, Calendar, Save, Shield } from 'lucide-react';

interface TenantData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  timezone: string;
  currency: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  allowOnlineBooking: boolean;
  requireClientPhone: boolean;
  requireClientEmail: boolean;
  bookingAdvanceDays: number;
}

export default function TenantSettings() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenant, setTenant] = useState<TenantData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'México',
    timezone: 'America/Mexico_City',
    currency: 'MXN',
    logo: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#EF4444',
    allowOnlineBooking: true,
    requireClientPhone: true,
    requireClientEmail: false,
    bookingAdvanceDays: 30,
  });

  const isAdmin = session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchTenant();
  }, []);

  const fetchTenant = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings/tenant');
      const data = await response.json();

      if (data.success) {
        setTenant(data.data);
      } else {
        toast.error(data.error || 'Error al cargar configuración');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error('No tienes permisos para modificar la configuración');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/settings/tenant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenant),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'Configuración actualizada exitosamente');
      } else {
        toast.error(data.error || 'Error al actualizar configuración');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-yellow-600" />
          <div>
            <h3 className="font-semibold text-yellow-900">Acceso Restringido</h3>
            <p className="text-sm text-yellow-700">
              Solo los administradores pueden modificar la configuración de la empresa.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Configuración de Empresa</h2>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona la información de tu negocio
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="inline-block w-4 h-4 mr-2" />
                Nombre de la Empresa
              </label>
              <input
                type="text"
                value={tenant.name}
                onChange={(e) => setTenant({ ...tenant, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline-block w-4 h-4 mr-2" />
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={tenant.email || ''}
                  onChange={(e) => setTenant({ ...tenant, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline-block w-4 h-4 mr-2" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={tenant.phone || ''}
                  onChange={(e) => setTenant({ ...tenant, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline-block w-4 h-4 mr-2" />
                Dirección
              </label>
              <input
                type="text"
                value={tenant.address || ''}
                onChange={(e) => setTenant({ ...tenant, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={tenant.city || ''}
                  onChange={(e) => setTenant({ ...tenant, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="inline-block w-4 h-4 mr-2" />
                  País
                </label>
                <input
                  type="text"
                  value={tenant.country}
                  onChange={(e) => setTenant({ ...tenant, country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Configuración Regional */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración Regional</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zona Horaria
              </label>
              <select
                value={tenant.timezone}
                onChange={(e) => setTenant({ ...tenant, timezone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                <option value="America/Cancun">Cancún (GMT-5)</option>
                <option value="America/Monterrey">Monterrey (GMT-6)</option>
                <option value="America/Tijuana">Tijuana (GMT-8)</option>
                <option value="America/New_York">Nueva York (GMT-5)</option>
                <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                <option value="Europe/Madrid">Madrid (GMT+1)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline-block w-4 h-4 mr-2" />
                Moneda
              </label>
              <select
                value={tenant.currency}
                onChange={(e) => setTenant({ ...tenant, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="USD">USD - Dólar Estadounidense</option>
                <option value="EUR">EUR - Euro</option>
                <option value="CAD">CAD - Dólar Canadiense</option>
              </select>
            </div>
          </div>
        </div>

        {/* Apariencia */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Apariencia</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo (URL)
              </label>
              <input
                type="url"
                value={tenant.logo || ''}
                onChange={(e) => setTenant({ ...tenant, logo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://play-lh.googleusercontent.com/zxkyosThd1H70sLEFLv_CvXaxaBIWKdcnE0Z_qGEUuLSXRKxbM9Kd807r8ryFJoRIa4"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Primario
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={tenant.primaryColor}
                    onChange={(e) => setTenant({ ...tenant, primaryColor: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={tenant.primaryColor}
                    onChange={(e) => setTenant({ ...tenant, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Secundario
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={tenant.secondaryColor}
                    onChange={(e) => setTenant({ ...tenant, secondaryColor: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={tenant.secondaryColor}
                    onChange={(e) => setTenant({ ...tenant, secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#EF4444"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reservas Online */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Reservas</h3>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={tenant.allowOnlineBooking}
                onChange={(e) => setTenant({ ...tenant, allowOnlineBooking: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Permitir reservas online
              </span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={tenant.requireClientPhone}
                onChange={(e) => setTenant({ ...tenant, requireClientPhone: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Requerir teléfono del cliente
              </span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={tenant.requireClientEmail}
                onChange={(e) => setTenant({ ...tenant, requireClientEmail: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Requerir email del cliente
              </span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline-block w-4 h-4 mr-2" />
                Días de anticipación para reservas
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={tenant.bookingAdvanceDays}
                onChange={(e) => setTenant({ ...tenant, bookingAdvanceDays: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número máximo de días por adelantado que los clientes pueden reservar
              </p>
            </div>
          </div>
        </div>

        {/* Botón guardar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
