# API de Notificaciones - CitaPlanner

Documentación completa de la API de notificaciones con integración de Evolution API para WhatsApp.

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Configuración](#configuración)
3. [Endpoints](#endpoints)
4. [Plantillas](#plantillas)
5. [Variables Disponibles](#variables-disponibles)
6. [Webhooks](#webhooks)
7. [Ejemplos de Uso](#ejemplos-de-uso)

---

## Introducción

El sistema de notificaciones de CitaPlanner permite enviar mensajes a través de múltiples canales:

- **WhatsApp** (vía Evolution API)
- **Email** (SMTP)
- **SMS** (Twilio)
- **Push Notifications** (Web Push)

### Características

- ✅ Envío individual y masivo
- ✅ Sistema de plantillas con variables dinámicas
- ✅ Historial completo de notificaciones
- ✅ Webhooks para actualización de estados
- ✅ Reintentos automáticos
- ✅ Validación de números de teléfono
- ✅ Logging detallado

---

## Configuración

### Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```bash
# Evolution API para WhatsApp
EVOLUTION_API_URL="https://tu-servidor-evolution.com"
EVOLUTION_API_KEY="tu-api-key"
EVOLUTION_INSTANCE_NAME="tu-instancia"
WHATSAPP_WEBHOOK_SECRET="tu-webhook-secret"
```

### Configuración de Evolution API

#### Opción 1: Baileys (Gratuito)

1. Instala Evolution API en tu servidor
2. Crea una instancia usando QR code
3. Configura las variables de entorno

#### Opción 2: WhatsApp Cloud API (Oficial)

1. Crea una cuenta en Facebook Business Manager
2. Configura WhatsApp Business API
3. Obtén tu Number ID y Token permanente
4. Crea instancia en Evolution API:

```bash
curl -X POST https://tu-servidor-evolution.com/instance/create \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "citaplanner",
    "token": "TU_TOKEN_PERMANENTE",
    "number": "TU_NUMBER_ID",
    "businessId": "TU_BUSINESS_ID",
    "qrcode": false,
    "integration": "WHATSAPP-BUSINESS"
  }'
```

### Configuración en CitaPlanner

Usa el endpoint de configuración para habilitar canales:

```bash
curl -X PUT http://localhost:3000/api/notifications/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "whatsappEnabled": true,
    "evolutionApiUrl": "https://tu-servidor-evolution.com",
    "evolutionApiKey": "tu-api-key",
    "whatsappInstanceName": "citaplanner"
  }'
```

---

## Endpoints

### 1. Configuración

#### GET /api/notifications/settings

Obtiene la configuración actual de notificaciones.

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "whatsappEnabled": true,
    "pushEnabled": false,
    "emailEnabled": true,
    "smsEnabled": false,
    "evolutionApiUrl": "https://...",
    "evolutionApiKey": "***",
    "whatsappInstanceName": "citaplanner",
    "appointmentReminderEnabled": true,
    "appointmentReminderTimes": "[1440, 60]",
    "autoConfirmEnabled": false
  }
}
```

#### PUT /api/notifications/settings

Actualiza la configuración de notificaciones.

**Body:**

```json
{
  "whatsappEnabled": true,
  "evolutionApiUrl": "https://tu-servidor-evolution.com",
  "evolutionApiKey": "tu-api-key",
  "whatsappInstanceName": "citaplanner",
  "appointmentReminderEnabled": true,
  "appointmentReminderTimes": "[1440, 60]"
}
```

---

### 2. Plantillas

#### GET /api/notifications/templates

Lista todas las plantillas de notificaciones.

**Query Params:**

- `type`: NotificationType (opcional)
- `channel`: NotificationChannel (opcional)
- `isActive`: boolean (opcional)

**Ejemplo:**

```bash
curl "http://localhost:3000/api/notifications/templates?channel=WHATSAPP&isActive=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "name": "Recordatorio de Cita - WhatsApp",
      "type": "APPOINTMENT_REMINDER",
      "channel": "WHATSAPP",
      "subject": null,
      "content": "Hola {{clientName}}, te recordamos tu cita...",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/notifications/templates

Crea una nueva plantilla.

**Body:**

```json
{
  "name": "Mi Plantilla Personalizada",
  "type": "CUSTOM",
  "channel": "WHATSAPP",
  "content": "Hola {{clientName}}, este es un mensaje personalizado.",
  "isActive": true
}
```

#### GET /api/notifications/templates/[id]

Obtiene una plantilla específica.

#### PUT /api/notifications/templates/[id]

Actualiza una plantilla existente.

#### DELETE /api/notifications/templates/[id]

Desactiva una plantilla (soft delete).

---

### 3. Envío de WhatsApp

#### POST /api/notifications/whatsapp/send

Envía un mensaje de WhatsApp individual.

**Body:**

```json
{
  "recipientId": "clx...",
  "templateId": "clx...",
  "variables": {
    "clientName": "Juan Pérez",
    "appointmentDate": "2025-01-15",
    "appointmentTime": "10:00",
    "serviceName": "Corte de Cabello",
    "businessName": "Bella Vita Spa"
  },
  "type": "APPOINTMENT_REMINDER"
}
```

**O con mensaje directo:**

```json
{
  "recipientId": "clx...",
  "message": "Hola, este es un mensaje directo sin plantilla.",
  "type": "CUSTOM"
}
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "logId": "clx...",
    "messageId": "3EB0...",
    "message": "Mensaje enviado exitosamente"
  }
}
```

#### POST /api/notifications/whatsapp/send-bulk

Envía mensajes masivos de WhatsApp.

**Body:**

```json
{
  "recipientIds": ["clx1...", "clx2...", "clx3..."],
  "templateId": "clx...",
  "variables": {
    "promotionMessage": "50% de descuento en todos los servicios",
    "promotionValidUntil": "2025-01-31",
    "businessName": "Bella Vita Spa"
  },
  "type": "PROMOTION"
}
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "total": 3,
    "sent": 3,
    "failed": 0,
    "message": "Enviados: 3/3"
  }
}
```

---

### 4. Historial

#### GET /api/notifications/logs

Obtiene el historial de notificaciones con filtros.

**Query Params:**

- `type`: NotificationType
- `channel`: NotificationChannel
- `status`: NotificationStatus
- `recipientId`: string
- `startDate`: ISO date
- `endDate`: ISO date
- `page`: number (default: 1)
- `limit`: number (default: 50, max: 100)

**Ejemplo:**

```bash
curl "http://localhost:3000/api/notifications/logs?channel=WHATSAPP&status=SENT&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "type": "APPOINTMENT_REMINDER",
      "channel": "WHATSAPP",
      "recipientId": "clx...",
      "recipientContact": "5215512345678",
      "subject": null,
      "message": "Hola Juan, te recordamos tu cita...",
      "status": "SENT",
      "metadata": {
        "messageId": "3EB0..."
      },
      "createdAt": "2025-01-01T10:00:00Z",
      "sentAt": "2025-01-01T10:00:01Z",
      "recipient": {
        "id": "clx...",
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "phone": "+52 55 1234 5678"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "stats": {
    "PENDING": 5,
    "SENT": 120,
    "DELIVERED": 100,
    "READ": 80,
    "FAILED": 10
  }
}
```

---

### 5. Webhook

#### POST /api/notifications/whatsapp/webhook

Endpoint para recibir eventos de Evolution API.

**Headers:**

```
Authorization: Bearer YOUR_WEBHOOK_SECRET
```

**Eventos Soportados:**

1. **messages.upsert** - Mensaje enviado
2. **messages.update** - Estado actualizado (delivered, read)

**Configuración en Evolution API:**

1. En tu servidor Evolution API, configura el webhook:

```bash
# En .env de Evolution API
WA_BUSINESS_TOKEN_WEBHOOK=tu-webhook-secret
```

2. En Facebook Developers (para Cloud API):
   - URL: `https://tu-dominio.com/api/notifications/whatsapp/webhook`
   - Token: `tu-webhook-secret`

