Here's the result of running `cat -n` on /home/ubuntu/github_repos/citaplanner/CHANGELOG.md:
     1	Here's the result of running `cat -n` on /home/ubuntu/github_repos/citaplanner/CHANGELOG.md:
     2	     1  
     3	     2  # Changelog
     4	     3  
     5	     4  All notable changes to CitaPlanner will be documented in this file.
     6	     5  

## [1.8.2] - 2025-10-15

### Fixed - Ruta Working Hours

#### Dashboard de Horarios
- **PR #105:** Crear ruta `/dashboard/working-hours` y endpoint `/api/professionals`
  - **Problema:** Link en navegación apuntaba a ruta inexistente
  - **Endpoint:** `GET /api/professionals` para listar todos los profesionales
    - Filtros: por sucursal, incluir inactivos
    - Datos completos: perfil, sucursales, horarios, citas
    - Compatible con código existente (calendar, modals)
  - **Página:** Vista centralizada de horarios
    - Estadísticas: total, con horarios, sin configurar, activos
    - Filtros: búsqueda, sucursal, mostrar inactivos
    - Tarjetas con avatar, contacto, sucursales, citas
    - Estado visual de horarios configurados
    - Botón para gestionar horario individual
  - Integración con sistema de horarios (Fase 1)
  - Integración con asignaciones (Fase 2)
  - UI moderna con Tailwind CSS y Lucide Icons
  - Merge SHA: `880d520e0522a48f3c3122615bad11a2cf293434`

