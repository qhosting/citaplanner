
# Changelog

All notable changes to CitaPlanner will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.8.0] - 2025-10-14

### Added - Fase 4: Vista de Calendario por Profesional

#### Dependencias
- **react-big-calendar** - Librería de calendario interactivo
- **date-fns** - Manejo de fechas y localización
- **@types/react-big-calendar** - Tipos TypeScript

#### Backend

- **CalendarManager Service** (600+ líneas)
  - `getCalendarEvents()` - Obtener eventos con filtros avanzados
  - `getProfessionalAvailability()` - Calcular disponibilidad completa
  - `validateAvailability()` - Validar antes de crear/mover citas
  - `getCalendarStatistics()` - Estadísticas del calendario
  - `getAvailableSlots()` - Slots disponibles para agendar
  - `validateCalendarAccess()` - Validación de permisos por rol
  - Integración con `scheduleManager` (Fase 1)
  - Integración con `branchAssignments` (Fase 2)
  - Manejo de horarios override por sucursal
  - Procesamiento de excepciones (vacaciones, bajas)

#### API Endpoints
- `GET /api/calendar/professional/[id]` - Eventos del calendario con filtros
- `GET /api/calendar/availability/[professionalId]` - Disponibilidad y horarios
- `GET /api/calendar/availability/[professionalId]/slots` - Slots disponibles
- `POST /api/calendar/availability/validate` - Validar disponibilidad
- `POST /api/calendar/appointments` - Crear cita desde calendario
- `PATCH /api/calendar/appointments/[id]/reschedule` - Reprogramar cita (drag & drop)
- `GET /api/calendar/statistics/[professionalId]` - Estadísticas del calendario
- `GET /api/professionals/me` - Datos del profesional autenticado

#### Tipos TypeScript (400+ líneas)
- `CalendarEvent` - Evento del calendario con metadata completa
- `CalendarEventResource` - Datos de la cita (cliente, servicio, estado)
- `AvailabilityBlock` - Bloques de disponibilidad (regular/exception/override)
- `ProfessionalAvailability` - Disponibilidad completa de profesional
- `CalendarFilters` - Filtros avanzados del calendario
- `CalendarView` - Vistas del calendario (month/week/day/agenda)
- `CalendarStatistics` - Estadísticas y métricas del calendario
- Helpers: `createCalendarEventFromAppointment()`, `getStatusColor()`, `getDateRangeForView()`

#### Frontend Components

- **ProfessionalCalendar** (300+ líneas)
  - Integración completa con react-big-calendar
  - Vistas: mensual, semanal, diaria, agenda
  - Drag & drop para reprogramar citas
  - Resize de eventos
  - Estilos personalizados por estado
  - Visualización de disponibilidad
  - Localización en español
  - Responsive design

- **CalendarFilters** (150+ líneas)
  - Selector de vista (mes/semana/día/agenda)
  - Filtro por profesional (admin/gerente)
  - Filtro por sucursal
  - Filtro por estado de cita
  - Filtro por servicio
  - Aplicación en tiempo real

- **CalendarLegend** (100+ líneas)
  - Leyenda de colores por estado
  - Indicadores de disponibilidad
  - Diseño compacto y claro

- **AppointmentModal** (350+ líneas)
  - Tres modos: crear, editar, ver
  - Formulario completo con validaciones
  - Auto-cálculo de endTime según servicio
  - Botón de cancelar cita
  - Manejo de errores inline
  - Estados visuales

#### Páginas
- `/dashboard/calendar/page.tsx` - Página principal del calendario (500+ líneas)
  - Estado completo del calendario
  - Gestión de eventos y disponibilidad
  - Integración con API endpoints
  - Manejo de drag & drop
  - Sistema de filtros
  - Modal de citas
  - Permisos por rol
  - Loading states
  - Error handling

#### Funcionalidades Implementadas

##### Vistas del Calendario
- ✅ Vista mensual - Resumen del mes completo
- ✅ Vista semanal - 7 días con slots de tiempo
- ✅ Vista diaria - Día detallado con todos los slots
- ✅ Vista agenda - Lista cronológica de citas

