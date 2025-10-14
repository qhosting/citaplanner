
# Changelog

All notable changes to CitaPlanner will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0] - 2025-10-14

### Added - Fase 2: Sistema de Asignación Masiva

#### Backend
- **Modelo BranchAssignment**: Nueva tabla para relación muchos-a-muchos entre profesionales y sucursales
- **BranchAssignmentManager**: Servicio completo de gestión de asignaciones con 12+ métodos
- **Tipos TypeScript**: Interfaces completas para asignaciones, validaciones y operaciones masivas
- **Migración de Base de Datos**: Script SQL para crear tabla e índices optimizados

#### API Endpoints
- `POST /api/branches/{id}/assignments` - Asignar múltiples profesionales a sucursal
- `GET /api/branches/{id}/assignments` - Listar asignaciones de sucursal
- `GET /api/branches/{id}/assignments/available` - Profesionales disponibles
- `PUT /api/branches/{id}/assignments/{assignmentId}` - Actualizar asignación
- `DELETE /api/branches/{id}/assignments/{assignmentId}` - Eliminar asignación
- `POST /api/professionals/{id}/assignments` - Asignar profesional a múltiples sucursales
- `GET /api/professionals/{id}/assignments` - Listar asignaciones de profesional
- `GET /api/assignments/stats` - Estadísticas generales

#### Frontend
- **BranchAssignmentManager**: Componente para gestión desde vista de sucursal
  - Modal de asignación masiva con selección múltiple
  - Lista de profesionales asignados con acciones inline
  - Toggle de estado activo/inactivo
  - Gestión de sucursal primaria
- **ProfessionalBranchesManager**: Componente para gestión desde vista de profesional
  - Grid de tarjetas de sucursales asignadas
  - Indicadores visuales de sucursal primaria
  - Gestión de asignaciones por profesional
- **Páginas de Dashboard**:
  - `/dashboard/branches/{id}/assignments` - Gestión de profesionales por sucursal
  - `/dashboard/professionals/{id}/branches` - Gestión de sucursales por profesional

#### Características
- ✅ Asignación masiva de profesionales a sucursales
- ✅ Asignación de profesional a múltiples sucursales
- ✅ Gestión de sucursal primaria (solo una por profesional)
- ✅ Estados activo/inactivo (soft delete)
- ✅ Fechas de vigencia (inicio y fin)
- ✅ Notas por asignación
- ✅ Horarios específicos por sucursal (preparado para Fase 3)
- ✅ Validaciones robustas
- ✅ Estadísticas de asignaciones
- ✅ UI intuitiva con modales y acciones inline

#### Validaciones
- Profesional existe y pertenece al tenant
- Sucursal existe y pertenece al tenant
- Fechas válidas (fin > inicio)
- Solo una sucursal primaria activa por profesional
- Prevención de duplicados
- Autenticación y permisos

#### Documentación
- `FASE2_MASS_ASSIGNMENT.md` - Documentación completa de la Fase 2
- Actualización de CHANGELOG.md

### Changed
- **Schema Prisma**: Agregado modelo BranchAssignment con relaciones
- **Modelo User**: Agregada relación branchAssignments
- **Modelo Branch**: Agregada relación professionalAssignments
- **Modelo Tenant**: Agregada relación branchAssignments

### Technical Details
- **Archivos nuevos**: 13
- **Líneas de código**: ~2,500
- **Componentes React**: 2
- **Endpoints API**: 5 rutas principales
- **Tipos TypeScript**: 10+
- **Métodos de servicio**: 12+

### Migration Required
```bash
npx prisma migrate deploy
npx prisma generate
```

### Breaking Changes
None - Totalmente compatible con versiones anteriores

---

## [1.5.0] - 2025-10-14

### Added - Fase 1: Sistema de Gestión de Horarios

#### Backend
- **ScheduleManager**: Servicio completo de gestión de horarios con 15+ métodos
- **Tipos de Horarios**: Sistema de horarios por día de la semana con múltiples bloques
- **Excepciones**: Gestión de vacaciones, bajas, festivos y días especiales
- **Validaciones**: Validación completa de horarios, solapamientos y disponibilidad
- **Cálculo de Disponibilidad**: Algoritmo para calcular slots disponibles

