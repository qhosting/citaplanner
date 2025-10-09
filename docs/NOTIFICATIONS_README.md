
# Sistema de Notificaciones CitaPlanner

## Resumen Ejecutivo

CitaPlanner cuenta con un sistema completo de notificaciones multicanal que permite mantener a los clientes informados sobre sus citas de manera automática. El sistema soporta WhatsApp, notificaciones push web, email y SMS, con automatización completa basada en eventos.

## Características Principales

### ✅ Notificaciones Multicanal
- **WhatsApp**: Integración con Evolution API
- **Push Web**: Notificaciones del navegador usando Web Push API
- **Email**: Notificaciones por correo electrónico
- **SMS**: Soporte para proveedores de SMS (configurable)

### ✅ Automatización Completa
- **Confirmación automática** al crear citas
- **Recordatorios programados** (24h, 1h antes, configurable)
- **Notificaciones de cambios** al reprogramar citas
- **Alertas de cancelación** automáticas
- **Recordatorios de pago** para ventas pendientes

### ✅ Gestión Inteligente
- **Prevención de duplicados** automática
- **Sistema de plantillas** personalizables
- **Historial completo** de notificaciones
- **Estadísticas y reportes** de entrega
- **Reintentos automáticos** para fallos

### ✅ Panel de Administración
- Configuración de canales por tenant
- Gestión de plantillas de mensajes
- Configuración de tiempos de recordatorio
- Visualización de historial y estadísticas
- Pruebas de notificaciones

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    CitaPlanner Frontend                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Citas UI   │  │  Config UI   │  │  History UI  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Appointments │  │ Notification │  │  Cron Jobs   │      │
│  │   Endpoints  │  │   Endpoints  │  │   Endpoint   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        NotificationAutomationService                  │   │
│  │  • sendAppointmentConfirmation()                     │   │
│  │  • sendAppointmentReminders()                        │   │
│  │  • sendAppointmentRescheduleNotification()           │   │
│  │  • sendAppointmentCancellationNotification()         │   │
│  │  • sendPaymentReminder()                             │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │           NotificationService                         │   │
│  │  • sendNotification()                                │   │
│  │  • sendBulkNotifications()                           │   │
│  │  • getNotificationHistory()                          │   │
│  └────────────────────┬─────────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Evolution   │ │  Push Service│ │ Email Service│
│  API Service │ │   (Web Push) │ │   (SMTP)     │
│  (WhatsApp)  │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   WhatsApp   │ │   Browser    │ │    Email     │
│   Messages   │ │    Push      │ │   Messages   │
└──────────────┘ └──────────────┘ └──────────────┘
```

## Componentes del Sistema

### 1. Base de Datos (Prisma Models)

#### NotificationSettings
Configuración global por tenant:
- Canales habilitados/deshabilitados
- Configuración de Evolution API
- Tiempos de recordatorio
- Auto-confirmación

#### NotificationTemplate
Plantillas de mensajes personalizables:
- Por tipo de notificación
- Por canal de entrega
- Variables dinámicas
- Plantillas por defecto

#### NotificationLog
Historial completo de notificaciones:
- Estado de entrega
- Timestamps
- Errores
- Metadata

#### PushSubscription
Suscripciones de navegadores:
- Endpoint de push
- Keys de autenticación
- Por usuario/cliente

### 2. Servicios Backend

#### NotificationAutomationService
Lógica de automatización:
- Dispara notificaciones basadas en eventos
- Verifica configuración y permisos
- Previene duplicados
- Maneja errores

#### NotificationService
Envío de notificaciones:
- Integración con canales
- Procesamiento de plantillas
- Logging de operaciones
- Manejo de errores

#### Evolution API Service
Integración con WhatsApp:
- Envío de mensajes
- Verificación de estado
- Manejo de webhooks

#### Push Service
Notificaciones web push:
- Gestión de suscripciones
- Envío de notificaciones
- VAPID authentication

### 3. Middleware y Utilidades

#### NotificationMiddleware
Funciones helper para disparar notificaciones:
- Ejecución asíncrona
- No bloquea respuestas
- Manejo de errores

#### NotificationDeduplication
Prevención de duplicados:
- Verifica historial reciente
- Configurable por tipo
- Fail-safe

#### Template Processor
Procesamiento de plantillas:
- Reemplazo de variables
- Formateo de fechas
- Sanitización

### 4. Cron Jobs

#### Local Scheduler (Desarrollo)
Sistema de cron jobs local:
- Recordatorios cada hora
- Limpieza de logs diaria
- Recordatorios de pago

#### Vercel Cron (Producción)
Cron jobs en la nube:
- Configuración en vercel.json
- Endpoint protegido
- Logging detallado

### 5. Frontend (React/Next.js)

#### Panel de Configuración
- Habilitar/deshabilitar canales
- Configurar Evolution API
- Configurar tiempos de recordatorio
- Probar notificaciones

#### Gestión de Plantillas
- Crear/editar plantillas
- Vista previa con variables
- Activar/desactivar
- Plantillas por defecto

#### Historial de Notificaciones
- Filtros avanzados
- Estadísticas
- Exportación
- Detalles de entrega

## Flujos de Trabajo

### Flujo 1: Confirmación de Cita

```
Usuario crea cita
       │
       ▼
