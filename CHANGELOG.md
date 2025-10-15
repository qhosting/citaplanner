Here's the result of running `cat -n` on /home/ubuntu/github_repos/citaplanner/CHANGELOG.md:
     1	Here's the result of running `cat -n` on /home/ubuntu/github_repos/citaplanner/CHANGELOG.md:
     2	     1  Here's the result of running `cat -n` on /home/ubuntu/github_repos/citaplanner/CHANGELOG.md:
     3	     2       1  Here's the result of running `cat -n` on /home/ubuntu/github_repos/citaplanner/CHANGELOG.md:
     4	     3       2       1  
     5	     4       3       2  # Changelog
     6	     5       4       3  
## [1.8.5] - 2025-10-15

### Fixed - Sprint 1 Fase 2: Appointments Redirect

#### Problema Resuelto
- Link roto en navegación: `/dashboard/appointments` retornaba 404
- Dashboard-nav.tsx tiene link "Agenda" apuntando a appointments
- Funcionalidad de agenda ya existe en `/dashboard/calendar`

#### Solución Implementada
- **Nuevo archivo:** `app/dashboard/appointments/page.tsx`
- **Tipo de redirect:** Permanente (308) para SEO y cache del browser
- **Comportamiento:** Redirección instantánea a `/dashboard/calendar`
- **Compatibilidad:** Mantiene links existentes en dashboard-nav.tsx
- **Breaking changes:** Ninguno

#### Detalles Técnicos
- Usa Next.js `redirect()` de 'next/navigation'
- Código minimalista y eficiente (18 líneas)
- Comentarios explicativos claros
- Sin lógica compleja ni dependencias adicionales

#### Testing Verificado
- ✅ Redirect funciona correctamente
- ✅ No hay errores de TypeScript
- ✅ Redirect es instantáneo
- ✅ SEO-friendly (308 permanent redirect)
- ✅ Compatible con navegación existente

#### Archivos Modificados
- **Nuevo:** `app/dashboard/appointments/page.tsx`

#### PR y Release
- **PR:** #110 (mergeado con squash)
- **Tag:** v1.8.5
- **Branch:** feature/appointments-redirect (eliminada post-merge)

---

## [1.8.4] - 2025-10-15

### Added - Sprint 1 Fase 1: Dashboard Principal

#### Nueva Página Principal del Dashboard
- **Archivo:** `app/dashboard/page.tsx` completamente rediseñada
- **Diseño:** UI moderna y profesional con componentes shadcn/ui
- **Funcionalidad:** Vista overview con métricas clave del negocio

#### Features Implementadas
- Dashboard con 4 cards de métricas principales:
  - Citas del día (con badge de porcentaje de cambio)
  - Ingresos del mes (formato de moneda)
  - Nuevos clientes (tracking de crecimiento)
  - Tasa de ocupación (con indicador visual)
- Grid responsivo (1 columna en mobile, 2 en tablet, 4 en desktop)
- Cards con hover effects y animaciones suaves
- Iconos lucide-react integrados (Calendar, DollarSign, Users, TrendingUp)
- Colores y estilos consistentes con el brand de CitaPlanner

#### Mejoras de UX
- Información clara y legible
- Visualización rápida del estado del negocio
- Acceso rápido a métricas clave
- Diseño profesional y moderno

#### Testing
- ✅ Renderizado correcto en todos los tamaños de pantalla
- ✅ No hay errores de TypeScript
- ✅ Integración perfecta con layout existente
- ✅ Compatible con sistema de autenticación

#### PR y Release
- **PR:** #109 (mergeado con squash)
- **Tag:** v1.8.4
- **Branch:** feature/dashboard-overview (eliminada post-merge)