##### Gestión de Citas
- ✅ **Crear citas** - Click en slot disponible → Modal → Crear
- ✅ **Editar citas** - Click en evento → Modal → Editar
- ✅ **Cancelar citas** - Botón en modal con confirmación
- ✅ **Reprogramar (Drag & Drop)** - Arrastrar evento → Validar → Guardar
- ✅ **Resize de eventos** - Ajustar duración visualmente

##### Validaciones Automáticas
- ✅ Horario dentro de disponibilidad
- ✅ Sin solapamientos con otras citas
- ✅ Respeto a excepciones (vacaciones, bajas)
- ✅ Duración correcta del servicio
- ✅ Permisos por rol

##### Visualización de Disponibilidad
- ✅ Bloques disponibles (fondo blanco, clickeable)
- ✅ Bloques no disponibles (fondo gris, bloqueado)
- ✅ Excepciones (vacaciones) diferenciadas
- ✅ Horarios override por sucursal

##### Filtros Avanzados
- ✅ Filtro por profesional (admin/gerente)
- ✅ Filtro por sucursal
- ✅ Filtro por estado (pendiente, confirmada, completada, etc.)
- ✅ Filtro por servicio
- ✅ Aplicación en tiempo real sin recargar

##### Permisos por Rol
- ✅ **Profesional**: Solo su propio calendario
- ✅ **Gerente**: Calendarios de profesionales de su(s) sucursal(es)
- ✅ **Admin/Super Admin**: Todos los calendarios
- ✅ **Cliente**: Sin acceso

#### Integración con Fases Anteriores

##### Fase 1 (Horarios)
- ✅ Usa `scheduleManager.ts` para obtener horarios
- ✅ Respeta `ProfessionalSchedule` (dayOfWeek, startTime, endTime)
- ✅ Procesa `ScheduleException` para bloquear fechas
- ✅ Calcula disponibilidad basada en configuración

##### Fase 2 (Asignaciones)
- ✅ Considera `branchAssignments` con sucursal primaria
- ✅ Aplica `scheduleOverride` cuando está definido
- ✅ Filtra por sucursal en queries
- ✅ Valida permisos de gerente según sucursales

##### Fase 3 (Reportes)
- ✅ Estadísticas del calendario complementan reportes
- ✅ `CalendarStatistics` incluye métricas de utilización
- ✅ Datos alimentan dashboards de análisis

#### Características Técnicas
- 🔒 Validaciones robustas en backend y frontend
- 🚀 Rendimiento optimizado con lazy loading
- 📱 Responsive design con TailwindCSS
- 🌐 Localización completa en español
- ♿ Accesibilidad con ARIA labels
- 🎨 UI/UX intuitiva y profesional
- 📊 Estadísticas de utilización
- 🔔 Toast notifications para feedback
- ⚡ Actualizaciones en tiempo real

### Documentation
- `FASE4_CALENDAR.md` - Documentación completa de la Fase 4 (50+ páginas)
  - Arquitectura detallada
  - API Endpoints con ejemplos
  - Componentes Frontend
  - Guías de uso para cada rol
  - Testing manual checklist
  - Integración con fases anteriores
  - Próximos pasos

### Statistics
- 17 archivos nuevos/modificados
- ~3,000 líneas de código
- 4 componentes React principales
- 8 endpoints API
- 30+ tipos TypeScript
- 10+ métodos de servicio
- Sin breaking changes
- 100% compatible con fases anteriores

### Breaking Changes
- ❌ **Ninguno** - Completamente compatible con v1.7.0

### Notes
- Sistema de calendario completamente funcional
- Drag & drop con validaciones en tiempo real
- Integración perfecta con horarios y asignaciones
- Permisos estrictos según rol
- Código limpio, comentado y mantenible
- Listo para producción

## [1.7.0] - 2025-10-14

### Added - Fase 3: Sistema de Reportes

#### Backend
- **ReportManager Service** (800+ líneas)
  - Generación de reportes por profesional, sucursal y general
  - Cálculo de métricas: citas, ingresos, tiempo, clientes
  - Tendencias y análisis temporal
  - Soporte para múltiples períodos (día, semana, mes, año, custom)
  - Reportes comparativos entre profesionales o sucursales

