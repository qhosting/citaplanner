
/**
 * Componente de configuración de Push Notifications
 * 
 * Permite al usuario:
 * - Ver el estado de soporte del navegador
 * - Solicitar permisos de notificación
 * - Subscribirse/desubscribirse de push notifications
 * - Ver el estado actual de subscripción
 */

'use client';

import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useState } from 'react';

export default function PushNotificationSetup() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    requestPermission
  } = usePushNotifications();

  const [showDetails, setShowDetails] = useState(false);

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      alert('✅ ¡Subscrito exitosamente a notificaciones push!');
    }
  };

  const handleUnsubscribe = async () => {
    if (confirm('¿Estás seguro de que deseas desubscribirte de las notificaciones push?')) {
      const success = await unsubscribe();
      if (success) {
        alert('✅ Desubscrito exitosamente de notificaciones push');
      }
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      alert('✅ Permisos otorgados. Ahora puedes subscribirte.');
    }
  };

  // Si no hay soporte
  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Notificaciones Push No Soportadas
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Tu navegador no soporta notificaciones push. Por favor, usa un navegador moderno como:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Chrome/Edge (versión 50+)</li>
                <li>Firefox (versión 44+)</li>
                <li>Safari (iOS 16.4+ - requiere agregar a pantalla de inicio)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Notificaciones Push
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Recibe notificaciones en tiempo real en tu navegador
        </p>
      </div>

      {/* Content */}
      <div className="px-6 py-4 space-y-4">
        {/* Estado actual */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Estado</p>
            <p className="text-sm text-gray-500">
              {isSubscribed ? 'Subscrito' : 'No subscrito'}
            </p>
          </div>
          <div>
            {isSubscribed ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Activo
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Inactivo
              </span>
            )}
          </div>
        </div>

        {/* Permisos */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Permisos</p>
            <p className="text-sm text-gray-500">
              {permission === 'granted' && 'Otorgados'}
              {permission === 'denied' && 'Denegados'}
              {permission === 'default' && 'No solicitados'}
            </p>
          </div>
          <div>
            {permission === 'granted' && (
              <span className="text-green-600 text-sm">✓ Permitido</span>
            )}
            {permission === 'denied' && (
              <span className="text-red-600 text-sm">✗ Bloqueado</span>
            )}
            {permission === 'default' && (
              <button
                onClick={handleRequestPermission}
                disabled={isLoading}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Solicitar permisos
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="pt-4 border-t border-gray-200">
          {!isSubscribed ? (
            <button
              onClick={handleSubscribe}
              disabled={isLoading || permission !== 'granted'}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Subscribiendo...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Activar Notificaciones Push
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Desubscribiendo...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Desactivar Notificaciones
                </>
              )}
            </button>
          )}
        </div>

        {/* Detalles técnicos (colapsable) */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <svg
              className={`w-4 h-4 mr-1 transform transition-transform ${showDetails ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Detalles técnicos
          </button>

          {showDetails && (
            <div className="mt-3 space-y-2 text-xs text-gray-600 bg-gray-50 rounded-md p-3">
              <div>
                <span className="font-medium">Navegador:</span> {navigator.userAgent.split(' ').slice(-2).join(' ')}
              </div>
              <div>
                <span className="font-medium">Service Worker:</span> {isSupported ? 'Soportado' : 'No soportado'}
              </div>
              <div>
                <span className="font-medium">Push API:</span> {'PushManager' in window ? 'Disponible' : 'No disponible'}
              </div>
              <div>
                <span className="font-medium">Notification API:</span> {'Notification' in window ? 'Disponible' : 'No disponible'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer con información */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <p className="text-xs text-gray-500">
          💡 Las notificaciones push te permiten recibir alertas en tiempo real sobre citas, recordatorios y actualizaciones importantes.
        </p>
      </div>
    </div>
  );
}