---

## Plantillas

### Tipos de Notificación

```typescript
enum NotificationType {
  APPOINTMENT_REMINDER    // Recordatorio de cita
  APPOINTMENT_CONFIRMATION // Confirmación de cita
  APPOINTMENT_CANCELLATION // Cancelación de cita
  APPOINTMENT_RESCHEDULE  // Reprogramación de cita
  PROMOTION               // Promoción
  PAYMENT_REMINDER        // Recordatorio de pago
  CUSTOM                  // Personalizado
}
```

### Canales

```typescript
enum NotificationChannel {
  WHATSAPP  // WhatsApp
  EMAIL     // Email
  SMS       // SMS
  PUSH      // Push Notification
}
```

### Estados

```typescript
enum NotificationStatus {
  PENDING    // Pendiente de envío
  SENT       // Enviado
  DELIVERED  // Entregado
  READ       // Leído
  FAILED     // Fallido
}
```

---

## Variables Disponibles

### Cliente

- `{{clientName}}` - Nombre del cliente
- `{{clientEmail}}` - Email del cliente
- `{{clientPhone}}` - Teléfono del cliente

### Cita

- `{{appointmentDate}}` - Fecha de la cita (DD/MM/YYYY)
- `{{appointmentTime}}` - Hora de la cita (HH:MM)
- `{{appointmentDateTime}}` - Fecha y hora completa
- `{{serviceName}}` - Nombre del servicio
- `{{servicePrice}}` - Precio del servicio (formateado)
- `{{serviceDuration}}` - Duración del servicio
- `{{staffName}}` - Nombre del profesional