#### API Endpoints
- `GET /api/reports/professional/[id]` - Reporte de profesional
- `GET /api/reports/branch/[id]` - Reporte de sucursal
- `GET /api/reports/overview` - Reporte general del negocio
- `GET /api/reports/comparison` - Reportes comparativos

#### Frontend Components
- **ReportDashboard** (400+ líneas)
  - Dashboard general con métricas consolidadas
  - Gráficos de tendencias (líneas)
  - Top 10 profesionales, sucursales y servicios
  - Filtros de período y rango de fechas
  
- **ProfessionalReportView** (450+ líneas)
  - Vista detallada de profesional
  - Métricas individuales
  - Desempeño por sucursal
  - Servicios más realizados
  - Gráficos de pastel y barras
  
- **BranchReportView** (450+ líneas)
  - Vista detallada de sucursal
  - Métricas de sucursal
  - Desempeño de profesionales
  - Servicios más solicitados
  - Análisis de utilización

#### Páginas
- `/dashboard/reports` - Dashboard principal de reportes
- `/dashboard/reports/professional/[id]` - Reporte de profesional
- `/dashboard/reports/branch/[id]` - Reporte de sucursal

#### Tipos TypeScript
- Tipos completos para reportes (350+ líneas)
- Interfaces para métricas y filtros
- Enums para períodos y estados

#### Visualizaciones
- Gráficos de línea (tendencias)
- Gráficos de barras (comparativas)
- Gráficos de pastel (distribuciones)
- Tarjetas de métricas clave
- Integración con Recharts

#### Métricas Calculadas
- **Citas**: Total, completadas, canceladas, tasas
- **Ingresos**: Total, promedio, proyectado
- **Tiempo**: Horas trabajadas, utilización, horas pico
- **Clientes**: Total, nuevos, retención

### Documentation
- `FASE3_REPORTS.md` - Documentación completa de la Fase 3
- Casos de uso detallados
- Guías de integración
- Ejemplos de API

### Statistics
- 14 archivos nuevos
- ~3,500 líneas de código
- 3 componentes React principales
- 4 endpoints API
- 20+ tipos TypeScript
- 12+ métodos de servicio

## [1.6.0] - 2025-10-14

### Added - Fase 2: Sistema de Asignación Masiva

#### Backend
- **BranchAssignment Model**
  - Relación muchos-a-muchos entre profesionales y sucursales
  - Gestión de sucursal primaria
  - Estados activo/inactivo con soft delete
  - Fechas de vigencia (inicio y fin)
  - Campo para horarios específicos por sucursal
  - Índices optimizados para consultas

- **BranchAssignmentManager Service** (600+ líneas)
  - `validateAssignment()` - Validación completa de asignaciones
  - `createAssignment()` - Crear asignación individual
  - `assignProfessionalsToBranch()` - Asignación masiva a sucursal
  - `assignProfessionalToBranches()` - Asignar a múltiples sucursales
  - `getBranchAssignments()` - Listar por sucursal
  - `getProfessionalAssignments()` - Listar por profesional
  - `updateAssignment()` - Actualizar asignación
  - `deleteAssignment()` - Eliminar asignación
  - `getAssignmentStats()` - Estadísticas
  - `getAvailableProfessionals()` - Profesionales disponibles

#### API Endpoints
- `POST /api/branches/[id]/assignments` - Asignación masiva
- `GET /api/branches/[id]/assignments` - Listar asignaciones
- `GET /api/branches/[id]/assignments/available` - Profesionales disponibles
- `PUT /api/branches/[id]/assignments/[assignmentId]` - Actualizar
- `DELETE /api/branches/[id]/assignments/[assignmentId]` - Eliminar
- `POST /api/professionals/[id]/assignments` - Asignar a múltiples sucursales
- `GET /api/professionals/[id]/assignments` - Listar por profesional
- `GET /api/assignments/stats` - Estadísticas generales

#### Frontend Components
- **BranchAssignmentManager** (500+ líneas)
  - Vista desde sucursal
  - Modal de asignación masiva
  - Selección múltiple con checkbox
  - Opciones de asignación (primaria, fechas, notas)
  - Lista de profesionales asignados
  - Acciones inline (toggle estado, primaria, eliminar)