POST /api/appointments
       │
       ▼
Cita guardada en DB
       │
       ▼
triggerAppointmentConfirmation()
       │
       ▼
NotificationAutomationService
       │
       ├─► Verificar configuración
       ├─► Verificar duplicados
       ├─► Obtener plantilla
       ├─► Procesar variables
       │
       ├─► WhatsApp (si habilitado)
       ├─► Push (si habilitado)
       └─► Email (si habilitado)
       │
       ▼
Logs guardados en DB
       │
       ▼
Cliente recibe notificación
```

### Flujo 2: Recordatorios Automáticos

```
Cron Job (cada hora)
       │
       ▼
GET /api/cron/send-reminders
       │
       ▼
NotificationAutomationService.sendAppointmentReminders()
       │
       ├─► Obtener configuraciones activas
       ├─► Para cada tenant:
       │   ├─► Parsear tiempos de recordatorio
       │   ├─► Buscar citas próximas
       │   └─► Para cada cita:
       │       ├─► Verificar duplicados
       │       ├─► Obtener plantilla
       │       ├─► Enviar por canales habilitados
       │       └─► Guardar log
       │
       ▼
Retornar estadísticas
```

### Flujo 3: Reprogramación de Cita

```
Usuario modifica cita
       │
       ▼
PUT /api/appointments/[id]
       │
       ├─► Detectar cambio de fecha/hora
       │
       ▼
triggerAppointmentReschedule()
       │
       ▼
NotificationAutomationService
       │
       ├─► Verificar configuración
       ├─► Verificar duplicados
       ├─► Obtener plantilla
       ├─► Procesar variables (fecha vieja y nueva)
       │
       └─► Enviar por canales habilitados
       │
       ▼
Cliente recibe notificación de cambio
```

## Configuración Rápida

### 1. Variables de Entorno

```bash
# Automatización
NOTIFICATION_AUTOMATION_ENABLED=true
CRON_SECRET=tu_token_secreto

# VAPID Keys (Push)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_public_key
VAPID_PRIVATE_KEY=tu_private_key