#### Métricas del Fix
- Archivos creados: 2
- Líneas de código: 539
- Breaking changes: Ninguno
- Migraciones: No requeridas
     7	     6  The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
     8	     7  and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
     9	## [1.8.1] - 2025-10-15
    10	
    11	### Fixed - Hotfix Crítico
    12	
    13	#### API de Notificaciones
    14	- **PR #104:** Corregir campo `scheduledAt` inexistente en modelo Appointment
    15	  - Reemplazar `scheduledAt` con `startTime` en `notificationService.ts`
    16	  - Fix error crítico: Invalid `prisma.notificationLog.findMany()` invocation
    17	  - Endpoint afectado: `/api/notifications/logs`
    18	  - Causa: El modelo Appointment usa `startTime`/`endTime`, no `scheduledAt`
    19	  - Impacto: API de logs de notificaciones restaurada
    20	  - Severidad: 🔴 Crítica
    21	  - Merge SHA: `dfd9706ea7334e8dc9d0fb2f53ee25b967d72344`
    22	
    23	#### Métricas del Fix
    24	- Archivos modificados: 1
    25	- Líneas modificadas: 1
    26	- Tiempo de resolución: ~13 minutos
    27	- Breaking changes: Ninguno
    28	
    29	     8  
    30	     9  ## [1.8.0] - 2025-10-14
    31	    10  
    32	    11  ### Added - Fase 4: Vista de Calendario por Profesional
    33	    12  
    34	    13  #### Dependencias
    35	    14  - **react-big-calendar** - Librería de calendario interactivo
    36	    15  - **date-fns** - Manejo de fechas y localización
    37	    16  - **@types/react-big-calendar** - Tipos TypeScript
    38	    17  
    39	    18  #### Backend
    40	    19  
    41	    20  - **CalendarManager Service** (600+ líneas)
    42	    21    - `getCalendarEvents()` - Obtener eventos con filtros avanzados
    43	    22    - `getProfessionalAvailability()` - Calcular disponibilidad completa
    44	    23    - `validateAvailability()` - Validar antes de crear/mover citas
    45	    24    - `getCalendarStatistics()` - Estadísticas del calendario
    46	    25    - `getAvailableSlots()` - Slots disponibles para agendar
    47	    26    - `validateCalendarAccess()` - Validación de permisos por rol
    48	    27    - Integración con `scheduleManager` (Fase 1)
    49	    28    - Integración con `branchAssignments` (Fase 2)
    50	    29    - Manejo de horarios override por sucursal
    51	    30    - Procesamiento de excepciones (vacaciones, bajas)
    52	    31  
    53	    32  #### API Endpoints
    54	    33  - `GET /api/calendar/professional/[id]` - Eventos del calendario con filtros
    55	    34  - `GET /api/calendar/availability/[professionalId]` - Disponibilidad y horarios
    56	    35  - `GET /api/calendar/availability/[professionalId]/slots` - Slots disponibles
    57	    36  - `POST /api/calendar/availability/validate` - Validar disponibilidad
    58	    37  - `POST /api/calendar/appointments` - Crear cita desde calendario
    59	    38  - `PATCH /api/calendar/appointments/[id]/reschedule` - Reprogramar cita (drag & drop)
    60	    39  - `GET /api/calendar/statistics/[professionalId]` - Estadísticas del calendario
    61	    40  - `GET /api/professionals/me` - Datos del profesional autenticado
    62	    41  
    63	    42  #### Tipos TypeScript (400+ líneas)
    64	    43  - `CalendarEvent` - Evento del calendario con metadata completa
    65	    44  - `CalendarEventResource` - Datos de la cita (cliente, servicio, estado)
    66	    45  - `AvailabilityBlock` - Bloques de disponibilidad (regular/exception/override)
    67	    46  - `ProfessionalAvailability` - Disponibilidad completa de profesional
    68	    47  - `CalendarFilters` - Filtros avanzados del calendario
    69	    48  - `CalendarView` - Vistas del calendario (month/week/day/agenda)
    70	    49  - `CalendarStatistics` - Estadísticas y métricas del calendario
    71	    50  - Helpers: `createCalendarEventFromAppointment()`, `getStatusColor()`, `getDateRangeForView()`
    72	    51  
    73	    52  #### Frontend Components
    74	    53  
    75	    54  - **ProfessionalCalendar** (300+ líneas)
    76	    55    - Integración completa con react-big-calendar
    77	    56    - Vistas: mensual, semanal, diaria, agenda
    78	    57    - Drag & drop para reprogramar citas
    79	    58    - Resize de eventos
    80	    59    - Estilos personalizados por estado
    81	    60    - Visualización de disponibilidad
    82	    61    - Localización en español
    83	    62    - Responsive design
    84	    63  
    85	    64  - **CalendarFilters** (150+ líneas)
    86	    65    - Selector de vista (mes/semana/día/agenda)
    87	    66    - Filtro por profesional (admin/gerente)
    88	    67    - Filtro por sucursal
    89	    68    - Filtro por estado de cita
    90	    69    - Filtro por servicio
    91	    70    - Aplicación en tiempo real
    92	    71  
    93	    72  - **CalendarLegend** (100+ líneas)
    94	    73    - Leyenda de colores por estado
    95	    74    - Indicadores de disponibilidad
    96	    75    - Diseño compacto y claro
    97	    76  
    98	    77  - **AppointmentModal** (350+ líneas)
    99	    78    - Tres modos: crear, editar, ver
   100	    79    - Formulario completo con validaciones
   101	    80    - Auto-cálculo de endTime según servicio
   102	    81    - Botón de cancelar cita
   103	    82    - Manejo de errores inline
   104	    83    - Estados visuales
   105	    84  
   106	    85  #### Páginas
   107	    86  - `/dashboard/calendar/page.tsx` - Página principal del calendario (500+ líneas)
   108	    87    - Estado completo del calendario
   109	    88    - Gestión de eventos y disponibilidad
   110	    89    - Integración con API endpoints
   111	    90    - Manejo de drag & drop
   112	    91    - Sistema de filtros
   113	    92    - Modal de citas
   114	    93    - Permisos por rol
   115	    94    - Loading states
   116	    95    - Error handling
   117	    96  
   118	    97  #### Funcionalidades Implementadas
   119	    98  
   120	    99  ##### Vistas del Calendario
   121	   100  - ✅ Vista mensual - Resumen del mes completo
   122	   101  - ✅ Vista semanal - 7 días con slots de tiempo
   123	   102  - ✅ Vista diaria - Día detallado con todos los slots
   124	   103  - ✅ Vista agenda - Lista cronológica de citas
   125	   104  
   126	   105  ##### Gestión de Citas
   127	   106  - ✅ **Crear citas** - Click en slot disponible → Modal → Crear
   128	   107  - ✅ **Editar citas** - Click en evento → Modal → Editar
   129	   108  - ✅ **Cancelar citas** - Botón en modal con confirmación
   130	   109  - ✅ **Reprogramar (Drag & Drop)** - Arrastrar evento → Validar → Guardar
   131	   110  - ✅ **Resize de eventos** - Ajustar duración visualmente
   132	   111  
   133	   112  ##### Validaciones Automáticas
   134	   113  - ✅ Horario dentro de disponibilidad
   135	   114  - ✅ Sin solapamientos con otras citas
   136	   115  - ✅ Respeto a excepciones (vacaciones, bajas)
   137	   116  - ✅ Duración correcta del servicio
   138	   117  - ✅ Permisos por rol
   139	   118  
   140	   119  ##### Visualización de Disponibilidad
   141	   120  - ✅ Bloques disponibles (fondo blanco, clickeable)
   142	   121  - ✅ Bloques no disponibles (fondo gris, bloqueado)
   143	   122  - ✅ Excepciones (vacaciones) diferenciadas
   144	   123  - ✅ Horarios override por sucursal
   145	   124  
   146	   125  ##### Filtros Avanzados
   147	   126  - ✅ Filtro por profesional (admin/gerente)
   148	   127  - ✅ Filtro por sucursal
   149	   128  - ✅ Filtro por estado (pendiente, confirmada, completada, etc.)
   150	   129  - ✅ Filtro por servicio
   151	   130  - ✅ Aplicación en tiempo real sin recargar
   152	   131  
   153	   132  ##### Permisos por Rol
   154	   133  - ✅ **Profesional**: Solo su propio calendario
   155	   134  - ✅ **Gerente**: Calendarios de profesionales de su(s) sucursal(es)
   156	   135  - ✅ **Admin/Super Admin**: Todos los calendarios
   157	   136  - ✅ **Cliente**: Sin acceso
   158	   137  
   159	   138  #### Integración con Fases Anteriores
   160	   139  
   161	   140  ##### Fase 1 (Horarios)
   162	   141  - ✅ Usa `scheduleManager.ts` para obtener horarios
   163	   142  - ✅ Respeta `ProfessionalSchedule` (dayOfWeek, startTime, endTime)
   164	   143  - ✅ Procesa `ScheduleException` para bloquear fechas
   165	   144  - ✅ Calcula disponibilidad basada en configuración
   166	   145  
   167	   146  ##### Fase 2 (Asignaciones)
   168	   147  - ✅ Considera `branchAssignments` con sucursal primaria
   169	   148  - ✅ Aplica `scheduleOverride` cuando está definido
   170	   149  - ✅ Filtra por sucursal en queries
   171	   150  - ✅ Valida permisos de gerente según sucursales
   172	   151  
   173	   152  ##### Fase 3 (Reportes)
   174	   153  - ✅ Estadísticas del calendario complementan reportes
   175	   154  - ✅ `CalendarStatistics` incluye métricas de utilización
   176	   155  - ✅ Datos alimentan dashboards de análisis
   177	   156  
   178	   157  #### Características Técnicas
   179	   158  - 🔒 Validaciones robustas en backend y frontend
   180	   159  - 🚀 Rendimiento optimizado con lazy loading
   181	   160  - 📱 Responsive design con TailwindCSS
   182	   161  - 🌐 Localización completa en español
   183	   162  - ♿ Accesibilidad con ARIA labels
   184	   163  - 🎨 UI/UX intuitiva y profesional
   185	   164  - 📊 Estadísticas de utilización
   186	   165  - 🔔 Toast notifications para feedback
   187	   166  - ⚡ Actualizaciones en tiempo real
   188	   167  
   189	   168  ### Documentation
   190	   169  - `FASE4_CALENDAR.md` - Documentación completa de la Fase 4 (50+ páginas)
   191	   170    - Arquitectura detallada
   192	   171    - API Endpoints con ejemplos
   193	   172    - Componentes Frontend
   194	   173    - Guías de uso para cada rol
   195	   174    - Testing manual checklist
   196	   175    - Integración con fases anteriores
   197	   176    - Próximos pasos
   198	   177  
   199	   178  ### Statistics
   200	   179  - 17 archivos nuevos/modificados
   201	   180  - ~3,000 líneas de código
   202	   181  - 4 componentes React principales
   203	   182  - 8 endpoints API
   204	   183  - 30+ tipos TypeScript
   205	   184  - 10+ métodos de servicio
   206	   185  - Sin breaking changes
   207	   186  - 100% compatible con fases anteriores
   208	   187  
   209	   188  ### Breaking Changes
   210	   189  - ❌ **Ninguno** - Completamente compatible con v1.7.0
   211	   190  
   212	   191  ### Notes
   213	   192  - Sistema de calendario completamente funcional
   214	   193  - Drag & drop con validaciones en tiempo real
   215	   194  - Integración perfecta con horarios y asignaciones
   216	   195  - Permisos estrictos según rol
   217	   196  - Código limpio, comentado y mantenible
   218	   197  - Listo para producción
   219	   198  
   220	   199  ## [1.7.0] - 2025-10-14
   221	   200  
   222	   201  ### Added - Fase 3: Sistema de Reportes
   223	   202  
   224	   203  #### Backend
   225	   204  - **ReportManager Service** (800+ líneas)
   226	   205    - Generación de reportes por profesional, sucursal y general
   227	   206    - Cálculo de métricas: citas, ingresos, tiempo, clientes
   228	   207    - Tendencias y análisis temporal
   229	   208    - Soporte para múltiples períodos (día, semana, mes, año, custom)
   230	   209    - Reportes comparativos entre profesionales o sucursales
   231	   210  
   232	   211  #### API Endpoints
   233	   212  - `GET /api/reports/professional/[id]` - Reporte de profesional
   234	   213  - `GET /api/reports/branch/[id]` - Reporte de sucursal
   235	   214  - `GET /api/reports/overview` - Reporte general del negocio
   236	   215  - `GET /api/reports/comparison` - Reportes comparativos
   237	   216  
   238	   217  #### Frontend Components
   239	   218  - **ReportDashboard** (400+ líneas)
   240	   219    - Dashboard general con métricas consolidadas
   241	   220    - Gráficos de tendencias (líneas)
   242	   221    - Top 10 profesionales, sucursales y servicios
   243	   222    - Filtros de período y rango de fechas
   244	   223    
   245	   224  - **ProfessionalReportView** (450+ líneas)
   246	   225    - Vista detallada de profesional
   247	   226    - Métricas individuales
   248	   227    - Desempeño por sucursal
   249	   228    - Servicios más realizados
   250	   229    - Gráficos de pastel y barras
   251	   230    
   252	   231  - **BranchReportView** (450+ líneas)
   253	   232    - Vista detallada de sucursal
   254	   233    - Métricas de sucursal
   255	   234    - Desempeño de profesionales
   256	   235    - Servicios más solicitados
   257	   236    - Análisis de utilización
   258	   237  
   259	   238  #### Páginas
   260	   239  - `/dashboard/reports` - Dashboard principal de reportes
   261	   240  - `/dashboard/reports/professional/[id]` - Reporte de profesional
   262	   241  - `/dashboard/reports/branch/[id]` - Reporte de sucursal
   263	   242  
   264	   243  #### Tipos TypeScript
   265	   244  - Tipos completos para reportes (350+ líneas)
   266	   245  - Interfaces para métricas y filtros
   267	   246  - Enums para períodos y estados
   268	   247  
   269	   248  #### Visualizaciones
   270	   249  - Gráficos de línea (tendencias)
   271	   250  - Gráficos de barras (comparativas)
   272	   251  - Gráficos de pastel (distribuciones)
   273	   252  - Tarjetas de métricas clave
   274	   253  - Integración con Recharts
   275	   254  
   276	   255  #### Métricas Calculadas
   277	   256  - **Citas**: Total, completadas, canceladas, tasas
   278	   257  - **Ingresos**: Total, promedio, proyectado
   279	   258  - **Tiempo**: Horas trabajadas, utilización, horas pico
   280	   259  - **Clientes**: Total, nuevos, retención
   281	   260  
   282	   261  ### Documentation
   283	   262  - `FASE3_REPORTS.md` - Documentación completa de la Fase 3
   284	   263  - Casos de uso detallados
   285	   264  - Guías de integración
   286	   265  - Ejemplos de API
   287	   266  
   288	   267  ### Statistics
   289	   268  - 14 archivos nuevos
   290	   269  - ~3,500 líneas de código
   291	   270  - 3 componentes React principales
   292	   271  - 4 endpoints API
   293	   272  - 20+ tipos TypeScript
   294	   273  - 12+ métodos de servicio
   295	   274  
   296	   275  ## [1.6.0] - 2025-10-14
   297	   276  
   298	   277  ### Added - Fase 2: Sistema de Asignación Masiva
   299	   278  
   300	   279  #### Backend
   301	   280  - **BranchAssignment Model**
   302	   281    - Relación muchos-a-muchos entre profesionales y sucursales
   303	   282    - Gestión de sucursal primaria
   304	   283    - Estados activo/inactivo con soft delete
   305	   284    - Fechas de vigencia (inicio y fin)
   306	   285    - Campo para horarios específicos por sucursal
   307	   286    - Índices optimizados para consultas
   308	   287  
   309	   288  - **BranchAssignmentManager Service** (600+ líneas)
   310	   289    - `validateAssignment()` - Validación completa de asignaciones
   311	   290    - `createAssignment()` - Crear asignación individual
   312	   291    - `assignProfessionalsToBranch()` - Asignación masiva a sucursal
   313	   292    - `assignProfessionalToBranches()` - Asignar a múltiples sucursales
   314	   293    - `getBranchAssignments()` - Listar por sucursal
   315	   294    - `getProfessionalAssignments()` - Listar por profesional
   316	   295    - `updateAssignment()` - Actualizar asignación
   317	   296    - `deleteAssignment()` - Eliminar asignación
   318	   297    - `getAssignmentStats()` - Estadísticas
   319	   298    - `getAvailableProfessionals()` - Profesionales disponibles
   320	   299  
   321	   300  #### API Endpoints
   322	   301  - `POST /api/branches/[id]/assignments` - Asignación masiva
   323	   302  - `GET /api/branches/[id]/assignments` - Listar asignaciones
   324	   303  - `GET /api/branches/[id]/assignments/available` - Profesionales disponibles
   325	   304  - `PUT /api/branches/[id]/assignments/[assignmentId]` - Actualizar
   326	   305  - `DELETE /api/branches/[id]/assignments/[assignmentId]` - Eliminar
   327	   306  - `POST /api/professionals/[id]/assignments` - Asignar a múltiples sucursales
   328	   307  - `GET /api/professionals/[id]/assignments` - Listar por profesional
   329	   308  - `GET /api/assignments/stats` - Estadísticas generales
   330	   309  
   331	   310  #### Frontend Components
   332	   311  - **BranchAssignmentManager** (500+ líneas)
   333	   312    - Vista desde sucursal
   334	   313    - Modal de asignación masiva
   335	   314    - Selección múltiple con checkbox
   336	   315    - Opciones de asignación (primaria, fechas, notas)
   337	   316    - Lista de profesionales asignados
   338	   317    - Acciones inline (toggle estado, primaria, eliminar)
   339	   318  
   340	   319  - **ProfessionalBranchesManager** (350+ líneas)
   341	   320    - Vista desde profesional
   342	   321    - Grid de tarjetas de sucursales
   343	   322    - Indicador visual de sucursal primaria
   344	   323    - Gestión de asignaciones
   345	   324    - Resumen con estadísticas
   346	   325  
   347	   326  #### Pages
   348	   327  - `/dashboard/branches/[id]/assignments` - Gestión por sucursal
   349	   328  - `/dashboard/professionals/[id]/branches` - Gestión por profesional
   350	   329  
   351	   330  #### Database Migration
   352	   331  - `20251014_add_branch_assignments` - Tabla BranchAssignment con índices
   353	   332  
   354	   333  ### Documentation
   355	   334  - `FASE2_MASS_ASSIGNMENT.md` - Documentación completa de la Fase 2
   356	   335  - Casos de uso detallados
   357	   336  - Guías de integración
   358	   337  
   359	   338  ### Statistics
   360	   339  - 13 archivos nuevos
   361	   340  - ~2,500 líneas de código
   362	   341  - 2 componentes React principales
   363	   342  - 5 endpoints API principales
   364	   343  - 10+ tipos TypeScript
   365	   344  - 12+ métodos de servicio
   366	   345  
   367	   346  ## [1.5.0] - 2025-10-13
   368	   347  
   369	   348  ### Added - Fase 1: Sistema de Horarios
   370	   349  
   371	   350  #### Backend
   372	   351  - **ScheduleManager Service** (500+ líneas)
   373	   352    - Gestión completa de horarios de profesionales
   374	   353    - Validación de horarios y disponibilidad
   375	   354    - Cálculo de slots disponibles
   376	   355    - Manejo de días festivos y excepciones
   377	   356    - Soporte para horarios especiales
   378	   357  
   379	   358  #### API Endpoints
   380	   359  - `GET /api/professionals/[id]/schedule` - Obtener horario
   381	   360  - `PUT /api/professionals/[id]/schedule` - Actualizar horario
   382	   361  - `GET /api/professionals/[id]/availability` - Verificar disponibilidad
   383	   362  - `POST /api/professionals/[id]/schedule/exceptions` - Agregar excepciones
   384	   363  
   385	   364  #### Frontend Components
   386	   365  - **ScheduleEditor** (400+ líneas)
   387	   366    - Editor visual de horarios
   388	   367    - Configuración por día de la semana
   389	   368    - Gestión de bloques de tiempo
   390	   369    - Validación en tiempo real
   391	   370  
   392	   371  #### Types
   393	   372  - Tipos TypeScript completos para horarios
   394	   373  - Interfaces para configuración y validación
   395	   374  
   396	   375  ### Documentation
   397	   376  - `FASE1_SCHEDULES.md` - Documentación de horarios
   398	   377  
   399	   378  ## [1.4.0] - 2025-10-06
   400	   379  
   401	   380  ### Fixed - Errores Críticos en Producción
   402	   381  
   403	   382  #### NotificationLog Error
   404	   383  - Eliminado campo inexistente `recipient` de consultas Prisma
   405	   384  - Mejorado logging en notificationService.ts
   406	   385  - Agregado manejo de errores robusto
   407	   386  
   408	   387  #### Client Service Error
   409	   388  - Agregado logging detallado en clientService.ts
   410	   389  - Mejorados mensajes de error para usuarios
   411	   390  - Agregado rastreo de sesión y tenants disponibles
   412	   391  - Implementado debugging para "Tenant not found"
   413	   392  
   414	   393  ### Documentation
   415	   394  - `PR_92_MERGE_SUMMARY.md` - Resumen del merge
   416	   395  - `MERGE_PR92_VISUAL.md` - Documentación visual
   417	   396  
   418	   397  ## [1.3.0] - 2025-10-05
   419	   398  
   420	   399  ### Added - Checkpoint Estable
   421	   400  - Checkpoint v1.3.0 creado como punto de referencia estable
   422	   401  - Sistema completamente funcional con todos los módulos core
   423	   402  - Documentación completa actualizada
   424	   403  
   425	   404  ### Fixed
   426	   405  - Estandarización de respuestas API
   427	   406  - Corrección de errores de integración frontend-backend
   428	   407  - Mejoras en manejo de errores
   429	   408  
   430	   409  ## [1.2.0] - 2025-10-04
   431	   410  
   432	   411  ### Added - Internacionalización
   433	   412  - Soporte completo para español
   434	   413  - Traducción de toda la interfaz
   435	   414  - Mensajes de error en español
   436	   415  - Documentación en español
   437	   416  
   438	   417  ## [1.1.0] - 2025-10-03
   439	   418  
   440	   419  ### Added - Módulo de Ventas/POS/Inventario
   441	   420  - Sistema completo de punto de venta
   442	   421  - Gestión de inventario
   443	   422  - Reportes de ventas
   444	   423  - Integración con sistema de citas
   445	   424  
   446	   425  ## [1.0.0] - 2025-10-02
   447	   426  
   448	   427  ### Added - CRM de Clientes
   449	   428  - Gestión completa de clientes
   450	   429  - Historial de citas
   451	   430  - Notas y seguimiento
   452	   431  - Integración con sistema de notificaciones
   453	   432  
   454	   433  ## [0.9.0] - 2025-10-01
   455	   434  
   456	   435  ### Added - Sistema de Notificaciones
   457	   436  - Notificaciones por email
   458	   437  - Notificaciones por SMS
   459	   438  - Notificaciones push
   460	   439  - Configuración de servicios (Twilio, SendGrid)
   461	   440  
   462	   441  ## [0.8.0] - 2025-09-30
   463	   442  
   464	   443  ### Added - Configuración Inicial
   465	   444  - Estructura base del proyecto
   466	   445  - Configuración de Next.js
   467	   446  - Configuración de Prisma
   468	   447  - Configuración de Docker
   469	   448  - Configuración de Easypanel
   470	   449  
   471	   450  ---
   472	   451  
   473	   452  **Nota**: Este changelog se mantiene actualizado con cada release. Para más detalles sobre cada versión, consulta la documentación específica en la carpeta `docs/`.
   474	   453  