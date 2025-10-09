
# Guía de Configuración: Web Push Notifications

Esta guía te ayudará a configurar y usar las notificaciones push en CitaPlanner.

## 📋 Tabla de Contenidos

1. [Requisitos](#requisitos)
2. [Generación de Claves VAPID](#generación-de-claves-vapid)
3. [Configuración del Servidor](#configuración-del-servidor)
4. [Configuración del Cliente](#configuración-del-cliente)
5. [Pruebas](#pruebas)
6. [Troubleshooting](#troubleshooting)
7. [Consideraciones por Navegador](#consideraciones-por-navegador)

## 🔧 Requisitos

### Navegadores Soportados

- **Chrome/Edge**: Versión 50+ (Soporte completo)
- **Firefox**: Versión 44+ (Soporte completo)
- **Safari**: iOS 16.4+ y macOS 13+ (Requiere agregar a pantalla de inicio en iOS)
- **Opera**: Versión 37+

### Requisitos del Servidor

- Node.js 18+
- HTTPS (requerido en producción)
- Service Worker habilitado

## 🔑 Generación de Claves VAPID

Las claves VAPID (Voluntary Application Server Identification) son necesarias para autenticar tu servidor con los servicios de push.

### Paso 1: Ejecutar el Script de Generación

```bash
cd app
npx ts-node scripts/generate-vapid-keys.ts
```

### Paso 2: Copiar las Claves

El script generará algo como esto:

```
🔑 Generando claves VAPID para Web Push Notifications...

✅ Claves VAPID generadas exitosamente!

📋 Copia estas claves a tu archivo .env:

────────────────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh4U
VAPID_PRIVATE_KEY=UUxI4O8-FbRouAevSmBQ6o8FkGptHI-n0TS9F5vBSrM
VAPID_SUBJECT=mailto:admin@citaplanner.com
────────────────────────────────────────────────────────────────────────────────
```

### Paso 3: Agregar al .env

Copia las claves generadas a tu archivo `.env`:

```env
# Web Push Notifications (VAPID Keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh4U
VAPID_PRIVATE_KEY=UUxI4O8-FbRouAevSmBQ6o8FkGptHI-n0TS9F5vBSrM
VAPID_SUBJECT=mailto:admin@citaplanner.com
```

⚠️ **IMPORTANTE:**
- La clave pública (`NEXT_PUBLIC_*`) es accesible desde el cliente
- La clave privada debe mantenerse **SECRETA**
- `VAPID_SUBJECT` debe ser un `mailto:` o la URL de tu sitio
- Estas claves son únicas para tu aplicación
- **NO** las compartas públicamente ni las subas a Git

## 🖥️ Configuración del Servidor

### 1. Verificar Instalación de Dependencias

```bash
cd app
npm install
```

La dependencia `web-push` ya debería estar instalada.

### 2. Verificar Service Worker

El service worker está ubicado en `public/sw.js` y se registra automáticamente cuando el usuario usa el componente `PushNotificationSetup`.

### 3. Habilitar Push en Configuración

En la base de datos, asegúrate de que `pushEnabled` esté en `true` en la tabla `NotificationSettings`:

```sql
UPDATE "NotificationSettings" 
SET "pushEnabled" = true 
WHERE id = 'tu-settings-id';
```

## 💻 Configuración del Cliente

### Uso del Componente

Importa y usa el componente `PushNotificationSetup` en tu aplicación:

```tsx
import PushNotificationSetup from '@/components/notifications/PushNotificationSetup';

export default function NotificationsPage() {
  return (
    <div>
      <h1>Configuración de Notificaciones</h1>
      <PushNotificationSetup />
    </div>
  );
}
```

### Uso del Hook Personalizado

Si necesitas más control, usa el hook `usePushNotifications`:

```tsx
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function MyComponent() {
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

  const handleSubscribe = async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }
    
    const success = await subscribe();
    if (success) {
      console.log('Subscrito exitosamente!');
    }
  };

  return (
    <div>
      {isSupported ? (
        <button onClick={handleSubscribe} disabled={isLoading}>
          {isSubscribed ? 'Subscrito' : 'Subscribirse'}
        </button>
      ) : (
        <p>Tu navegador no soporta notificaciones push</p>
      )}
    </div>
  );
}
```

## 🧪 Pruebas

### 1. Probar Subscripción

1. Abre tu aplicación en el navegador
2. Navega a la página con el componente `PushNotificationSetup`
3. Haz clic en "Activar Notificaciones Push"
4. Acepta los permisos cuando el navegador lo solicite
5. Verifica que el estado cambie a "Subscrito"

### 2. Enviar Notificación de Prueba

Usa el endpoint de API para enviar una notificación:

```bash
curl -X POST http://localhost:3000/api/notifications/push/send \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "userId": "user-id-here",
    "title": "Prueba de Notificación",
    "body": "Esta es una notificación de prueba",
    "url": "/dashboard"
  }'
```

### 3. Verificar en Consola del Navegador

Abre las DevTools (F12) y verifica:

```javascript
// Verificar si el service worker está registrado
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});

// Verificar subscripción
navigator.serviceWorker.ready.then(registration => {
  registration.pushManager.getSubscription().then(subscription => {
    console.log('Subscripción:', subscription);
  });
});
```

## 🔧 Troubleshooting

### Problema: "Service Worker no se registra"

**Solución:**
- Verifica que estés usando HTTPS (o localhost)
- Asegúrate de que `public/sw.js` existe
- Revisa la consola del navegador para errores

### Problema: "Permisos denegados"

**Solución:**
- Los permisos denegados no se pueden revertir programáticamente
- El usuario debe ir a la configuración del navegador y permitir notificaciones manualmente
- En Chrome: Configuración → Privacidad y seguridad → Configuración de sitios → Notificaciones

### Problema: "VAPID no configurado"

**Solución:**
- Verifica que las variables de entorno estén correctamente configuradas
- Reinicia el servidor después de agregar las claves
- Asegúrate de que las claves no tengan espacios o saltos de línea

### Problema: "Subscripción expirada"

**Solución:**
- Las subscripciones pueden expirar si el usuario no usa el navegador por mucho tiempo
- El sistema automáticamente marca subscripciones expiradas como inactivas
- El usuario debe subscribirse nuevamente

### Problema: "No recibo notificaciones"

**Checklist:**
1. ✅ Service worker registrado correctamente
2. ✅ Permisos otorgados
3. ✅ Usuario subscrito (verificar en base de datos)
4. ✅ VAPID keys configuradas correctamente
5. ✅ `pushEnabled` = true en NotificationSettings
6. ✅ El navegador está abierto (o en background)

## 📱 Consideraciones por Navegador

### Chrome/Edge

- ✅ Soporte completo
- ✅ Notificaciones funcionan incluso con el navegador cerrado (si está en background)
- ✅ Soporte para acciones en notificaciones
- ✅ Soporte para imágenes

### Firefox

- ✅ Soporte completo
- ✅ Notificaciones funcionan con el navegador cerrado
- ✅ Soporte para acciones en notificaciones
- ⚠️ Algunas limitaciones en imágenes grandes

### Safari (macOS)

- ✅ Soporte desde macOS 13 (Ventura)
- ✅ Notificaciones funcionan con el navegador cerrado
- ⚠️ Requiere permisos explícitos del usuario
- ⚠️ Limitaciones en personalización de notificaciones

### Safari (iOS)

- ✅ Soporte desde iOS 16.4
- ⚠️ **Requiere agregar el sitio a la pantalla de inicio** (PWA)
- ⚠️ Solo funciona cuando la app está en background
- ⚠️ Limitaciones significativas en personalización

**Pasos para iOS:**
1. Abrir el sitio en Safari
2. Tocar el botón "Compartir"
3. Seleccionar "Agregar a pantalla de inicio"
4. Abrir la app desde la pantalla de inicio
5. Aceptar permisos de notificaciones

### Opera

- ✅ Soporte completo (basado en Chromium)
- ✅ Mismo comportamiento que Chrome

## 📊 Monitoreo y Mantenimiento

### Limpieza de Subscripciones Inactivas

El sistema incluye un método para limpiar subscripciones antiguas:

```typescript
import { pushService } from '@/lib/services/pushService';

// Limpiar subscripciones inactivas de más de 30 días
await pushService.cleanupInactiveSubscriptions(30);
```

Recomendación: Ejecutar esto periódicamente (ej: cron job diario).

### Verificar Estado de Subscripciones

```sql
-- Ver subscripciones activas por usuario
SELECT 
  u.name,
  u.email,
  COUNT(ps.id) as active_subscriptions
FROM "User" u
LEFT JOIN "PushSubscription" ps ON ps."userId" = u.id AND ps."isActive" = true
GROUP BY u.id, u.name, u.email
ORDER BY active_subscriptions DESC;

-- Ver subscripciones por navegador
SELECT 
  SUBSTRING("userAgent" FROM 'Chrome/[0-9]+|Firefox/[0-9]+|Safari/[0-9]+') as browser,
  COUNT(*) as count
FROM "PushSubscription"
WHERE "isActive" = true
GROUP BY browser;
```

## 🔐 Seguridad

### Mejores Prácticas

1. **Nunca expongas la clave privada VAPID**
   - Solo debe estar en variables de entorno del servidor
   - No la incluyas en el código del cliente

2. **Valida las subscripciones**
   - El sistema automáticamente valida el formato de subscripciones
   - Marca subscripciones expiradas como inactivas

3. **Limita el rate de envío**
   - Implementa límites de envío por usuario/hora
   - Evita spam de notificaciones

4. **Usa HTTPS en producción**
   - Service Workers requieren HTTPS
   - Excepción: localhost para desarrollo

## 📚 Recursos Adicionales

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/rfc8292)

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs del servidor
2. Revisa la consola del navegador
3. Verifica la configuración de VAPID
4. Consulta la sección de Troubleshooting
5. Revisa la documentación de la API en `NOTIFICATIONS_API.md`
