Here's the result of running `cat -n` on /home/ubuntu/github_repos/citaplanner/CHANGELOG.md:
     1	
     2	# Changelog
     3	
     4	All notable changes to CitaPlanner will be documented in this file.
     5	
     6	The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
     7	and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
## [1.8.1] - 2025-10-15

### Fixed - Hotfix Crítico

#### API de Notificaciones
- **PR #104:** Corregir campo `scheduledAt` inexistente en modelo Appointment
  - Reemplazar `scheduledAt` con `startTime` en `notificationService.ts`
  - Fix error crítico: Invalid `prisma.notificationLog.findMany()` invocation
  - Endpoint afectado: `/api/notifications/logs`
  - Causa: El modelo Appointment usa `startTime`/`endTime`, no `scheduledAt`
  - Impacto: API de logs de notificaciones restaurada
  - Severidad: 🔴 Crítica
  - Merge SHA: `dfd9706ea7334e8dc9d0fb2f53ee25b967d72344`

#### Métricas del Fix
- Archivos modificados: 1
- Líneas modificadas: 1
- Tiempo de resolución: ~13 minutos
- Breaking changes: Ninguno

     8	
     9	## [1.8.0] - 2025-10-14
    10	
    11	### Added - Fase 4: Vista de Calendario por Profesional
    12	
    13	#### Dependencias
    14	- **react-big-calendar** - Librería de calendario interactivo
    15	- **date-fns** - Manejo de fechas y localización
    16	- **@types/react-big-calendar** - Tipos TypeScript
    17	
    18	#### Backend
    19	
    20	- **CalendarManager Service** (600+ líneas)
    21	  - `getCalendarEvents()` - Obtener eventos con filtros avanzados
    22	  - `getProfessionalAvailability()` - Calcular disponibilidad completa
    23	  - `validateAvailability()` - Validar antes de crear/mover citas
    24	  - `getCalendarStatistics()` - Estadísticas del calendario
    25	  - `getAvailableSlots()` - Slots disponibles para agendar
    26	  - `validateCalendarAccess()` - Validación de permisos por rol
    27	  - Integración con `scheduleManager` (Fase 1)
    28	  - Integración con `branchAssignments` (Fase 2)
    29	  - Manejo de horarios override por sucursal
    30	  - Procesamiento de excepciones (vacaciones, bajas)
    31	
    32	#### API Endpoints
    33	- `GET /api/calendar/professional/[id]` - Eventos del calendario con filtros
    34	- `GET /api/calendar/availability/[professionalId]` - Disponibilidad y horarios
    35	- `GET /api/calendar/availability/[professionalId]/slots` - Slots disponibles
    36	- `POST /api/calendar/availability/validate` - Validar disponibilidad
    37	- `POST /api/calendar/appointments` - Crear cita desde calendario
    38	- `PATCH /api/calendar/appointments/[id]/reschedule` - Reprogramar cita (drag & drop)
    39	- `GET /api/calendar/statistics/[professionalId]` - Estadísticas del calendario
    40	- `GET /api/professionals/me` - Datos del profesional autenticado
    41	
    42	#### Tipos TypeScript (400+ líneas)
    43	- `CalendarEvent` - Evento del calendario con metadata completa
    44	- `CalendarEventResource` - Datos de la cita (cliente, servicio, estado)
    45	- `AvailabilityBlock` - Bloques de disponibilidad (regular/exception/override)
    46	- `ProfessionalAvailability` - Disponibilidad completa de profesional
    47	- `CalendarFilters` - Filtros avanzados del calendario
    48	- `CalendarView` - Vistas del calendario (month/week/day/agenda)
    49	- `CalendarStatistics` - Estadísticas y métricas del calendario
    50	- Helpers: `createCalendarEventFromAppointment()`, `getStatusColor()`, `getDateRangeForView()`
    51	
    52	#### Frontend Components
    53	
    54	- **ProfessionalCalendar** (300+ líneas)
    55	  - Integración completa con react-big-calendar
    56	  - Vistas: mensual, semanal, diaria, agenda
    57	  - Drag & drop para reprogramar citas
    58	  - Resize de eventos
    59	  - Estilos personalizados por estado
    60	  - Visualización de disponibilidad
    61	  - Localización en español
    62	  - Responsive design
    63	
    64	- **CalendarFilters** (150+ líneas)
    65	  - Selector de vista (mes/semana/día/agenda)
    66	  - Filtro por profesional (admin/gerente)
    67	  - Filtro por sucursal
    68	  - Filtro por estado de cita
    69	  - Filtro por servicio
    70	  - Aplicación en tiempo real
    71	
    72	- **CalendarLegend** (100+ líneas)
    73	  - Leyenda de colores por estado
    74	  - Indicadores de disponibilidad
    75	  - Diseño compacto y claro
    76	
    77	- **AppointmentModal** (350+ líneas)
    78	  - Tres modos: crear, editar, ver
    79	  - Formulario completo con validaciones
    80	  - Auto-cálculo de endTime según servicio
    81	  - Botón de cancelar cita
    82	  - Manejo de errores inline
    83	  - Estados visuales
    84	
    85	#### Páginas
    86	- `/dashboard/calendar/page.tsx` - Página principal del calendario (500+ líneas)
    87	  - Estado completo del calendario
    88	  - Gestión de eventos y disponibilidad
    89	  - Integración con API endpoints
    90	  - Manejo de drag & drop
    91	  - Sistema de filtros
    92	  - Modal de citas
    93	  - Permisos por rol
    94	  - Loading states
    95	  - Error handling
    96	
    97	#### Funcionalidades Implementadas
    98	
    99	##### Vistas del Calendario
   100	- ✅ Vista mensual - Resumen del mes completo
   101	- ✅ Vista semanal - 7 días con slots de tiempo
   102	- ✅ Vista diaria - Día detallado con todos los slots
   103	- ✅ Vista agenda - Lista cronológica de citas
   104	
   105	##### Gestión de Citas
   106	- ✅ **Crear citas** - Click en slot disponible → Modal → Crear
   107	- ✅ **Editar citas** - Click en evento → Modal → Editar
   108	- ✅ **Cancelar citas** - Botón en modal con confirmación
   109	- ✅ **Reprogramar (Drag & Drop)** - Arrastrar evento → Validar → Guardar
   110	- ✅ **Resize de eventos** - Ajustar duración visualmente
   111	
   112	##### Validaciones Automáticas
   113	- ✅ Horario dentro de disponibilidad
   114	- ✅ Sin solapamientos con otras citas
   115	- ✅ Respeto a excepciones (vacaciones, bajas)
   116	- ✅ Duración correcta del servicio
   117	- ✅ Permisos por rol
   118	
   119	##### Visualización de Disponibilidad
   120	- ✅ Bloques disponibles (fondo blanco, clickeable)
   121	- ✅ Bloques no disponibles (fondo gris, bloqueado)
   122	- ✅ Excepciones (vacaciones) diferenciadas
   123	- ✅ Horarios override por sucursal
   124	
   125	##### Filtros Avanzados
   126	- ✅ Filtro por profesional (admin/gerente)
   127	- ✅ Filtro por sucursal
   128	- ✅ Filtro por estado (pendiente, confirmada, completada, etc.)
   129	- ✅ Filtro por servicio
   130	- ✅ Aplicación en tiempo real sin recargar
   131	
   132	##### Permisos por Rol
   133	- ✅ **Profesional**: Solo su propio calendario
   134	- ✅ **Gerente**: Calendarios de profesionales de su(s) sucursal(es)
   135	- ✅ **Admin/Super Admin**: Todos los calendarios
   136	- ✅ **Cliente**: Sin acceso
   137	
   138	#### Integración con Fases Anteriores
   139	
   140	##### Fase 1 (Horarios)
   141	- ✅ Usa `scheduleManager.ts` para obtener horarios
   142	- ✅ Respeta `ProfessionalSchedule` (dayOfWeek, startTime, endTime)
   143	- ✅ Procesa `ScheduleException` para bloquear fechas
   144	- ✅ Calcula disponibilidad basada en configuración
   145	
   146	##### Fase 2 (Asignaciones)
   147	- ✅ Considera `branchAssignments` con sucursal primaria
   148	- ✅ Aplica `scheduleOverride` cuando está definido
   149	- ✅ Filtra por sucursal en queries
   150	- ✅ Valida permisos de gerente según sucursales
   151	
   152	##### Fase 3 (Reportes)
   153	- ✅ Estadísticas del calendario complementan reportes
   154	- ✅ `CalendarStatistics` incluye métricas de utilización
   155	- ✅ Datos alimentan dashboards de análisis
   156	
   157	#### Características Técnicas
   158	- 🔒 Validaciones robustas en backend y frontend
   159	- 🚀 Rendimiento optimizado con lazy loading
   160	- 📱 Responsive design con TailwindCSS
   161	- 🌐 Localización completa en español
   162	- ♿ Accesibilidad con ARIA labels
   163	- 🎨 UI/UX intuitiva y profesional
   164	- 📊 Estadísticas de utilización
   165	- 🔔 Toast notifications para feedback
   166	- ⚡ Actualizaciones en tiempo real
   167	
   168	### Documentation
   169	- `FASE4_CALENDAR.md` - Documentación completa de la Fase 4 (50+ páginas)
   170	  - Arquitectura detallada
   171	  - API Endpoints con ejemplos
   172	  - Componentes Frontend
   173	  - Guías de uso para cada rol
   174	  - Testing manual checklist
   175	  - Integración con fases anteriores
   176	  - Próximos pasos
   177	
   178	### Statistics
   179	- 17 archivos nuevos/modificados
   180	- ~3,000 líneas de código
   181	- 4 componentes React principales
   182	- 8 endpoints API
   183	- 30+ tipos TypeScript
   184	- 10+ métodos de servicio
   185	- Sin breaking changes
   186	- 100% compatible con fases anteriores
   187	
   188	### Breaking Changes
   189	- ❌ **Ninguno** - Completamente compatible con v1.7.0
   190	
   191	### Notes
   192	- Sistema de calendario completamente funcional
   193	- Drag & drop con validaciones en tiempo real
   194	- Integración perfecta con horarios y asignaciones
   195	- Permisos estrictos según rol
   196	- Código limpio, comentado y mantenible
   197	- Listo para producción
   198	
   199	## [1.7.0] - 2025-10-14
   200	
   201	### Added - Fase 3: Sistema de Reportes
   202	
   203	#### Backend
   204	- **ReportManager Service** (800+ líneas)
   205	  - Generación de reportes por profesional, sucursal y general
   206	  - Cálculo de métricas: citas, ingresos, tiempo, clientes
   207	  - Tendencias y análisis temporal
   208	  - Soporte para múltiples períodos (día, semana, mes, año, custom)
   209	  - Reportes comparativos entre profesionales o sucursales
   210	
   211	#### API Endpoints
   212	- `GET /api/reports/professional/[id]` - Reporte de profesional
   213	- `GET /api/reports/branch/[id]` - Reporte de sucursal
   214	- `GET /api/reports/overview` - Reporte general del negocio
   215	- `GET /api/reports/comparison` - Reportes comparativos
   216	
   217	#### Frontend Components
   218	- **ReportDashboard** (400+ líneas)
   219	  - Dashboard general con métricas consolidadas
   220	  - Gráficos de tendencias (líneas)
   221	  - Top 10 profesionales, sucursales y servicios
   222	  - Filtros de período y rango de fechas
   223	  
   224	- **ProfessionalReportView** (450+ líneas)
   225	  - Vista detallada de profesional
   226	  - Métricas individuales
   227	  - Desempeño por sucursal
   228	  - Servicios más realizados
   229	  - Gráficos de pastel y barras
   230	  
   231	- **BranchReportView** (450+ líneas)
   232	  - Vista detallada de sucursal
   233	  - Métricas de sucursal
   234	  - Desempeño de profesionales
   235	  - Servicios más solicitados
   236	  - Análisis de utilización
   237	
   238	#### Páginas
   239	- `/dashboard/reports` - Dashboard principal de reportes
   240	- `/dashboard/reports/professional/[id]` - Reporte de profesional
   241	- `/dashboard/reports/branch/[id]` - Reporte de sucursal
   242	
   243	#### Tipos TypeScript
   244	- Tipos completos para reportes (350+ líneas)
   245	- Interfaces para métricas y filtros
   246	- Enums para períodos y estados
   247	
   248	#### Visualizaciones
   249	- Gráficos de línea (tendencias)
   250	- Gráficos de barras (comparativas)
   251	- Gráficos de pastel (distribuciones)
   252	- Tarjetas de métricas clave
   253	- Integración con Recharts
   254	
   255	#### Métricas Calculadas
   256	- **Citas**: Total, completadas, canceladas, tasas
   257	- **Ingresos**: Total, promedio, proyectado
   258	- **Tiempo**: Horas trabajadas, utilización, horas pico
   259	- **Clientes**: Total, nuevos, retención
   260	
   261	### Documentation
   262	- `FASE3_REPORTS.md` - Documentación completa de la Fase 3
   263	- Casos de uso detallados
   264	- Guías de integración
   265	- Ejemplos de API
   266	
   267	### Statistics
   268	- 14 archivos nuevos
   269	- ~3,500 líneas de código
   270	- 3 componentes React principales
   271	- 4 endpoints API
   272	- 20+ tipos TypeScript
   273	- 12+ métodos de servicio
   274	
   275	## [1.6.0] - 2025-10-14
   276	
   277	### Added - Fase 2: Sistema de Asignación Masiva
   278	
   279	#### Backend
   280	- **BranchAssignment Model**
   281	  - Relación muchos-a-muchos entre profesionales y sucursales
   282	  - Gestión de sucursal primaria
   283	  - Estados activo/inactivo con soft delete
   284	  - Fechas de vigencia (inicio y fin)
   285	  - Campo para horarios específicos por sucursal
   286	  - Índices optimizados para consultas
   287	
   288	- **BranchAssignmentManager Service** (600+ líneas)
   289	  - `validateAssignment()` - Validación completa de asignaciones
   290	  - `createAssignment()` - Crear asignación individual
   291	  - `assignProfessionalsToBranch()` - Asignación masiva a sucursal
   292	  - `assignProfessionalToBranches()` - Asignar a múltiples sucursales
   293	  - `getBranchAssignments()` - Listar por sucursal
   294	  - `getProfessionalAssignments()` - Listar por profesional
   295	  - `updateAssignment()` - Actualizar asignación
   296	  - `deleteAssignment()` - Eliminar asignación
   297	  - `getAssignmentStats()` - Estadísticas
   298	  - `getAvailableProfessionals()` - Profesionales disponibles
   299	
   300	#### API Endpoints
   301	- `POST /api/branches/[id]/assignments` - Asignación masiva
   302	- `GET /api/branches/[id]/assignments` - Listar asignaciones
   303	- `GET /api/branches/[id]/assignments/available` - Profesionales disponibles
   304	- `PUT /api/branches/[id]/assignments/[assignmentId]` - Actualizar
   305	- `DELETE /api/branches/[id]/assignments/[assignmentId]` - Eliminar
   306	- `POST /api/professionals/[id]/assignments` - Asignar a múltiples sucursales
   307	- `GET /api/professionals/[id]/assignments` - Listar por profesional
   308	- `GET /api/assignments/stats` - Estadísticas generales
   309	
   310	#### Frontend Components
   311	- **BranchAssignmentManager** (500+ líneas)
   312	  - Vista desde sucursal
   313	  - Modal de asignación masiva
   314	  - Selección múltiple con checkbox
   315	  - Opciones de asignación (primaria, fechas, notas)
   316	  - Lista de profesionales asignados
   317	  - Acciones inline (toggle estado, primaria, eliminar)
   318	
   319	- **ProfessionalBranchesManager** (350+ líneas)
   320	  - Vista desde profesional
   321	  - Grid de tarjetas de sucursales
   322	  - Indicador visual de sucursal primaria
   323	  - Gestión de asignaciones
   324	  - Resumen con estadísticas
   325	
   326	#### Pages
   327	- `/dashboard/branches/[id]/assignments` - Gestión por sucursal
   328	- `/dashboard/professionals/[id]/branches` - Gestión por profesional
   329	
   330	#### Database Migration
   331	- `20251014_add_branch_assignments` - Tabla BranchAssignment con índices
   332	
   333	### Documentation
   334	- `FASE2_MASS_ASSIGNMENT.md` - Documentación completa de la Fase 2
   335	- Casos de uso detallados
   336	- Guías de integración
   337	
   338	### Statistics
   339	- 13 archivos nuevos
   340	- ~2,500 líneas de código
   341	- 2 componentes React principales
   342	- 5 endpoints API principales
   343	- 10+ tipos TypeScript
   344	- 12+ métodos de servicio
   345	
   346	## [1.5.0] - 2025-10-13
   347	
   348	### Added - Fase 1: Sistema de Horarios
   349	
   350	#### Backend
   351	- **ScheduleManager Service** (500+ líneas)
   352	  - Gestión completa de horarios de profesionales
   353	  - Validación de horarios y disponibilidad
   354	  - Cálculo de slots disponibles
   355	  - Manejo de días festivos y excepciones
   356	  - Soporte para horarios especiales
   357	
   358	#### API Endpoints
   359	- `GET /api/professionals/[id]/schedule` - Obtener horario
   360	- `PUT /api/professionals/[id]/schedule` - Actualizar horario
   361	- `GET /api/professionals/[id]/availability` - Verificar disponibilidad
   362	- `POST /api/professionals/[id]/schedule/exceptions` - Agregar excepciones
   363	
   364	#### Frontend Components
   365	- **ScheduleEditor** (400+ líneas)
   366	  - Editor visual de horarios
   367	  - Configuración por día de la semana
   368	  - Gestión de bloques de tiempo
   369	  - Validación en tiempo real
   370	
   371	#### Types
   372	- Tipos TypeScript completos para horarios
   373	- Interfaces para configuración y validación
   374	
   375	### Documentation
   376	- `FASE1_SCHEDULES.md` - Documentación de horarios
   377	
   378	## [1.4.0] - 2025-10-06
   379	
   380	### Fixed - Errores Críticos en Producción
   381	
   382	#### NotificationLog Error
   383	- Eliminado campo inexistente `recipient` de consultas Prisma
   384	- Mejorado logging en notificationService.ts
   385	- Agregado manejo de errores robusto
   386	
   387	#### Client Service Error
   388	- Agregado logging detallado en clientService.ts
   389	- Mejorados mensajes de error para usuarios
   390	- Agregado rastreo de sesión y tenants disponibles
   391	- Implementado debugging para "Tenant not found"
   392	
   393	### Documentation
   394	- `PR_92_MERGE_SUMMARY.md` - Resumen del merge
   395	- `MERGE_PR92_VISUAL.md` - Documentación visual
   396	
   397	## [1.3.0] - 2025-10-05
   398	
   399	### Added - Checkpoint Estable
   400	- Checkpoint v1.3.0 creado como punto de referencia estable
   401	- Sistema completamente funcional con todos los módulos core
   402	- Documentación completa actualizada
   403	
   404	### Fixed
   405	- Estandarización de respuestas API
   406	- Corrección de errores de integración frontend-backend
   407	- Mejoras en manejo de errores
   408	
   409	## [1.2.0] - 2025-10-04
   410	
   411	### Added - Internacionalización
   412	- Soporte completo para español
   413	- Traducción de toda la interfaz
   414	- Mensajes de error en español
   415	- Documentación en español
   416	
   417	## [1.1.0] - 2025-10-03
   418	
   419	### Added - Módulo de Ventas/POS/Inventario
   420	- Sistema completo de punto de venta
   421	- Gestión de inventario
   422	- Reportes de ventas
   423	- Integración con sistema de citas
   424	
   425	## [1.0.0] - 2025-10-02
   426	
   427	### Added - CRM de Clientes
   428	- Gestión completa de clientes
   429	- Historial de citas
   430	- Notas y seguimiento
   431	- Integración con sistema de notificaciones
   432	
   433	## [0.9.0] - 2025-10-01
   434	
   435	### Added - Sistema de Notificaciones
   436	- Notificaciones por email
   437	- Notificaciones por SMS
   438	- Notificaciones push
   439	- Configuración de servicios (Twilio, SendGrid)
   440	
   441	## [0.8.0] - 2025-09-30
   442	
   443	### Added - Configuración Inicial
   444	- Estructura base del proyecto
   445	- Configuración de Next.js
   446	- Configuración de Prisma
   447	- Configuración de Docker
   448	- Configuración de Easypanel
   449	
   450	---
   451	
   452	**Nota**: Este changelog se mantiene actualizado con cada release. Para más detalles sobre cada versión, consulta la documentación específica en la carpeta `docs/`.
   453	