#### API Endpoints
- `GET /api/professionals/{id}/schedule` - Obtener horario de profesional
- `PUT /api/professionals/{id}/schedule` - Actualizar horario completo
- `POST /api/professionals/{id}/schedule` - Agregar excepción

#### Frontend
- **ScheduleManager**: Componente principal de gestión de horarios
- **WeeklyScheduleEditor**: Editor visual de horario semanal
- **ExceptionsEditor**: Gestor de excepciones con calendario
- **Página de Gestión**: `/dashboard/professionals/schedule/{id}`

#### Características
- ✅ Horarios por día de la semana (Lunes a Domingo)
- ✅ Múltiples bloques de tiempo por día
- ✅ Gestión de excepciones (vacaciones, bajas, festivos)
- ✅ Validación de formato de horas (HH:mm)
- ✅ Detección de solapamientos
- ✅ Cálculo automático de disponibilidad
- ✅ Estadísticas de horarios
- ✅ Interfaz visual intuitiva

#### Documentación
- `FASE1_SCHEDULE_MANAGEMENT.md` - Documentación completa de la Fase 1
- `CHECKPOINT_v1.4.0.md` - Estado del sistema antes de Fase 1

### Changed
- **Modelo Professional**: Campo `scheduleConfig` ahora utilizado activamente

### Technical Details
- **Archivos nuevos**: 5
- **Líneas de código**: ~2,200
- **Componentes React**: 3
- **Endpoints API**: 3

---

## [1.4.0] - 2025-10-13

### Fixed
- **NotificationLog**: Eliminado campo inexistente `recipient` de consultas Prisma
- **Client Service**: Agregado logging detallado para diagnóstico de errores "Tenant not found"
- **API Responses**: Estandarización de respuestas de error con mensajes descriptivos

### Changed
- **Logging**: Mejorado sistema de logging en servicios críticos
- **Error Messages**: Mensajes de error más descriptivos para usuarios

### Documentation
- `PR_92_MERGE_SUMMARY.md` - Resumen del merge de fixes críticos
- `MERGE_PR92_VISUAL.md` - Documentación visual del merge

---

## [1.3.1] - 2025-10-12

### Fixed
- **Deployment**: Corrección de errores de deployment en Easypanel
- **Database**: Mejoras en conectividad de base de datos
- **Build**: Optimización del proceso de build

---

## [1.3.0] - 2025-10-10

### Added
- **Internacionalización**: Sistema completo en español
- **CRM de Clientes**: Gestión avanzada de clientes
- **Módulo de Ventas**: Sistema POS e inventario
- **Notificaciones**: Sistema de notificaciones push

### Changed
- **UI/UX**: Mejoras generales en interfaz de usuario
- **Performance**: Optimizaciones de rendimiento

---

## [1.2.0] - 2025-10-05

### Added
- **Sistema de Citas**: Gestión completa de citas
- **Calendario**: Vista de calendario integrada
- **Servicios**: Gestión de servicios y categorías

---

## [1.1.0] - 2025-09-25

### Added
- **Autenticación**: Sistema de autenticación con NextAuth
- **Multi-tenant**: Soporte para múltiples tenants
- **Sucursales**: Gestión de sucursales

---

## [1.0.0] - 2025-09-16

### Added
- **Proyecto Inicial**: Configuración base de CitaPlanner
- **Stack Tecnológico**: Next.js 14, Prisma, PostgreSQL, Docker
- **Deployment**: Configuración para Easypanel

---

[1.6.0]: https://github.com/qhosting/citaplanner/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/qhosting/citaplanner/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/qhosting/citaplanner/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/qhosting/citaplanner/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/qhosting/citaplanner/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/qhosting/citaplanner/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/qhosting/citaplanner/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/qhosting/citaplanner/releases/tag/v1.0.0
