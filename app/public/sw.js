
/**
 * Service Worker para Web Push Notifications
 * 
 * Este service worker maneja:
 * - Recepción de notificaciones push
 * - Mostrar notificaciones al usuario
 * - Manejar clicks en notificaciones
 * - Gestión del ciclo de vida del service worker
 */

// Versión del service worker (incrementar para forzar actualización)
const SW_VERSION = '1.0.0';
const CACHE_NAME = `citaplanner-push-v${SW_VERSION}`;

/**
 * Evento de instalación del service worker
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando versión:', SW_VERSION);
  // Forzar activación inmediata
  self.skipWaiting();
});

/**
 * Evento de activación del service worker
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando versión:', SW_VERSION);
  
  // Limpiar caches antiguos
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      // Tomar control de todas las páginas inmediatamente
      return self.clients.claim();
    })
  );
});

/**
 * Evento push - Recibe y muestra notificaciones
 */
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push recibido:', event);

  // Datos por defecto
  let notificationData = {
    title: 'CitaPlanner',
    body: 'Nueva notificación',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'citaplanner-notification',
    requireInteraction: false,
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  // Parsear datos del push
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        ...notificationData,
        ...payload,
        data: {
          ...notificationData.data,
          ...(payload.data || {})
        }
      };
    } catch (error) {
      console.error('[Service Worker] Error parseando datos del push:', error);
      notificationData.body = event.data.text();
    }
  }

  // Opciones de la notificación
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    requireInteraction: notificationData.requireInteraction,
    data: notificationData.data,
    vibrate: [200, 100, 200], // Patrón de vibración
    actions: notificationData.actions || [
      {
        action: 'open',
        title: 'Abrir',
        icon: '/icon-open.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icon-close.png'
      }
    ]
  };

  // Agregar imagen si está disponible
  if (notificationData.image) {
    options.image = notificationData.image;
  }

  // Mostrar la notificación
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

/**
 * Evento notificationclick - Maneja clicks en notificaciones
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificación clickeada:', event);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  // Si el usuario clickeó "cerrar", no hacer nada más
  if (action === 'close') {
    return;
  }

  // URL a abrir (por defecto la raíz)
  const urlToOpen = data.url || '/';

  // Abrir o enfocar la ventana
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Buscar si ya hay una ventana abierta con la URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        const clientUrl = new URL(client.url);
        const targetUrl = new URL(urlToOpen, self.location.origin);

        if (clientUrl.pathname === targetUrl.pathname && 'focus' in client) {
          return client.focus();
        }
      }

      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

/**
 * Evento notificationclose - Maneja cierre de notificaciones
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notificación cerrada:', event);
  
  // Aquí podrías enviar analytics o actualizar el estado
  const notification = event.notification;
  const data = notification.data || {};

  // Opcional: Enviar evento de cierre al servidor
  if (data.trackClose) {
    event.waitUntil(
      fetch('/api/notifications/push/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'close',
          notificationId: data.id,
          timestamp: Date.now()
        })
      }).catch((error) => {
        console.error('[Service Worker] Error enviando tracking:', error);
      })
    );
  }
});

/**
 * Evento message - Comunicación con la página
 */
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Mensaje recibido:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: SW_VERSION });
  }
});

console.log('[Service Worker] Cargado - Versión:', SW_VERSION);