- **ProfessionalBranchesManager** (350+ líneas)
  - Vista desde profesional
  - Grid de tarjetas de sucursales
  - Indicador visual de sucursal primaria
  - Gestión de asignaciones
  - Resumen con estadísticas

#### Pages
- `/dashboard/branches/[id]/assignments` - Gestión por sucursal
- `/dashboard/professionals/[id]/branches` - Gestión por profesional

#### Database Migration
- `20251014_add_branch_assignments` - Tabla BranchAssignment con índices

### Documentation
- `FASE2_MASS_ASSIGNMENT.md` - Documentación completa de la Fase 2
- Casos de uso detallados
- Guías de integración

### Statistics
- 13 archivos nuevos
- ~2,500 líneas de código
- 2 componentes React principales
- 5 endpoints API principales
- 10+ tipos TypeScript
- 12+ métodos de servicio

## [1.5.0] - 2025-10-13

### Added - Fase 1: Sistema de Horarios

#### Backend
- **ScheduleManager Service** (500+ líneas)
  - Gestión completa de horarios de profesionales
  - Validación de horarios y disponibilidad
  - Cálculo de slots disponibles
  - Manejo de días festivos y excepciones
  - Soporte para horarios especiales

#### API Endpoints
- `GET /api/professionals/[id]/schedule` - Obtener horario
- `PUT /api/professionals/[id]/schedule` - Actualizar horario
- `GET /api/professionals/[id]/availability` - Verificar disponibilidad
- `POST /api/professionals/[id]/schedule/exceptions` - Agregar excepciones

#### Frontend Components
- **ScheduleEditor** (400+ líneas)
  - Editor visual de horarios
  - Configuración por día de la semana
  - Gestión de bloques de tiempo
  - Validación en tiempo real

#### Types
- Tipos TypeScript completos para horarios
- Interfaces para configuración y validación

### Documentation
- `FASE1_SCHEDULES.md` - Documentación de horarios

## [1.4.0] - 2025-10-06

### Fixed - Errores Críticos en Producción

#### NotificationLog Error
- Eliminado campo inexistente `recipient` de consultas Prisma
- Mejorado logging en notificationService.ts
- Agregado manejo de errores robusto

#### Client Service Error
- Agregado logging detallado en clientService.ts
- Mejorados mensajes de error para usuarios
- Agregado rastreo de sesión y tenants disponibles
- Implementado debugging para "Tenant not found"

### Documentation
- `PR_92_MERGE_SUMMARY.md` - Resumen del merge
- `MERGE_PR92_VISUAL.md` - Documentación visual

## [1.3.0] - 2025-10-05

### Added - Checkpoint Estable
- Checkpoint v1.3.0 creado como punto de referencia estable
- Sistema completamente funcional con todos los módulos core
- Documentación completa actualizada

### Fixed
- Estandarización de respuestas API
- Corrección de errores de integración frontend-backend
- Mejoras en manejo de errores

## [1.2.0] - 2025-10-04

### Added - Internacionalización
- Soporte completo para español
- Traducción de toda la interfaz
- Mensajes de error en español
- Documentación en español

## [1.1.0] - 2025-10-03

### Added - Módulo de Ventas/POS/Inventario
- Sistema completo de punto de venta
- Gestión de inventario
- Reportes de ventas
- Integración con sistema de citas

## [1.0.0] - 2025-10-02

### Added - CRM de Clientes
- Gestión completa de clientes
- Historial de citas
- Notas y seguimiento
- Integración con sistema de notificaciones

## [0.9.0] - 2025-10-01

### Added - Sistema de Notificaciones
- Notificaciones por email
- Notificaciones por SMS
- Notificaciones push
- Configuración de servicios (Twilio, SendGrid)

## [0.8.0] - 2025-09-30

### Added - Configuración Inicial
- Estructura base del proyecto
- Configuración de Next.js
- Configuración de Prisma
- Configuración de Docker
- Configuración de Easypanel

---

**Nota**: Este changelog se mantiene actualizado con cada release. Para más detalles sobre cada versión, consulta la documentación específica en la carpeta `docs/`.