---

     7	
     8	## [1.8.3] - 2025-10-15
     9	
    10	### Added - Módulo de Gestión de Comisiones
    11	
    12	#### Backend (API Endpoints)
    13	
    14	- **CommissionManager Service** (580+ líneas)
    15	  - `createCommission()` - Crear nueva comisión (servicio o venta)
    16	  - `getCommissions()` - Listar comisiones con filtros avanzados
    17	  - `getCommissionById()` - Obtener detalle de comisión específica
    18	  - `updateCommission()` - Actualizar comisión (aprobar, rechazar, pagar)
    19	  - `getProfessionalCommissionSummary()` - Resumen completo por profesional
    20	  - Cálculo automático de montos de comisión
    21	  - Gestión de estados: pending, approved, paid, rejected
    22	  - Validaciones de permisos y acceso
    23	  - Integración multi-tenant
    24	
    25	- **3 Endpoints API**
    26	  - `POST /api/commissions` - Crear comisión (servicio o venta)
    27	    - Validación de datos y permisos
    28	    - Cálculo automático de comisión
    29	    - Registro de metadata (tipo de fuente, referencias)
    30	  
    31	  - `GET /api/commissions` - Listar y filtrar comisiones
    32	    - Filtros: profesional, sucursal, rango de fechas, estado
    33	    - Paginación y ordenamiento
    34	    - Estadísticas agregadas (totales, pendientes, pagadas, aprobadas)
    35	    - Cálculo de resúmenes por estado
    36	  
    37	  - `GET /api/commissions/[id]` - Detalle de comisión
    38	    - Información completa de la comisión
    39	    - Datos relacionados (profesional, sucursal)
    40	    - Historial de estados
    41	  
    42	  - `PUT /api/commissions/[id]` - Actualizar comisión
    43	    - Aprobar comisión pendiente
    44	    - Rechazar comisión con razón
    45	    - Marcar como pagada con fecha
    46	    - Validaciones de transiciones de estado
    47	    - Control de permisos por rol
    48	  
    49	  - `GET /api/commissions/professional/[id]` - Resumen por profesional
    50	    - Total de comisiones (todas, pendientes, aprobadas, pagadas)
    51	    - Comisiones este mes y totales
    52	    - Lista de comisiones recientes
    53	    - Desglose por tipo (servicio vs venta)
    54	    - Estadísticas de desempeño
    55	
    56	#### Frontend (Componentes y Páginas)
    57	
    58	- **CommissionDashboard Component** (380 líneas)
    59	  - Dashboard principal de gestión de comisiones
    60	  - Filtros avanzados:
    61	    - Por profesional (dropdown con búsqueda)
    62	    - Por sucursal
    63	    - Por estado (pending, approved, paid, rejected)
    64	    - Rango de fechas personalizado
    65	  - Estadísticas en tiempo real:
    66	    - Total de comisiones
    67	    - Pendientes de aprobación
    68	    - Pagadas
    69	    - Aprobadas no pagadas
    70	  - Tabla interactiva de comisiones:
    71	    - Columnas: profesional, monto, tipo, estado, fecha, sucursal
    72	    - Badges de estado con colores
    73	    - Acciones por estado:
    74	      - Aprobar comisiones pendientes
    75	      - Rechazar con razón
    76	      - Marcar como pagada
    77	  - UI moderna con Tailwind CSS y Lucide Icons
    78	  - Responsive design para móvil y desktop
    79	
    80	- **ProfessionalCommissionDetail Component** (273 líneas)
    81	  - Vista detallada de comisiones por profesional
    82	  - Métricas principales:
    83	    - Total de comisiones
    84	    - Comisiones este mes
    85	    - Pendientes, aprobadas, pagadas
    86	  - Gráfico de tendencias:
    87	    - Visualización mensual con Recharts
    88	    - Comparación de comisiones pagadas vs pendientes
    89	    - Colores diferenciados por estado
    90	  - Lista completa de comisiones:
    91	    - Orden cronológico (más recientes primero)
    92	    - Detalles por comisión (tipo, monto, estado, fecha)
    93	    - Badges de estado visual
    94	  - Desglose por tipo:
    95	    - Comisiones por servicios
    96	    - Comisiones por ventas
    97	    - Subtotales y porcentajes
    98	
    99	- **2 Páginas Next.js**
   100	  - `/dashboard/commissions` - Dashboard principal
   101	    - Gestión centralizada de todas las comisiones
   102	    - Acceso completo para administradores
   103	    - Filtros y acciones masivas
   104	  
   105	  - `/dashboard/commissions/[id]` - Detalle por profesional
   106	    - Vista enfocada en un profesional específico
   107	    - Métricas individuales y tendencias
   108	    - Historial completo de comisiones
   109	
   110	#### Tipos TypeScript
   111	
   112	- **Commission Interface**
   113	  - `id`, `professionalId`, `branchId`, `tenantId`
   114	  - `amount` - Monto de la comisión
   115	  - `type` - Tipo: 'service' | 'sale'
   116	  - `status` - Estado: 'pending' | 'approved' | 'paid' | 'rejected'
   117	  - `source` - Fuente (appointmentId o saleId)
   118	  - `metadata` - Información adicional (servicio, cliente, etc.)
   119	  - `approvedAt`, `paidAt`, `rejectedAt`, `rejectionReason`
   120	  - `createdAt`, `updatedAt`
   121	
   122	- **CommissionStatus Enum**
   123	  - `PENDING` - Pendiente de aprobación
   124	  - `APPROVED` - Aprobada, no pagada
   125	  - `PAID` - Pagada al profesional
   126	  - `REJECTED` - Rechazada
   127	
   128	- **CommissionType Enum**
   129	  - `SERVICE` - Comisión por servicio/cita
   130	  - `SALE` - Comisión por venta de producto
   131	
   132	- **CommissionSummary Interface**
   133	  - Resumen agregado por profesional
   134	  - Totales por estado
   135	  - Desglose mensual
   136	  - Estadísticas de desempeño
   137	
   138	#### Funcionalidades Clave
   139	
   140	1. **Gestión Completa de Comisiones**
   141	   - Crear comisiones automáticamente desde servicios y ventas
   142	   - Aprobar comisiones pendientes
   143	   - Rechazar con razón específica
   144	   - Marcar como pagadas con fecha
   145	   - Transiciones de estado validadas
   146	
   147	2. **Filtros y Búsqueda Avanzada**
   148	   - Filtrar por profesional
   149	   - Filtrar por sucursal
   150	   - Filtrar por estado
   151	   - Filtrar por rango de fechas
   152	   - Combinar múltiples filtros
   153	
   154	3. **Estadísticas en Tiempo Real**
   155	   - Total de comisiones
   156	   - Pendientes de aprobación
   157	   - Aprobadas no pagadas
   158	   - Pagadas en el mes
   159	   - Desglose por tipo
   160	
   161	4. **Visualizaciones y Reportes**
   162	   - Gráficos de tendencias mensuales
   163	   - Distribución por estado
   164	   - Comparativas de desempeño
   165	   - Rankings de profesionales
   166	   - Desglose por tipo de comisión
   167	
   168	5. **Integración con Módulos Existentes**
   169	   - Servicios y citas (comisiones por servicio)
   170	   - Ventas y POS (comisiones por venta)
   171	   - Profesionales (resumen por profesional)
   172	   - Sucursales (filtrado por ubicación)
   173	   - Sistema multi-tenant
   174	
   175	6. **Seguridad y Validaciones**
   176	   - Control de acceso por rol
   177	   - Validación de permisos
   178	   - Validación de transiciones de estado
   179	   - Aislamiento por tenant
   180	   - Auditoría de cambios
   181	
   182	#### Integración
   183	
   184	- Compatible con módulo de servicios (v1.0+)
   185	- Compatible con módulo de ventas/POS (v1.2+)
   186	- Compatible con sistema de profesionales (v1.5+)
   187	- Compatible con asignaciones multi-sucursal (v1.6+)
   188	- Integrado con sistema de reportes (v1.7+)
   189	
   190	#### Métricas del Módulo
   191	
   192	- **Archivos creados:** 8
   193	  - 3 endpoints API (582 líneas)
   194	  - 2 componentes React (653 líneas)
   195	  - 2 páginas Next.js (52 líneas)
   196	  - 1 archivo de tipos (37 líneas)
   197	- **Total líneas de código:** 1,124
   198	- **Breaking changes:** Ninguno
   199	- **Migraciones:** No requeridas
   200	- **Merge SHA:** `6d294849ee0b46fcba96f4a47e30f92e55d1dc81`
   201	
   202	#### PR #108
   203	
   204	- **Título:** Módulo completo de gestión de comisiones v1.8.3
   205	- **Estado:** ✅ Merged
   206	- **Tag:** v1.8.3
   207	- **Deploy:** Automático en Easypanel
   208	- **Documentación:** PR_108_COMMISSIONS_MODULE.md
   209	
   210	     6       5       4  All notable changes to CitaPlanner will be documented in this file.
   211	     7       6       5  
   212	     8  
   213	     9  ## [1.8.2] - 2025-10-15
   214	    10  
   215	    11  ### Fixed - Ruta Working Hours
   216	    12  
   217	    13  #### Dashboard de Horarios
   218	    14  - **PR #105:** Crear ruta `/dashboard/working-hours` y endpoint `/api/professionals`
   219	    15    - **Problema:** Link en navegación apuntaba a ruta inexistente
   220	    16    - **Endpoint:** `GET /api/professionals` para listar todos los profesionales
   221	    17      - Filtros: por sucursal, incluir inactivos
   222	    18      - Datos completos: perfil, sucursales, horarios, citas
   223	    19      - Compatible con código existente (calendar, modals)
   224	    20    - **Página:** Vista centralizada de horarios
   225	    21      - Estadísticas: total, con horarios, sin configurar, activos
   226	    22      - Filtros: búsqueda, sucursal, mostrar inactivos
   227	    23      - Tarjetas con avatar, contacto, sucursales, citas
   228	    24      - Estado visual de horarios configurados
   229	    25      - Botón para gestionar horario individual
   230	    26    - Integración con sistema de horarios (Fase 1)
   231	    27    - Integración con asignaciones (Fase 2)
   232	    28    - UI moderna con Tailwind CSS y Lucide Icons
   233	    29    - Merge SHA: `880d520e0522a48f3c3122615bad11a2cf293434`
   234	    30  
   235	    31  #### Métricas del Fix
   236	    32  - Archivos creados: 2
   237	    33  - Líneas de código: 539
   238	    34  - Breaking changes: Ninguno
   239	    35  - Migraciones: No requeridas
   240	    36       7       6  The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
   241	    37       8       7  and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
   242	    38       9  ## [1.8.1] - 2025-10-15
   243	    39      10  
   244	    40      11  ### Fixed - Hotfix Crítico
   245	    41      12  
   246	    42      13  #### API de Notificaciones
   247	    43      14  - **PR #104:** Corregir campo `scheduledAt` inexistente en modelo Appointment
   248	    44      15    - Reemplazar `scheduledAt` con `startTime` en `notificationService.ts`
   249	    45      16    - Fix error crítico: Invalid `prisma.notificationLog.findMany()` invocation
   250	    46      17    - Endpoint afectado: `/api/notifications/logs`
   251	    47      18    - Causa: El modelo Appointment usa `startTime`/`endTime`, no `scheduledAt`
   252	    48      19    - Impacto: API de logs de notificaciones restaurada
   253	    49      20    - Severidad: 🔴 Crítica
   254	    50      21    - Merge SHA: `dfd9706ea7334e8dc9d0fb2f53ee25b967d72344`
   255	    51      22  
   256	    52      23  #### Métricas del Fix
   257	    53      24  - Archivos modificados: 1
   258	    54      25  - Líneas modificadas: 1
   259	    55      26  - Tiempo de resolución: ~13 minutos
   260	    56      27  - Breaking changes: Ninguno
   261	    57      28  
   262	    58      29       8  
   263	    59      30       9  ## [1.8.0] - 2025-10-14
   264	    60      31      10  
   265	    61      32      11  ### Added - Fase 4: Vista de Calendario por Profesional
   266	    62      33      12  
   267	    63      34      13  #### Dependencias
   268	    64      35      14  - **react-big-calendar** - Librería de calendario interactivo
   269	    65      36      15  - **date-fns** - Manejo de fechas y localización
   270	    66      37      16  - **@types/react-big-calendar** - Tipos TypeScript
   271	    67      38      17  
   272	    68      39      18  #### Backend
   273	    69      40      19  
   274	    70      41      20  - **CalendarManager Service** (600+ líneas)
   275	    71      42      21    - `getCalendarEvents()` - Obtener eventos con filtros avanzados
   276	    72      43      22    - `getProfessionalAvailability()` - Calcular disponibilidad completa
   277	    73      44      23    - `validateAvailability()` - Validar antes de crear/mover citas
   278	    74      45      24    - `getCalendarStatistics()` - Estadísticas del calendario
   279	    75      46      25    - `getAvailableSlots()` - Slots disponibles para agendar
   280	    76      47      26    - `validateCalendarAccess()` - Validación de permisos por rol
   281	    77      48      27    - Integración con `scheduleManager` (Fase 1)
   282	    78      49      28    - Integración con `branchAssignments` (Fase 2)
   283	    79      50      29    - Manejo de horarios override por sucursal
   284	    80      51      30    - Procesamiento de excepciones (vacaciones, bajas)
   285	    81      52      31  
   286	    82      53      32  #### API Endpoints
   287	    83      54      33  - `GET /api/calendar/professional/[id]` - Eventos del calendario con filtros
   288	    84      55      34  - `GET /api/calendar/availability/[professionalId]` - Disponibilidad y horarios
   289	    85      56      35  - `GET /api/calendar/availability/[professionalId]/slots` - Slots disponibles
   290	    86      57      36  - `POST /api/calendar/availability/validate` - Validar disponibilidad
   291	    87      58      37  - `POST /api/calendar/appointments` - Crear cita desde calendario
   292	    88      59      38  - `PATCH /api/calendar/appointments/[id]/reschedule` - Reprogramar cita (drag & drop)
   293	    89      60      39  - `GET /api/calendar/statistics/[professionalId]` - Estadísticas del calendario
   294	    90      61      40  - `GET /api/professionals/me` - Datos del profesional autenticado
   295	    91      62      41  
   296	    92      63      42  #### Tipos TypeScript (400+ líneas)
   297	    93      64      43  - `CalendarEvent` - Evento del calendario con metadata completa
   298	    94      65      44  - `CalendarEventResource` - Datos de la cita (cliente, servicio, estado)
   299	    95      66      45  - `AvailabilityBlock` - Bloques de disponibilidad (regular/exception/override)
   300	    96      67      46  - `ProfessionalAvailability` - Disponibilidad completa de profesional
   301	    97      68      47  - `CalendarFilters` - Filtros avanzados del calendario
   302	    98      69      48  - `CalendarView` - Vistas del calendario (month/week/day/agenda)
   303	    99      70      49  - `CalendarStatistics` - Estadísticas y métricas del calendario
   304	   100      71      50  - Helpers: `createCalendarEventFromAppointment()`, `getStatusColor()`, `getDateRangeForView()`
   305	   101      72      51  
   306	   102      73      52  #### Frontend Components
   307	   103      74      53  
   308	   104      75      54  - **ProfessionalCalendar** (300+ líneas)
   309	   105      76      55    - Integración completa con react-big-calendar
   310	   106      77      56    - Vistas: mensual, semanal, diaria, agenda
   311	   107      78      57    - Drag & drop para reprogramar citas
   312	   108      79      58    - Resize de eventos
   313	   109      80      59    - Estilos personalizados por estado
   314	   110      81      60    - Visualización de disponibilidad
   315	   111      82      61    - Localización en español
   316	   112      83      62    - Responsive design
   317	   113      84      63  
   318	   114      85      64  - **CalendarFilters** (150+ líneas)
   319	   115      86      65    - Selector de vista (mes/semana/día/agenda)
   320	   116      87      66    - Filtro por profesional (admin/gerente)
   321	   117      88      67    - Filtro por sucursal
   322	   118      89      68    - Filtro por estado de cita
   323	   119      90      69    - Filtro por servicio
   324	   120      91      70    - Aplicación en tiempo real
   325	   121      92      71  
   326	   122      93      72  - **CalendarLegend** (100+ líneas)
   327	   123      94      73    - Leyenda de colores por estado
   328	   124      95      74    - Indicadores de disponibilidad
   329	   125      96      75    - Diseño compacto y claro
   330	   126      97      76  
   331	   127      98      77  - **AppointmentModal** (350+ líneas)
   332	   128      99      78    - Tres modos: crear, editar, ver
   333	   129     100      79    - Formulario completo con validaciones
   334	   130     101      80    - Auto-cálculo de endTime según servicio
   335	   131     102      81    - Botón de cancelar cita
   336	   132     103      82    - Manejo de errores inline
   337	   133     104      83    - Estados visuales
   338	   134     105      84  
   339	   135     106      85  #### Páginas
   340	   136     107      86  - `/dashboard/calendar/page.tsx` - Página principal del calendario (500+ líneas)
   341	   137     108      87    - Estado completo del calendario
   342	   138     109      88    - Gestión de eventos y disponibilidad
   343	   139     110      89    - Integración con API endpoints
   344	   140     111      90    - Manejo de drag & drop
   345	   141     112      91    - Sistema de filtros
   346	   142     113      92    - Modal de citas
   347	   143     114      93    - Permisos por rol
   348	   144     115      94    - Loading states
   349	   145     116      95    - Error handling
   350	   146     117      96  
   351	   147     118      97  #### Funcionalidades Implementadas
   352	   148     119      98  
   353	   149     120      99  ##### Vistas del Calendario
   354	   150     121     100  - ✅ Vista mensual - Resumen del mes completo
   355	   151     122     101  - ✅ Vista semanal - 7 días con slots de tiempo
   356	   152     123     102  - ✅ Vista diaria - Día detallado con todos los slots
   357	   153     124     103  - ✅ Vista agenda - Lista cronológica de citas
   358	   154     125     104  
   359	   155     126     105  ##### Gestión de Citas
   360	   156     127     106  - ✅ **Crear citas** - Click en slot disponible → Modal → Crear
   361	   157     128     107  - ✅ **Editar citas** - Click en evento → Modal → Editar
   362	   158     129     108  - ✅ **Cancelar citas** - Botón en modal con confirmación
   363	   159     130     109  - ✅ **Reprogramar (Drag & Drop)** - Arrastrar evento → Validar → Guardar
   364	   160     131     110  - ✅ **Resize de eventos** - Ajustar duración visualmente
   365	   161     132     111  
   366	   162     133     112  ##### Validaciones Automáticas
   367	   163     134     113  - ✅ Horario dentro de disponibilidad
   368	   164     135     114  - ✅ Sin solapamientos con otras citas
   369	   165     136     115  - ✅ Respeto a excepciones (vacaciones, bajas)
   370	   166     137     116  - ✅ Duración correcta del servicio
   371	   167     138     117  - ✅ Permisos por rol
   372	   168     139     118  
   373	   169     140     119  ##### Visualización de Disponibilidad
   374	   170     141     120  - ✅ Bloques disponibles (fondo blanco, clickeable)
   375	   171     142     121  - ✅ Bloques no disponibles (fondo gris, bloqueado)
   376	   172     143     122  - ✅ Excepciones (vacaciones) diferenciadas
   377	   173     144     123  - ✅ Horarios override por sucursal
   378	   174     145     124  
   379	   175     146     125  ##### Filtros Avanzados
   380	   176     147     126  - ✅ Filtro por profesional (admin/gerente)
   381	   177     148     127  - ✅ Filtro por sucursal
   382	   178     149     128  - ✅ Filtro por estado (pendiente, confirmada, completada, etc.)
   383	   179     150     129  - ✅ Filtro por servicio
   384	   180     151     130  - ✅ Aplicación en tiempo real sin recargar
   385	   181     152     131  
   386	   182     153     132  ##### Permisos por Rol
   387	   183     154     133  - ✅ **Profesional**: Solo su propio calendario
   388	   184     155     134  - ✅ **Gerente**: Calendarios de profesionales de su(s) sucursal(es)
   389	   185     156     135  - ✅ **Admin/Super Admin**: Todos los calendarios
   390	   186     157     136  - ✅ **Cliente**: Sin acceso
   391	   187     158     137  
   392	   188     159     138  #### Integración con Fases Anteriores
   393	   189     160     139  
   394	   190     161     140  ##### Fase 1 (Horarios)
   395	   191     162     141  - ✅ Usa `scheduleManager.ts` para obtener horarios
   396	   192     163     142  - ✅ Respeta `ProfessionalSchedule` (dayOfWeek, startTime, endTime)
   397	   193     164     143  - ✅ Procesa `ScheduleException` para bloquear fechas
   398	   194     165     144  - ✅ Calcula disponibilidad basada en configuración
   399	   195     166     145  
   400	   196     167     146  ##### Fase 2 (Asignaciones)
   401	   197     168     147  - ✅ Considera `branchAssignments` con sucursal primaria
   402	   198     169     148  - ✅ Aplica `scheduleOverride` cuando está definido
   403	   199     170     149  - ✅ Filtra por sucursal en queries
   404	   200     171     150  - ✅ Valida permisos de gerente según sucursales
   405	   201     172     151  
   406	   202     173     152  ##### Fase 3 (Reportes)
   407	   203     174     153  - ✅ Estadísticas del calendario complementan reportes
   408	   204     175     154  - ✅ `CalendarStatistics` incluye métricas de utilización
   409	   205     176     155  - ✅ Datos alimentan dashboards de análisis
   410	   206     177     156  
   411	   207     178     157  #### Características Técnicas
   412	   208     179     158  - 🔒 Validaciones robustas en backend y frontend
   413	   209     180     159  - 🚀 Rendimiento optimizado con lazy loading
   414	   210     181     160  - 📱 Responsive design con TailwindCSS
   415	   211     182     161  - 🌐 Localización completa en español
   416	   212     183     162  - ♿ Accesibilidad con ARIA labels
   417	   213     184     163  - 🎨 UI/UX intuitiva y profesional
   418	   214     185     164  - 📊 Estadísticas de utilización
   419	   215     186     165  - 🔔 Toast notifications para feedback
   420	   216     187     166  - ⚡ Actualizaciones en tiempo real
   421	   217     188     167  
   422	   218     189     168  ### Documentation
   423	   219     190     169  - `FASE4_CALENDAR.md` - Documentación completa de la Fase 4 (50+ páginas)
   424	   220     191     170    - Arquitectura detallada
   425	   221     192     171    - API Endpoints con ejemplos
   426	   222     193     172    - Componentes Frontend
   427	   223     194     173    - Guías de uso para cada rol
   428	   224     195     174    - Testing manual checklist
   429	   225     196     175    - Integración con fases anteriores
   430	   226     197     176    - Próximos pasos
   431	   227     198     177  
   432	   228     199     178  ### Statistics
   433	   229     200     179  - 17 archivos nuevos/modificados
   434	   230     201     180  - ~3,000 líneas de código
   435	   231     202     181  - 4 componentes React principales
   436	   232     203     182  - 8 endpoints API
   437	   233     204     183  - 30+ tipos TypeScript
   438	   234     205     184  - 10+ métodos de servicio
   439	   235     206     185  - Sin breaking changes
   440	   236     207     186  - 100% compatible con fases anteriores
   441	   237     208     187  
   442	   238     209     188  ### Breaking Changes
   443	   239     210     189  - ❌ **Ninguno** - Completamente compatible con v1.7.0
   444	   240     211     190  
   445	   241     212     191  ### Notes
   446	   242     213     192  - Sistema de calendario completamente funcional
   447	   243     214     193  - Drag & drop con validaciones en tiempo real
   448	   244     215     194  - Integración perfecta con horarios y asignaciones
   449	   245     216     195  - Permisos estrictos según rol
   450	   246     217     196  - Código limpio, comentado y mantenible
   451	   247     218     197  - Listo para producción
   452	   248     219     198  
   453	   249     220     199  ## [1.7.0] - 2025-10-14
   454	   250     221     200  
   455	   251     222     201  ### Added - Fase 3: Sistema de Reportes
   456	   252     223     202  
   457	   253     224     203  #### Backend
   458	   254     225     204  - **ReportManager Service** (800+ líneas)
   459	   255     226     205    - Generación de reportes por profesional, sucursal y general
   460	   256     227     206    - Cálculo de métricas: citas, ingresos, tiempo, clientes
   461	   257     228     207    - Tendencias y análisis temporal
   462	   258     229     208    - Soporte para múltiples períodos (día, semana, mes, año, custom)
   463	   259     230     209    - Reportes comparativos entre profesionales o sucursales
   464	   260     231     210  
   465	   261     232     211  #### API Endpoints
   466	   262     233     212  - `GET /api/reports/professional/[id]` - Reporte de profesional
   467	   263     234     213  - `GET /api/reports/branch/[id]` - Reporte de sucursal
   468	   264     235     214  - `GET /api/reports/overview` - Reporte general del negocio
   469	   265     236     215  - `GET /api/reports/comparison` - Reportes comparativos
   470	   266     237     216  
   471	   267     238     217  #### Frontend Components
   472	   268     239     218  - **ReportDashboard** (400+ líneas)
   473	   269     240     219    - Dashboard general con métricas consolidadas
   474	   270     241     220    - Gráficos de tendencias (líneas)
   475	   271     242     221    - Top 10 profesionales, sucursales y servicios
   476	   272     243     222    - Filtros de período y rango de fechas
   477	   273     244     223    
   478	   274     245     224  - **ProfessionalReportView** (450+ líneas)
   479	   275     246     225    - Vista detallada de profesional
   480	   276     247     226    - Métricas individuales
   481	   277     248     227    - Desempeño por sucursal
   482	   278     249     228    - Servicios más realizados
   483	   279     250     229    - Gráficos de pastel y barras
   484	   280     251     230    
   485	   281     252     231  - **BranchReportView** (450+ líneas)
   486	   282     253     232    - Vista detallada de sucursal
   487	   283     254     233    - Métricas de sucursal
   488	   284     255     234    - Desempeño de profesionales
   489	   285     256     235    - Servicios más solicitados
   490	   286     257     236    - Análisis de utilización
   491	   287     258     237  
   492	   288     259     238  #### Páginas
   493	   289     260     239  - `/dashboard/reports` - Dashboard principal de reportes
   494	   290     261     240  - `/dashboard/reports/professional/[id]` - Reporte de profesional
   495	   291     262     241  - `/dashboard/reports/branch/[id]` - Reporte de sucursal
   496	   292     263     242  
   497	   293     264     243  #### Tipos TypeScript
   498	   294     265     244  - Tipos completos para reportes (350+ líneas)
   499	   295     266     245  - Interfaces para métricas y filtros
   500	   296     267     246  - Enums para períodos y estados
   501	   297     268     247  
   502	   298     269     248  #### Visualizaciones
   503	   299     270     249  - Gráficos de línea (tendencias)
   504	   300     271     250  - Gráficos de barras (comparativas)
   505	   301     272     251  - Gráficos de pastel (distribuciones)
   506	   302     273     252  - Tarjetas de métricas clave
   507	   303     274     253  - Integración con Recharts
   508	   304     275     254  
   509	   305     276     255  #### Métricas Calculadas
   510	   306     277     256  - **Citas**: Total, completadas, canceladas, tasas
   511	   307     278     257  - **Ingresos**: Total, promedio, proyectado
   512	   308     279     258  - **Tiempo**: Horas trabajadas, utilización, horas pico
   513	   309     280     259  - **Clientes**: Total, nuevos, retención
   514	   310     281     260  
   515	   311     282     261  ### Documentation
   516	   312     283     262  - `FASE3_REPORTS.md` - Documentación completa de la Fase 3
   517	   313     284     263  - Casos de uso detallados
   518	   314     285     264  - Guías de integración
   519	   315     286     265  - Ejemplos de API
   520	   316     287     266  
   521	   317     288     267  ### Statistics
   522	   318     289     268  - 14 archivos nuevos
   523	   319     290     269  - ~3,500 líneas de código
   524	   320     291     270  - 3 componentes React principales
   525	   321     292     271  - 4 endpoints API
   526	   322     293     272  - 20+ tipos TypeScript
   527	   323     294     273  - 12+ métodos de servicio
   528	   324     295     274  
   529	   325     296     275  ## [1.6.0] - 2025-10-14
   530	   326     297     276  
   531	   327     298     277  ### Added - Fase 2: Sistema de Asignación Masiva
   532	   328     299     278  
   533	   329     300     279  #### Backend
   534	   330     301     280  - **BranchAssignment Model**
   535	   331     302     281    - Relación muchos-a-muchos entre profesionales y sucursales
   536	   332     303     282    - Gestión de sucursal primaria
   537	   333     304     283    - Estados activo/inactivo con soft delete
   538	   334     305     284    - Fechas de vigencia (inicio y fin)
   539	   335     306     285    - Campo para horarios específicos por sucursal
   540	   336     307     286    - Índices optimizados para consultas
   541	   337     308     287  
   542	   338     309     288  - **BranchAssignmentManager Service** (600+ líneas)
   543	   339     310     289    - `validateAssignment()` - Validación completa de asignaciones
   544	   340     311     290    - `createAssignment()` - Crear asignación individual
   545	   341     312     291    - `assignProfessionalsToBranch()` - Asignación masiva a sucursal
   546	   342     313     292    - `assignProfessionalToBranches()` - Asignar a múltiples sucursales
   547	   343     314     293    - `getBranchAssignments()` - Listar por sucursal
   548	   344     315     294    - `getProfessionalAssignments()` - Listar por profesional
   549	   345     316     295    - `updateAssignment()` - Actualizar asignación
   550	   346     317     296    - `deleteAssignment()` - Eliminar asignación
   551	   347     318     297    - `getAssignmentStats()` - Estadísticas
   552	   348     319     298    - `getAvailableProfessionals()` - Profesionales disponibles
   553	   349     320     299  
   554	   350     321     300  #### API Endpoints
   555	   351     322     301  - `POST /api/branches/[id]/assignments` - Asignación masiva
   556	   352     323     302  - `GET /api/branches/[id]/assignments` - Listar asignaciones
   557	   353     324     303  - `GET /api/branches/[id]/assignments/available` - Profesionales disponibles
   558	   354     325     304  - `PUT /api/branches/[id]/assignments/[assignmentId]` - Actualizar
   559	   355     326     305  - `DELETE /api/branches/[id]/assignments/[assignmentId]` - Eliminar
   560	   356     327     306  - `POST /api/professionals/[id]/assignments` - Asignar a múltiples sucursales
   561	   357     328     307  - `GET /api/professionals/[id]/assignments` - Listar por profesional
   562	   358     329     308  - `GET /api/assignments/stats` - Estadísticas generales
   563	   359     330     309  
   564	   360     331     310  #### Frontend Components
   565	   361     332     311  - **BranchAssignmentManager** (500+ líneas)
   566	   362     333     312    - Vista desde sucursal
   567	   363     334     313    - Modal de asignación masiva
   568	   364     335     314    - Selección múltiple con checkbox
   569	   365     336     315    - Opciones de asignación (primaria, fechas, notas)
   570	   366     337     316    - Lista de profesionales asignados
   571	   367     338     317    - Acciones inline (toggle estado, primaria, eliminar)
   572	   368     339     318  
   573	   369     340     319  - **ProfessionalBranchesManager** (350+ líneas)
   574	   370     341     320    - Vista desde profesional
   575	   371     342     321    - Grid de tarjetas de sucursales
   576	   372     343     322    - Indicador visual de sucursal primaria
   577	   373     344     323    - Gestión de asignaciones
   578	   374     345     324    - Resumen con estadísticas
   579	   375     346     325  
   580	   376     347     326  #### Pages
   581	   377     348     327  - `/dashboard/branches/[id]/assignments` - Gestión por sucursal
   582	   378     349     328  - `/dashboard/professionals/[id]/branches` - Gestión por profesional
   583	   379     350     329  
   584	   380     351     330  #### Database Migration
   585	   381     352     331  - `20251014_add_branch_assignments` - Tabla BranchAssignment con índices
   586	   382     353     332  
   587	   383     354     333  ### Documentation
   588	   384     355     334  - `FASE2_MASS_ASSIGNMENT.md` - Documentación completa de la Fase 2
   589	   385     356     335  - Casos de uso detallados
   590	   386     357     336  - Guías de integración
   591	   387     358     337  
   592	   388     359     338  ### Statistics
   593	   389     360     339  - 13 archivos nuevos
   594	   390     361     340  - ~2,500 líneas de código
   595	   391     362     341  - 2 componentes React principales
   596	   392     363     342  - 5 endpoints API principales
   597	   393     364     343  - 10+ tipos TypeScript
   598	   394     365     344  - 12+ métodos de servicio
   599	   395     366     345  
   600	   396     367     346  ## [1.5.0] - 2025-10-13
   601	   397     368     347  
   602	   398     369     348  ### Added - Fase 1: Sistema de Horarios
   603	   399     370     349  
   604	   400     371     350  #### Backend
   605	   401     372     351  - **ScheduleManager Service** (500+ líneas)
   606	   402     373     352    - Gestión completa de horarios de profesionales
   607	   403     374     353    - Validación de horarios y disponibilidad
   608	   404     375     354    - Cálculo de slots disponibles
   609	   405     376     355    - Manejo de días festivos y excepciones
   610	   406     377     356    - Soporte para horarios especiales
   611	   407     378     357  
   612	   408     379     358  #### API Endpoints
   613	   409     380     359  - `GET /api/professionals/[id]/schedule` - Obtener horario
   614	   410     381     360  - `PUT /api/professionals/[id]/schedule` - Actualizar horario
   615	   411     382     361  - `GET /api/professionals/[id]/availability` - Verificar disponibilidad
   616	   412     383     362  - `POST /api/professionals/[id]/schedule/exceptions` - Agregar excepciones
   617	   413     384     363  
   618	   414     385     364  #### Frontend Components
   619	   415     386     365  - **ScheduleEditor** (400+ líneas)
   620	   416     387     366    - Editor visual de horarios
   621	   417     388     367    - Configuración por día de la semana
   622	   418     389     368    - Gestión de bloques de tiempo
   623	   419     390     369    - Validación en tiempo real
   624	   420     391     370  
   625	   421     392     371  #### Types
   626	   422     393     372  - Tipos TypeScript completos para horarios
   627	   423     394     373  - Interfaces para configuración y validación
   628	   424     395     374  
   629	   425     396     375  ### Documentation
   630	   426     397     376  - `FASE1_SCHEDULES.md` - Documentación de horarios
   631	   427     398     377  
   632	   428     399     378  ## [1.4.0] - 2025-10-06
   633	   429     400     379  
   634	   430     401     380  ### Fixed - Errores Críticos en Producción
   635	   431     402     381  
   636	   432     403     382  #### NotificationLog Error
   637	   433     404     383  - Eliminado campo inexistente `recipient` de consultas Prisma
   638	   434     405     384  - Mejorado logging en notificationService.ts
   639	   435     406     385  - Agregado manejo de errores robusto
   640	   436     407     386  
   641	   437     408     387  #### Client Service Error
   642	   438     409     388  - Agregado logging detallado en clientService.ts
   643	   439     410     389  - Mejorados mensajes de error para usuarios
   644	   440     411     390  - Agregado rastreo de sesión y tenants disponibles
   645	   441     412     391  - Implementado debugging para "Tenant not found"
   646	   442     413     392  
   647	   443     414     393  ### Documentation
   648	   444     415     394  - `PR_92_MERGE_SUMMARY.md` - Resumen del merge
   649	   445     416     395  - `MERGE_PR92_VISUAL.md` - Documentación visual
   650	   446     417     396  
   651	   447     418     397  ## [1.3.0] - 2025-10-05
   652	   448     419     398  
   653	   449     420     399  ### Added - Checkpoint Estable
   654	   450     421     400  - Checkpoint v1.3.0 creado como punto de referencia estable
   655	   451     422     401  - Sistema completamente funcional con todos los módulos core
   656	   452     423     402  - Documentación completa actualizada
   657	   453     424     403  
   658	   454     425     404  ### Fixed
   659	   455     426     405  - Estandarización de respuestas API
   660	   456     427     406  - Corrección de errores de integración frontend-backend
   661	   457     428     407  - Mejoras en manejo de errores
   662	   458     429     408  
   663	   459     430     409  ## [1.2.0] - 2025-10-04
   664	   460     431     410  
   665	   461     432     411  ### Added - Internacionalización
   666	   462     433     412  - Soporte completo para español
   667	   463     434     413  - Traducción de toda la interfaz
   668	   464     435     414  - Mensajes de error en español
   669	   465     436     415  - Documentación en español
   670	   466     437     416  
   671	   467     438     417  ## [1.1.0] - 2025-10-03
   672	   468     439     418  
   673	   469     440     419  ### Added - Módulo de Ventas/POS/Inventario
   674	   470     441     420  - Sistema completo de punto de venta
   675	   471     442     421  - Gestión de inventario
   676	   472     443     422  - Reportes de ventas
   677	   473     444     423  - Integración con sistema de citas
   678	   474     445     424  
   679	   475     446     425  ## [1.0.0] - 2025-10-02
   680	   476     447     426  
   681	   477     448     427  ### Added - CRM de Clientes
   682	   478     449     428  - Gestión completa de clientes
   683	   479     450     429  - Historial de citas
   684	   480     451     430  - Notas y seguimiento
   685	   481     452     431  - Integración con sistema de notificaciones
   686	   482     453     432  
   687	   483     454     433  ## [0.9.0] - 2025-10-01
   688	   484     455     434  
   689	   485     456     435  ### Added - Sistema de Notificaciones
   690	   486     457     436  - Notificaciones por email
   691	   487     458     437  - Notificaciones por SMS
   692	   488     459     438  - Notificaciones push
   693	   489     460     439  - Configuración de servicios (Twilio, SendGrid)
   694	   490     461     440  
   695	   491     462     441  ## [0.8.0] - 2025-09-30
   696	   492     463     442  
   697	   493     464     443  ### Added - Configuración Inicial
   698	   494     465     444  - Estructura base del proyecto
   699	   495     466     445  - Configuración de Next.js
   700	   496     467     446  - Configuración de Prisma
   701	   497     468     447  - Configuración de Docker
   702	   498     469     448  - Configuración de Easypanel
   703	   499     470     449  
   704	   500     471     450  ---
   705	   501     472     451  
   706	   502     473     452  **Nota**: Este changelog se mantiene actualizado con cada release. Para más detalles sobre cada versión, consulta la documentación específica en la carpeta `docs/`.
   707	   503     474     453  