# Evolution API (WhatsApp)
EVOLUTION_API_URL=https://tu-api.com
EVOLUTION_API_KEY=tu_api_key
WHATSAPP_INSTANCE_NAME=citaplanner
```

### 2. Configuración en la Aplicación

1. Ir a **Configuración → Notificaciones**
2. Habilitar canales deseados
3. Configurar Evolution API (WhatsApp)
4. Configurar tiempos de recordatorio
5. Probar notificaciones

### 3. Crear Plantillas

1. Ir a **Notificaciones → Plantillas**
2. Crear plantilla para cada tipo
3. Usar variables: `{{clientName}}`, `{{appointmentDate}}`, etc.
4. Activar plantilla

## Casos de Uso

### Caso 1: Salón de Belleza

**Configuración:**
- WhatsApp: ✅ Habilitado
- Push: ✅ Habilitado
- Recordatorios: 24h y 1h antes

**Flujo:**
1. Cliente agenda cita online
2. Recibe confirmación por WhatsApp inmediatamente
3. 24h antes: Recordatorio por WhatsApp
4. 1h antes: Recordatorio por Push
5. Si reprograma: Notificación de cambio

### Caso 2: Consultorio Médico

**Configuración:**
- WhatsApp: ✅ Habilitado
- Email: ✅ Habilitado
- Recordatorios: 48h, 24h y 2h antes

**Flujo:**
1. Recepcionista crea cita
2. Paciente recibe confirmación por email
3. 48h antes: Recordatorio por WhatsApp
4. 24h antes: Recordatorio por email
5. 2h antes: Recordatorio por WhatsApp

### Caso 3: Centro de Estética

**Configuración:**
- WhatsApp: ✅ Habilitado
- Push: ✅ Habilitado
- Email: ✅ Habilitado
- Recordatorios: 24h y 1h antes

**Flujo:**
1. Cliente agenda múltiples servicios
2. Confirmación por todos los canales
3. Recordatorios automáticos
4. Si cancela: Notificación inmediata
5. Recordatorios de pago si queda saldo

## Mejores Prácticas

### 1. Configuración de Canales

✅ **Recomendado:**
- WhatsApp para confirmaciones y recordatorios
- Push para recordatorios de última hora
- Email para confirmaciones con detalles

❌ **Evitar:**
- Habilitar todos los canales sin necesidad
- SMS sin configuración adecuada
- Demasiados recordatorios (spam)

### 2. Tiempos de Recordatorio

✅ **Recomendado:**
- Servicios cortos: 24h y 1h antes
- Servicios largos: 48h, 24h y 2h antes
- Servicios premium: 72h, 24h y 4h antes

❌ **Evitar:**
- Más de 3 recordatorios
- Recordatorios muy cercanos entre sí
- Recordatorios muy lejanos (>7 días)

### 3. Plantillas de Mensajes

✅ **Recomendado:**
- Mensajes cortos y claros
- Incluir información esencial
- Tono amigable y profesional
- Emojis moderados (WhatsApp)

❌ **Evitar:**
- Mensajes muy largos
- Información innecesaria
- Tono muy formal o muy informal
- Exceso de emojis

### 4. Monitoreo

✅ **Recomendado:**
- Revisar estadísticas semanalmente
- Monitorear tasa de entrega
- Verificar notificaciones fallidas
- Ajustar configuración según feedback

❌ **Evitar:**
- Ignorar notificaciones fallidas
- No revisar logs
- No actualizar plantillas
- No probar cambios

## Documentación Adicional

### Guías Técnicas
- **[NOTIFICATION_AUTOMATION.md](./NOTIFICATION_AUTOMATION.md)**: Documentación técnica completa del sistema de automatización
- **[NOTIFICATIONS_DEPLOYMENT.md](./NOTIFICATIONS_DEPLOYMENT.md)**: Guía paso a paso para deployment en producción

### Código Fuente
- `app/lib/services/notificationAutomationService.ts`: Servicio de automatización
- `app/lib/services/notificationService.ts`: Servicio de envío
- `app/lib/middleware/notificationMiddleware.ts`: Middleware de notificaciones
- `app/api/cron/send-reminders/route.ts`: Endpoint de cron job

### Base de Datos
- `app/prisma/schema.prisma`: Schema de Prisma con modelos de notificaciones

## Roadmap

### Fase 1: ✅ Completada
- [x] Sistema de notificaciones multicanal
- [x] Integración con Evolution API (WhatsApp)
- [x] Web Push Notifications
- [x] Panel de administración
- [x] Sistema de plantillas

### Fase 2: ✅ Completada
- [x] Automatización completa
- [x] Cron jobs para recordatorios
- [x] Prevención de duplicados
- [x] Integración con endpoints de citas
- [x] Documentación completa

### Fase 3: 🔄 En Planificación
- [ ] Sistema de colas con reintentos
- [ ] Dashboard de estadísticas avanzadas
- [ ] A/B testing de plantillas
- [ ] Integración con más canales (Telegram)
- [ ] Machine learning para optimización

### Fase 4: 📋 Futuro
- [ ] Notificaciones personalizadas por cliente
- [ ] Segmentación avanzada
- [ ] Campañas de marketing
- [ ] Integración con CRM
- [ ] App móvil nativa

## Soporte y Contribución

### Reportar Problemas
Si encuentras un bug o tienes una sugerencia:
1. Revisa la documentación técnica
2. Verifica los logs de la aplicación
3. Crea un issue en GitHub con detalles

### Contribuir
Para contribuir al sistema de notificaciones:
1. Fork del repositorio
2. Crea una rama para tu feature
3. Implementa cambios con tests
4. Crea un Pull Request

### Contacto
Para preguntas o soporte:
- Documentación: Este archivo y guías técnicas
- Issues: GitHub Issues
- Email: soporte@citaplanner.com

---

**CitaPlanner** - Sistema de Gestión de Citas Profesional
Versión 1.3.0 - Sistema de Notificaciones Completo
