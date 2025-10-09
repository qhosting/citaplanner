
/**
 * Hook personalizado para gestionar Web Push Notifications
 * 
 * Proporciona funcionalidad para:
 * - Verificar soporte del navegador
 * - Registrar service worker
 * - Solicitar permisos de notificación
 * - Subscribirse/desubscribirse de push notifications
 * - Gestionar estado de subscripción
 */

import { useState, useEffect, useCallback } from 'react';

interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission | null;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  requestPermission: () => Promise<boolean>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  /**
   * Verifica soporte del navegador y registra service worker
   */
  useEffect(() => {
    const checkSupport = async () => {
      // Verificar soporte de Service Worker y Push API
      const supported = 
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

      setIsSupported(supported);

      if (!supported) {
        setError('Tu navegador no soporta notificaciones push');
        return;
      }

      // Obtener permiso actual
      setPermission(Notification.permission);

      try {
        // Registrar service worker
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });

        console.log('Service Worker registrado:', reg);
        setRegistration(reg);

        // Verificar si ya está subscrito
        const subscription = await reg.pushManager.getSubscription();
        setIsSubscribed(!!subscription);

        // Escuchar actualizaciones del service worker
        reg.addEventListener('updatefound', () => {
          console.log('Nueva versión del Service Worker disponible');
        });

      } catch (err) {
        console.error('Error registrando Service Worker:', err);
        setError('Error al registrar el service worker');
      }
    };

    checkSupport();
  }, []);

  /**
   * Solicita permiso para mostrar notificaciones
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Notificaciones no soportadas');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        setError(null);
        return true;
      } else if (result === 'denied') {
        setError('Permisos de notificación denegados');
        return false;
      } else {
        setError('Permisos de notificación no otorgados');
        return false;
      }
    } catch (err) {
      console.error('Error solicitando permisos:', err);
      setError('Error al solicitar permisos');
      return false;
    }
  }, [isSupported]);

  /**
   * Convierte una clave VAPID de base64 a Uint8Array
   */
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  };

  /**
   * Subscribirse a push notifications
   */
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !registration) {
      setError('Service Worker no disponible');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Verificar/solicitar permisos
      if (permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          setIsLoading(false);
          return false;
        }
      }

      // Obtener clave pública VAPID
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('Clave VAPID pública no configurada');
      }

      // Crear subscripción
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      console.log('Subscripción creada:', subscription);

      // Convertir a JSON
      const subscriptionJSON = subscription.toJSON() as PushSubscriptionJSON;

      // Enviar subscripción al servidor
      const response = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscriptionJSON.endpoint,
          keys: subscriptionJSON.keys,
          userAgent: navigator.userAgent
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar subscripción');
      }

      setIsSubscribed(true);
      setIsLoading(false);
      return true;

    } catch (err: any) {
      console.error('Error al subscribirse:', err);
      setError(err.message || 'Error al subscribirse a notificaciones');
      setIsLoading(false);
      return false;
    }
  }, [isSupported, registration, permission, requestPermission]);

  /**
   * Desubscribirse de push notifications
   */
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !registration) {
      setError('Service Worker no disponible');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Obtener subscripción actual
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        setIsSubscribed(false);
        setIsLoading(false);
        return true;
      }

      // Desubscribirse localmente
      const unsubscribed = await subscription.unsubscribe();

      if (unsubscribed) {
        // Notificar al servidor
        const subscriptionJSON = subscription.toJSON() as PushSubscriptionJSON;
        
        await fetch('/api/notifications/push/unsubscribe', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: subscriptionJSON.endpoint
          })
        });

        setIsSubscribed(false);
        setIsLoading(false);
        return true;
      }

      throw new Error('No se pudo desubscribir');

    } catch (err: any) {
      console.error('Error al desubscribirse:', err);
      setError(err.message || 'Error al desubscribirse de notificaciones');
      setIsLoading(false);
      return false;
    }
  }, [isSupported, registration]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    requestPermission
  };
}