### Negocio

- `{{businessName}}` - Nombre del negocio
- `{{businessPhone}}` - Teléfono del negocio
- `{{businessAddress}}` - Dirección del negocio
- `{{businessEmail}}` - Email del negocio

### Promociones

- `{{promotionMessage}}` - Mensaje de la promoción
- `{{promotionDiscount}}` - Descuento de la promoción
- `{{promotionValidUntil}}` - Fecha de vencimiento

### Pagos

- `{{amount}}` - Monto a pagar (formateado)
- `{{currency}}` - Moneda
- `{{dueDate}}` - Fecha de vencimiento
- `{{invoiceNumber}}` - Número de factura

---

## Ejemplos de Uso

### Ejemplo 1: Enviar Recordatorio de Cita

```javascript
// Obtener plantilla
const templatesRes = await fetch('/api/notifications/templates?type=APPOINTMENT_REMINDER&channel=WHATSAPP');
const { data: templates } = await templatesRes.json();
const template = templates[0];

// Enviar notificación
const response = await fetch('/api/notifications/whatsapp/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    recipientId: 'clx_client_id',
    templateId: template.id,
    variables: {
      clientName: 'María García',
      appointmentDate: '2025-01-15',
      appointmentTime: '14:30',
      serviceName: 'Masaje Relajante',
      businessName: 'Bella Vita Spa'
    },
    type: 'APPOINTMENT_REMINDER'
  })
});

const result = await response.json();
console.log(result);
// { success: true, data: { logId: '...', messageId: '...' } }
```

### Ejemplo 2: Enviar Promoción Masiva

```javascript
// Obtener todos los clientes activos
const clientsRes = await fetch('/api/clients?status=active');
const { data: clients } = await clientsRes.json();
const recipientIds = clients.map(c => c.id);

// Enviar promoción
const response = await fetch('/api/notifications/whatsapp/send-bulk', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    recipientIds,
    templateId: 'clx_promotion_template',
    variables: {
      promotionMessage: '¡50% de descuento en todos los servicios!',
      promotionValidUntil: '2025-01-31',
      businessName: 'Bella Vita Spa'
    },
    type: 'PROMOTION'
  })
});

const result = await response.json();
console.log(result);
// { success: true, data: { total: 100, sent: 98, failed: 2 } }
```

### Ejemplo 3: Consultar Historial

```javascript
// Obtener notificaciones enviadas hoy
const today = new Date().toISOString().split('T')[0];

const response = await fetch(
  `/api/notifications/logs?startDate=${today}T00:00:00Z&endDate=${today}T23:59:59Z&channel=WHATSAPP`,
  {
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN'
    }
  }
);

const result = await response.json();
console.log(`Total enviados hoy: ${result.stats.SENT}`);
console.log(`Total entregados: ${result.stats.DELIVERED}`);
console.log(`Total leídos: ${result.stats.READ}`);
```

### Ejemplo 4: Crear Plantilla Personalizada

```javascript
const response = await fetch('/api/notifications/templates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    name: 'Bienvenida Nuevo Cliente',
    type: 'CUSTOM',
    channel: 'WHATSAPP',
    content: '¡Bienvenido {{clientName}} a {{businessName}}! Estamos felices de tenerte con nosotros. Para agendar tu primera cita, llámanos al {{businessPhone}}.',
    isActive: true
  })
});

const result = await response.json();
console.log(result);
```

---

## Validación de Números de Teléfono

El sistema valida automáticamente los números de teléfono:

- ✅ Acepta: `+5215512345678`, `5215512345678`, `5512345678`
- ✅ Formatea automáticamente al formato requerido
- ✅ Valida que tenga al menos 10 dígitos
- ❌ Rechaza números inválidos

---

## Manejo de Errores

### Códigos de Error Comunes

- `401` - No autorizado
- `400` - Datos inválidos
- `404` - Recurso no encontrado
- `500` - Error del servidor

### Ejemplo de Respuesta de Error

```json
{
  "success": false,
  "error": "Canal WHATSAPP no está habilitado",
  "details": []
}
```

---

## Mejores Prácticas

1. **Usa plantillas** para mensajes recurrentes
2. **Valida variables** antes de enviar
3. **Monitorea el historial** regularmente
4. **Configura webhooks** para estados en tiempo real
5. **Limita envíos masivos** a 100 destinatarios por lote
6. **Usa delays** entre mensajes para evitar rate limiting
7. **Maneja errores** apropiadamente en tu aplicación

---

## Soporte

Para más información sobre Evolution API:
- Documentación: https://doc.evolution-api.com
- GitHub: https://github.com/EvolutionAPI/evolution-api

Para soporte de CitaPlanner:
- GitHub Issues: https://github.com/qhosting/citaplanner/issues
