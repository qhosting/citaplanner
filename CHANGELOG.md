# Changelog

## [1.8.6] - 2025-10-15

### Added - Sprint 1 Fase 3: Endpoint API /api/services con CRUD completo

#### Funcionalidades Implementadas
- **GET /api/services:** Listar servicios con filtros avanzados
  - Filtros: isActive, category, search
  - Paginación: limit, offset
  - Include: category, serviceUsers (con user)
- **POST /api/services:** Crear nuevo servicio
  - Validaciones completas de negocio
  - Verificación de nombre único por tenant
  - Validación de categoryId opcional
- **GET /api/services/[id]:** Obtener servicio específico
  - Include: category, serviceUsers, appointments (próximos 5)
  - Filtrado multi-tenant
- **PUT /api/services/[id]:** Actualizar servicio
  - Actualización parcial (solo campos proporcionados)
  - Validaciones de negocio completas
  - Control de permisos: ADMIN, SUPER_ADMIN, MANAGER
- **DELETE /api/services/[id]:** Soft delete de servicio
  - Verifica citas futuras antes de desactivar
  - Control de permisos: ADMIN, SUPER_ADMIN, MANAGER
  - Preserva integridad referencial

#### Seguridad Implementada
- ✅ Autenticación requerida con NextAuth en todos los endpoints
- ✅ Multi-tenancy: Filtrado automático por tenantId
- ✅ Control de permisos por rol (PUT/DELETE: ADMIN, SUPER_ADMIN, MANAGER)
- ✅ Validación de datos: tipos, rangos, unicidad, integridad referencial

#### Validaciones de Negocio
**Creación (POST):**
- Nombre: requerido, string válido, único por tenant (case-insensitive)
- Duración: requerida, entre 5 y 480 minutos (8 horas)
- Precio: requerido, entre 0 y 999999.99
- CategoryId: opcional, debe existir y pertenecer al tenant

**Actualización (PUT):**
- Permisos: Solo ADMIN, SUPER_ADMIN, MANAGER
- Nombre: único por tenant si se cambia
- Validación de rangos en duración y precio
- Validación de categoryId si se proporciona

**Eliminación (DELETE):**
- Permisos: Solo ADMIN, SUPER_ADMIN, MANAGER
- Soft delete: marca isActive=false
- Verifica que no haya citas futuras SCHEDULED/CONFIRMED
- Retorna error 400 con número de citas si hay citas futuras

#### Características Técnicas
- **Autenticación:** NextAuth con getServerSession
- **ORM:** Prisma Client con queries optimizadas
- **Validaciones:** Runtime validation de tipos y rangos
- **Logging:** Console.error para debugging
- **Paginación:** Opcional con limit/offset
- **Búsqueda:** Case-insensitive en name y description
- **Soft Delete:** Preserva integridad referencial
- **Include Relations:** Category, serviceUsers, appointments

#### Integración con el Sistema
- **CRM:** Asignación de servicios a citas de clientes
- **Calendario:** Duración de servicios determina duración de citas
- **POS/Ventas:** Servicios vendibles como productos
- **Profesionales:** Asignación de servicios mediante serviceUsers
- **Reportes:** Inclusión en reportes de ingresos y citas

#### Archivos Creados
- `app/api/services/route.ts` - GET (listar), POST (crear)
- `app/api/services/[id]/route.ts` - GET (obtener), PUT (actualizar), DELETE (eliminar)
- `SPRINT1_FASE3_API_SERVICES.md` - Documentación completa con ejemplos

#### Documentación
- Descripción detallada de cada endpoint
- Ejemplos de request/response
- Códigos de error y validaciones
- Casos de uso prácticos
- Guía de testing manual
- Notas técnicas y debugging

#### Testing Verificado
- ✅ Compilación TypeScript sin errores
- ✅ Validación de estructura de archivos
- ✅ Verificación de importaciones
- ✅ Validación de lógica de negocio
- ✅ Revisión de seguridad multi-tenant
- ✅ Verificación de manejo de errores

#### Deployment
- ✅ Sin cambios en schema de Prisma
- ✅ Sin migraciones de base de datos requeridas
- ✅ Compatible con despliegue automático en Easypanel
- ✅ No requiere configuración adicional

#### PR y Release
- **PR:** #111 (mergeado con squash)
- **Tag:** v1.8.6
- **Branch:** feature/api-services-crud (eliminada post-merge)
- **Breaking Changes:** Ninguno
- **Requiere Migración:** No

---

     5	     4       3       2       1  
     6	     5       4       3       2  # Changelog
     7	     6       5       4       3  
     8	## [1.8.5] - 2025-10-15
     9	
    10	### Fixed - Sprint 1 Fase 2: Appointments Redirect
    11	
    12	#### Problema Resuelto
    13	- Link roto en navegación: `/dashboard/appointments` retornaba 404
    14	- Dashboard-nav.tsx tiene link "Agenda" apuntando a appointments
    15	- Funcionalidad de agenda ya existe en `/dashboard/calendar`
    16	
    17	#### Solución Implementada
    18	- **Nuevo archivo:** `app/dashboard/appointments/page.tsx`
    19	- **Tipo de redirect:** Permanente (308) para SEO y cache del browser
    20	- **Comportamiento:** Redirección instantánea a `/dashboard/calendar`
    21	- **Compatibilidad:** Mantiene links existentes en dashboard-nav.tsx
    22	- **Breaking changes:** Ninguno
    23	
    24	#### Detalles Técnicos
    25	- Usa Next.js `redirect()` de 'next/navigation'
    26	- Código minimalista y eficiente (18 líneas)
    27	- Comentarios explicativos claros
    28	- Sin lógica compleja ni dependencias adicionales
    29	
    30	#### Testing Verificado
    31	- ✅ Redirect funciona correctamente
    32	- ✅ No hay errores de TypeScript
    33	- ✅ Redirect es instantáneo
    34	- ✅ SEO-friendly (308 permanent redirect)
    35	- ✅ Compatible con navegación existente
    36	
    37	#### Archivos Modificados
    38	- **Nuevo:** `app/dashboard/appointments/page.tsx`
    39	
    40	#### PR y Release
    41	- **PR:** #110 (mergeado con squash)
    42	- **Tag:** v1.8.5
    43	- **Branch:** feature/appointments-redirect (eliminada post-merge)
    44	
    45	---
    46	
    47	## [1.8.4] - 2025-10-15
    48	
    49	### Added - Sprint 1 Fase 1: Dashboard Principal
    50	
    51	#### Nueva Página Principal del Dashboard
    52	- **Archivo:** `app/dashboard/page.tsx` completamente rediseñada
    53	- **Diseño:** UI moderna y profesional con componentes shadcn/ui
    54	- **Funcionalidad:** Vista overview con métricas clave del negocio
    55	
    56	#### Features Implementadas
    57	- Dashboard con 4 cards de métricas principales:
    58	  - Citas del día (con badge de porcentaje de cambio)
    59	  - Ingresos del mes (formato de moneda)
    60	  - Nuevos clientes (tracking de crecimiento)
    61	  - Tasa de ocupación (con indicador visual)
    62	- Grid responsivo (1 columna en mobile, 2 en tablet, 4 en desktop)
    63	- Cards con hover effects y animaciones suaves
    64	- Iconos lucide-react integrados (Calendar, DollarSign, Users, TrendingUp)
    65	- Colores y estilos consistentes con el brand de CitaPlanner
    66	
    67	#### Mejoras de UX
    68	- Información clara y legible
    69	- Visualización rápida del estado del negocio
    70	- Acceso rápido a métricas clave
    71	- Diseño profesional y moderno
    72	
    73	#### Testing
    74	- ✅ Renderizado correcto en todos los tamaños de pantalla
    75	- ✅ No hay errores de TypeScript
    76	- ✅ Integración perfecta con layout existente
    77	- ✅ Compatible con sistema de autenticación
    78	
    79	#### PR y Release
    80	- **PR:** #109 (mergeado con squash)
    81	- **Tag:** v1.8.4
    82	- **Branch:** feature/dashboard-overview (eliminada post-merge)
    83	
    84	---
    85	
    86	     7  
    87	     8  ## [1.8.3] - 2025-10-15
    88	     9  
    89	    10  ### Added - Módulo de Gestión de Comisiones
    90	    11  
    91	    12  #### Backend (API Endpoints)
    92	    13  
    93	    14  - **CommissionManager Service** (580+ líneas)
    94	    15    - `createCommission()` - Crear nueva comisión (servicio o venta)
    95	    16    - `getCommissions()` - Listar comisiones con filtros avanzados
    96	    17    - `getCommissionById()` - Obtener detalle de comisión específica
    97	    18    - `updateCommission()` - Actualizar comisión (aprobar, rechazar, pagar)
    98	    19    - `getProfessionalCommissionSummary()` - Resumen completo por profesional
    99	    20    - Cálculo automático de montos de comisión
   100	    21    - Gestión de estados: pending, approved, paid, rejected
   101	    22    - Validaciones de permisos y acceso
   102	    23    - Integración multi-tenant
   103	    24  
   104	    25  - **3 Endpoints API**
   105	    26    - `POST /api/commissions` - Crear comisión (servicio o venta)
   106	    27      - Validación de datos y permisos
   107	    28      - Cálculo automático de comisión
   108	    29      - Registro de metadata (tipo de fuente, referencias)
   109	    30    
   110	    31    - `GET /api/commissions` - Listar y filtrar comisiones
   111	    32      - Filtros: profesional, sucursal, rango de fechas, estado
   112	    33      - Paginación y ordenamiento
   113	    34      - Estadísticas agregadas (totales, pendientes, pagadas, aprobadas)
   114	    35      - Cálculo de resúmenes por estado
   115	    36    
   116	    37    - `GET /api/commissions/[id]` - Detalle de comisión
   117	    38      - Información completa de la comisión
   118	    39      - Datos relacionados (profesional, sucursal)
   119	    40      - Historial de estados
   120	    41    
   121	    42    - `PUT /api/commissions/[id]` - Actualizar comisión
   122	    43      - Aprobar comisión pendiente
   123	    44      - Rechazar comisión con razón
   124	    45      - Marcar como pagada con fecha
   125	    46      - Validaciones de transiciones de estado
   126	    47      - Control de permisos por rol
   127	    48    
   128	    49    - `GET /api/commissions/professional/[id]` - Resumen por profesional
   129	    50      - Total de comisiones (todas, pendientes, aprobadas, pagadas)
   130	    51      - Comisiones este mes y totales
   131	    52      - Lista de comisiones recientes
   132	    53      - Desglose por tipo (servicio vs venta)
   133	    54      - Estadísticas de desempeño
   134	    55  
   135	    56  #### Frontend (Componentes y Páginas)
   136	    57  
   137	    58  - **CommissionDashboard Component** (380 líneas)
   138	    59    - Dashboard principal de gestión de comisiones
   139	    60    - Filtros avanzados:
   140	    61      - Por profesional (dropdown con búsqueda)
   141	    62      - Por sucursal
   142	    63      - Por estado (pending, approved, paid, rejected)
   143	    64      - Rango de fechas personalizado
   144	    65    - Estadísticas en tiempo real:
   145	    66      - Total de comisiones
   146	    67      - Pendientes de aprobación
   147	    68      - Pagadas
   148	    69      - Aprobadas no pagadas
   149	    70    - Tabla interactiva de comisiones:
   150	    71      - Columnas: profesional, monto, tipo, estado, fecha, sucursal
   151	    72      - Badges de estado con colores
   152	    73      - Acciones por estado:
   153	    74        - Aprobar comisiones pendientes
   154	    75        - Rechazar con razón
   155	    76        - Marcar como pagada
   156	    77    - UI moderna con Tailwind CSS y Lucide Icons
   157	    78    - Responsive design para móvil y desktop
   158	    79  
   159	    80  - **ProfessionalCommissionDetail Component** (273 líneas)
   160	    81    - Vista detallada de comisiones por profesional
   161	    82    - Métricas principales:
   162	    83      - Total de comisiones
   163	    84      - Comisiones este mes
   164	    85      - Pendientes, aprobadas, pagadas
   165	    86    - Gráfico de tendencias:
   166	    87      - Visualización mensual con Recharts
   167	    88      - Comparación de comisiones pagadas vs pendientes
   168	    89      - Colores diferenciados por estado
   169	    90    - Lista completa de comisiones:
   170	    91      - Orden cronológico (más recientes primero)
   171	    92      - Detalles por comisión (tipo, monto, estado, fecha)
   172	    93      - Badges de estado visual
   173	    94    - Desglose por tipo:
   174	    95      - Comisiones por servicios
   175	    96      - Comisiones por ventas
   176	    97      - Subtotales y porcentajes
   177	    98  
   178	    99  - **2 Páginas Next.js**
   179	   100    - `/dashboard/commissions` - Dashboard principal
   180	   101      - Gestión centralizada de todas las comisiones
   181	   102      - Acceso completo para administradores
   182	   103      - Filtros y acciones masivas
   183	   104    
   184	   105    - `/dashboard/commissions/[id]` - Detalle por profesional
   185	   106      - Vista enfocada en un profesional específico
   186	   107      - Métricas individuales y tendencias
   187	   108      - Historial completo de comisiones
   188	   109  
   189	   110  #### Tipos TypeScript
   190	   111  
   191	   112  - **Commission Interface**
   192	   113    - `id`, `professionalId`, `branchId`, `tenantId`
   193	   114    - `amount` - Monto de la comisión
   194	   115    - `type` - Tipo: 'service' | 'sale'
   195	   116    - `status` - Estado: 'pending' | 'approved' | 'paid' | 'rejected'
   196	   117    - `source` - Fuente (appointmentId o saleId)
   197	   118    - `metadata` - Información adicional (servicio, cliente, etc.)
   198	   119    - `approvedAt`, `paidAt`, `rejectedAt`, `rejectionReason`
   199	   120    - `createdAt`, `updatedAt`
   200	   121  
   201	   122  - **CommissionStatus Enum**
   202	   123    - `PENDING` - Pendiente de aprobación
   203	   124    - `APPROVED` - Aprobada, no pagada
   204	   125    - `PAID` - Pagada al profesional
   205	   126    - `REJECTED` - Rechazada
   206	   127  
   207	   128  - **CommissionType Enum**
   208	   129    - `SERVICE` - Comisión por servicio/cita
   209	   130    - `SALE` - Comisión por venta de producto
   210	   131  
   211	   132  - **CommissionSummary Interface**
   212	   133    - Resumen agregado por profesional
   213	   134    - Totales por estado
   214	   135    - Desglose mensual
   215	   136    - Estadísticas de desempeño
   216	   137  
   217	   138  #### Funcionalidades Clave
   218	   139  
   219	   140  1. **Gestión Completa de Comisiones**
   220	   141     - Crear comisiones automáticamente desde servicios y ventas
   221	   142     - Aprobar comisiones pendientes
   222	   143     - Rechazar con razón específica
   223	   144     - Marcar como pagadas con fecha
   224	   145     - Transiciones de estado validadas
   225	   146  
   226	   147  2. **Filtros y Búsqueda Avanzada**
   227	   148     - Filtrar por profesional
   228	   149     - Filtrar por sucursal
   229	   150     - Filtrar por estado
   230	   151     - Filtrar por rango de fechas
   231	   152     - Combinar múltiples filtros
   232	   153  
   233	   154  3. **Estadísticas en Tiempo Real**
   234	   155     - Total de comisiones
   235	   156     - Pendientes de aprobación
   236	   157     - Aprobadas no pagadas
   237	   158     - Pagadas en el mes
   238	   159     - Desglose por tipo
   239	   160  
   240	   161  4. **Visualizaciones y Reportes**
   241	   162     - Gráficos de tendencias mensuales
   242	   163     - Distribución por estado
   243	   164     - Comparativas de desempeño
   244	   165     - Rankings de profesionales
   245	   166     - Desglose por tipo de comisión
   246	   167  
   247	   168  5. **Integración con Módulos Existentes**
   248	   169     - Servicios y citas (comisiones por servicio)
   249	   170     - Ventas y POS (comisiones por venta)
   250	   171     - Profesionales (resumen por profesional)
   251	   172     - Sucursales (filtrado por ubicación)
   252	   173     - Sistema multi-tenant
   253	   174  
   254	   175  6. **Seguridad y Validaciones**
   255	   176     - Control de acceso por rol
   256	   177     - Validación de permisos
   257	   178     - Validación de transiciones de estado
   258	   179     - Aislamiento por tenant
   259	   180     - Auditoría de cambios
   260	   181  
   261	   182  #### Integración
   262	   183  
   263	   184  - Compatible con módulo de servicios (v1.0+)
   264	   185  - Compatible con módulo de ventas/POS (v1.2+)
   265	   186  - Compatible con sistema de profesionales (v1.5+)
   266	   187  - Compatible con asignaciones multi-sucursal (v1.6+)
   267	   188  - Integrado con sistema de reportes (v1.7+)
   268	   189  
   269	   190  #### Métricas del Módulo
   270	   191  
   271	   192  - **Archivos creados:** 8
   272	   193    - 3 endpoints API (582 líneas)
   273	   194    - 2 componentes React (653 líneas)
   274	   195    - 2 páginas Next.js (52 líneas)
   275	   196    - 1 archivo de tipos (37 líneas)
   276	   197  - **Total líneas de código:** 1,124
   277	   198  - **Breaking changes:** Ninguno
   278	   199  - **Migraciones:** No requeridas
   279	   200  - **Merge SHA:** `6d294849ee0b46fcba96f4a47e30f92e55d1dc81`
   280	   201  
   281	   202  #### PR #108
   282	   203  
   283	   204  - **Título:** Módulo completo de gestión de comisiones v1.8.3
   284	   205  - **Estado:** ✅ Merged
   285	   206  - **Tag:** v1.8.3
   286	   207  - **Deploy:** Automático en Easypanel
   287	   208  - **Documentación:** PR_108_COMMISSIONS_MODULE.md
   288	   209  
   289	   210       6       5       4  All notable changes to CitaPlanner will be documented in this file.
   290	   211       7       6       5  
   291	   212       8  
   292	   213       9  ## [1.8.2] - 2025-10-15
   293	   214      10  
   294	   215      11  ### Fixed - Ruta Working Hours
   295	   216      12  
   296	   217      13  #### Dashboard de Horarios
   297	   218      14  - **PR #105:** Crear ruta `/dashboard/working-hours` y endpoint `/api/professionals`
   298	   219      15    - **Problema:** Link en navegación apuntaba a ruta inexistente
   299	   220      16    - **Endpoint:** `GET /api/professionals` para listar todos los profesionales
   300	   221      17      - Filtros: por sucursal, incluir inactivos
   301	   222      18      - Datos completos: perfil, sucursales, horarios, citas
   302	   223      19      - Compatible con código existente (calendar, modals)
   303	   224      20    - **Página:** Vista centralizada de horarios
   304	   225      21      - Estadísticas: total, con horarios, sin configurar, activos
   305	   226      22      - Filtros: búsqueda, sucursal, mostrar inactivos
   306	   227      23      - Tarjetas con avatar, contacto, sucursales, citas
   307	   228      24      - Estado visual de horarios configurados
   308	   229      25      - Botón para gestionar horario individual
   309	   230      26    - Integración con sistema de horarios (Fase 1)
   310	   231      27    - Integración con asignaciones (Fase 2)
   311	   232      28    - UI moderna con Tailwind CSS y Lucide Icons
   312	   233      29    - Merge SHA: `880d520e0522a48f3c3122615bad11a2cf293434`
   313	   234      30  
   314	   235      31  #### Métricas del Fix
   315	   236      32  - Archivos creados: 2
   316	   237      33  - Líneas de código: 539
   317	   238      34  - Breaking changes: Ninguno
   318	   239      35  - Migraciones: No requeridas
   319	   240      36       7       6  The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
   320	   241      37       8       7  and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
   321	   242      38       9  ## [1.8.1] - 2025-10-15
   322	   243      39      10  
   323	   244      40      11  ### Fixed - Hotfix Crítico
   324	   245      41      12  
   325	   246      42      13  #### API de Notificaciones
   326	   247      43      14  - **PR #104:** Corregir campo `scheduledAt` inexistente en modelo Appointment
   327	   248      44      15    - Reemplazar `scheduledAt` con `startTime` en `notificationService.ts`
   328	   249      45      16    - Fix error crítico: Invalid `prisma.notificationLog.findMany()` invocation
   329	   250      46      17    - Endpoint afectado: `/api/notifications/logs`
   330	   251      47      18    - Causa: El modelo Appointment usa `startTime`/`endTime`, no `scheduledAt`
   331	   252      48      19    - Impacto: API de logs de notificaciones restaurada
   332	   253      49      20    - Severidad: 🔴 Crítica
   333	   254      50      21    - Merge SHA: `dfd9706ea7334e8dc9d0fb2f53ee25b967d72344`
   334	   255      51      22  
   335	   256      52      23  #### Métricas del Fix
   336	   257      53      24  - Archivos modificados: 1
   337	   258      54      25  - Líneas modificadas: 1
   338	   259      55      26  - Tiempo de resolución: ~13 minutos
   339	   260      56      27  - Breaking changes: Ninguno
   340	   261      57      28  
   341	   262      58      29       8  
   342	   263      59      30       9  ## [1.8.0] - 2025-10-14
   343	   264      60      31      10  
   344	   265      61      32      11  ### Added - Fase 4: Vista de Calendario por Profesional
   345	   266      62      33      12  
   346	   267      63      34      13  #### Dependencias
   347	   268      64      35      14  - **react-big-calendar** - Librería de calendario interactivo
   348	   269      65      36      15  - **date-fns** - Manejo de fechas y localización
   349	   270      66      37      16  - **@types/react-big-calendar** - Tipos TypeScript
   350	   271      67      38      17  
   351	   272      68      39      18  #### Backend
   352	   273      69      40      19  
   353	   274      70      41      20  - **CalendarManager Service** (600+ líneas)
   354	   275      71      42      21    - `getCalendarEvents()` - Obtener eventos con filtros avanzados
   355	   276      72      43      22    - `getProfessionalAvailability()` - Calcular disponibilidad completa
   356	   277      73      44      23    - `validateAvailability()` - Validar antes de crear/mover citas
   357	   278      74      45      24    - `getCalendarStatistics()` - Estadísticas del calendario
   358	   279      75      46      25    - `getAvailableSlots()` - Slots disponibles para agendar
   359	   280      76      47      26    - `validateCalendarAccess()` - Validación de permisos por rol
   360	   281      77      48      27    - Integración con `scheduleManager` (Fase 1)
   361	   282      78      49      28    - Integración con `branchAssignments` (Fase 2)
   362	   283      79      50      29    - Manejo de horarios override por sucursal
   363	   284      80      51      30    - Procesamiento de excepciones (vacaciones, bajas)
   364	   285      81      52      31  
   365	   286      82      53      32  #### API Endpoints
   366	   287      83      54      33  - `GET /api/calendar/professional/[id]` - Eventos del calendario con filtros
   367	   288      84      55      34  - `GET /api/calendar/availability/[professionalId]` - Disponibilidad y horarios
   368	   289      85      56      35  - `GET /api/calendar/availability/[professionalId]/slots` - Slots disponibles
   369	   290      86      57      36  - `POST /api/calendar/availability/validate` - Validar disponibilidad
   370	   291      87      58      37  - `POST /api/calendar/appointments` - Crear cita desde calendario
   371	   292      88      59      38  - `PATCH /api/calendar/appointments/[id]/reschedule` - Reprogramar cita (drag & drop)
   372	   293      89      60      39  - `GET /api/calendar/statistics/[professionalId]` - Estadísticas del calendario
   373	   294      90      61      40  - `GET /api/professionals/me` - Datos del profesional autenticado
   374	   295      91      62      41  
   375	   296      92      63      42  #### Tipos TypeScript (400+ líneas)
   376	   297      93      64      43  - `CalendarEvent` - Evento del calendario con metadata completa
   377	   298      94      65      44  - `CalendarEventResource` - Datos de la cita (cliente, servicio, estado)
   378	   299      95      66      45  - `AvailabilityBlock` - Bloques de disponibilidad (regular/exception/override)
   379	   300      96      67      46  - `ProfessionalAvailability` - Disponibilidad completa de profesional
   380	   301      97      68      47  - `CalendarFilters` - Filtros avanzados del calendario
   381	   302      98      69      48  - `CalendarView` - Vistas del calendario (month/week/day/agenda)
   382	   303      99      70      49  - `CalendarStatistics` - Estadísticas y métricas del calendario
   383	   304     100      71      50  - Helpers: `createCalendarEventFromAppointment()`, `getStatusColor()`, `getDateRangeForView()`
   384	   305     101      72      51  
   385	   306     102      73      52  #### Frontend Components
   386	   307     103      74      53  
   387	   308     104      75      54  - **ProfessionalCalendar** (300+ líneas)
   388	   309     105      76      55    - Integración completa con react-big-calendar
   389	   310     106      77      56    - Vistas: mensual, semanal, diaria, agenda
   390	   311     107      78      57    - Drag & drop para reprogramar citas
   391	   312     108      79      58    - Resize de eventos
   392	   313     109      80      59    - Estilos personalizados por estado
   393	   314     110      81      60    - Visualización de disponibilidad
   394	   315     111      82      61    - Localización en español
   395	   316     112      83      62    - Responsive design
   396	   317     113      84      63  
   397	   318     114      85      64  - **CalendarFilters** (150+ líneas)
   398	   319     115      86      65    - Selector de vista (mes/semana/día/agenda)
   399	   320     116      87      66    - Filtro por profesional (admin/gerente)
   400	   321     117      88      67    - Filtro por sucursal
   401	   322     118      89      68    - Filtro por estado de cita
   402	   323     119      90      69    - Filtro por servicio
   403	   324     120      91      70    - Aplicación en tiempo real
   404	   325     121      92      71  
   405	   326     122      93      72  - **CalendarLegend** (100+ líneas)
   406	   327     123      94      73    - Leyenda de colores por estado
   407	   328     124      95      74    - Indicadores de disponibilidad
   408	   329     125      96      75    - Diseño compacto y claro
   409	   330     126      97      76  
   410	   331     127      98      77  - **AppointmentModal** (350+ líneas)
   411	   332     128      99      78    - Tres modos: crear, editar, ver
   412	   333     129     100      79    - Formulario completo con validaciones
   413	   334     130     101      80    - Auto-cálculo de endTime según servicio
   414	   335     131     102      81    - Botón de cancelar cita
   415	   336     132     103      82    - Manejo de errores inline
   416	   337     133     104      83    - Estados visuales
   417	   338     134     105      84  
   418	   339     135     106      85  #### Páginas
   419	   340     136     107      86  - `/dashboard/calendar/page.tsx` - Página principal del calendario (500+ líneas)
   420	   341     137     108      87    - Estado completo del calendario
   421	   342     138     109      88    - Gestión de eventos y disponibilidad
   422	   343     139     110      89    - Integración con API endpoints
   423	   344     140     111      90    - Manejo de drag & drop
   424	   345     141     112      91    - Sistema de filtros
   425	   346     142     113      92    - Modal de citas
   426	   347     143     114      93    - Permisos por rol
   427	   348     144     115      94    - Loading states
   428	   349     145     116      95    - Error handling
   429	   350     146     117      96  
   430	   351     147     118      97  #### Funcionalidades Implementadas
   431	   352     148     119      98  
   432	   353     149     120      99  ##### Vistas del Calendario
   433	   354     150     121     100  - ✅ Vista mensual - Resumen del mes completo
   434	   355     151     122     101  - ✅ Vista semanal - 7 días con slots de tiempo
   435	   356     152     123     102  - ✅ Vista diaria - Día detallado con todos los slots
   436	   357     153     124     103  - ✅ Vista agenda - Lista cronológica de citas
   437	   358     154     125     104  
   438	   359     155     126     105  ##### Gestión de Citas
   439	   360     156     127     106  - ✅ **Crear citas** - Click en slot disponible → Modal → Crear
   440	   361     157     128     107  - ✅ **Editar citas** - Click en evento → Modal → Editar
   441	   362     158     129     108  - ✅ **Cancelar citas** - Botón en modal con confirmación
   442	   363     159     130     109  - ✅ **Reprogramar (Drag & Drop)** - Arrastrar evento → Validar → Guardar
   443	   364     160     131     110  - ✅ **Resize de eventos** - Ajustar duración visualmente
   444	   365     161     132     111  
   445	   366     162     133     112  ##### Validaciones Automáticas
   446	   367     163     134     113  - ✅ Horario dentro de disponibilidad
   447	   368     164     135     114  - ✅ Sin solapamientos con otras citas
   448	   369     165     136     115  - ✅ Respeto a excepciones (vacaciones, bajas)
   449	   370     166     137     116  - ✅ Duración correcta del servicio
   450	   371     167     138     117  - ✅ Permisos por rol
   451	   372     168     139     118  
   452	   373     169     140     119  ##### Visualización de Disponibilidad
   453	   374     170     141     120  - ✅ Bloques disponibles (fondo blanco, clickeable)
   454	   375     171     142     121  - ✅ Bloques no disponibles (fondo gris, bloqueado)
   455	   376     172     143     122  - ✅ Excepciones (vacaciones) diferenciadas
   456	   377     173     144     123  - ✅ Horarios override por sucursal
   457	   378     174     145     124  
   458	   379     175     146     125  ##### Filtros Avanzados
   459	   380     176     147     126  - ✅ Filtro por profesional (admin/gerente)
   460	   381     177     148     127  - ✅ Filtro por sucursal
   461	   382     178     149     128  - ✅ Filtro por estado (pendiente, confirmada, completada, etc.)
   462	   383     179     150     129  - ✅ Filtro por servicio
   463	   384     180     151     130  - ✅ Aplicación en tiempo real sin recargar
   464	   385     181     152     131  
   465	   386     182     153     132  ##### Permisos por Rol
   466	   387     183     154     133  - ✅ **Profesional**: Solo su propio calendario
   467	   388     184     155     134  - ✅ **Gerente**: Calendarios de profesionales de su(s) sucursal(es)
   468	   389     185     156     135  - ✅ **Admin/Super Admin**: Todos los calendarios
   469	   390     186     157     136  - ✅ **Cliente**: Sin acceso
   470	   391     187     158     137  
   471	   392     188     159     138  #### Integración con Fases Anteriores
   472	   393     189     160     139  
   473	   394     190     161     140  ##### Fase 1 (Horarios)
   474	   395     191     162     141  - ✅ Usa `scheduleManager.ts` para obtener horarios
   475	   396     192     163     142  - ✅ Respeta `ProfessionalSchedule` (dayOfWeek, startTime, endTime)
   476	   397     193     164     143  - ✅ Procesa `ScheduleException` para bloquear fechas
   477	   398     194     165     144  - ✅ Calcula disponibilidad basada en configuración
   478	   399     195     166     145  
   479	   400     196     167     146  ##### Fase 2 (Asignaciones)
   480	   401     197     168     147  - ✅ Considera `branchAssignments` con sucursal primaria
   481	   402     198     169     148  - ✅ Aplica `scheduleOverride` cuando está definido
   482	   403     199     170     149  - ✅ Filtra por sucursal en queries
   483	   404     200     171     150  - ✅ Valida permisos de gerente según sucursales
   484	   405     201     172     151  
   485	   406     202     173     152  ##### Fase 3 (Reportes)
   486	   407     203     174     153  - ✅ Estadísticas del calendario complementan reportes
   487	   408     204     175     154  - ✅ `CalendarStatistics` incluye métricas de utilización
   488	   409     205     176     155  - ✅ Datos alimentan dashboards de análisis
   489	   410     206     177     156  
   490	   411     207     178     157  #### Características Técnicas
   491	   412     208     179     158  - 🔒 Validaciones robustas en backend y frontend
   492	   413     209     180     159  - 🚀 Rendimiento optimizado con lazy loading
   493	   414     210     181     160  - 📱 Responsive design con TailwindCSS
   494	   415     211     182     161  - 🌐 Localización completa en español
   495	   416     212     183     162  - ♿ Accesibilidad con ARIA labels
   496	   417     213     184     163  - 🎨 UI/UX intuitiva y profesional
   497	   418     214     185     164  - 📊 Estadísticas de utilización
   498	   419     215     186     165  - 🔔 Toast notifications para feedback
   499	   420     216     187     166  - ⚡ Actualizaciones en tiempo real
   500	   421     217     188     167  
   501	   422     218     189     168  ### Documentation
   502	   423     219     190     169  - `FASE4_CALENDAR.md` - Documentación completa de la Fase 4 (50+ páginas)
   503	   424     220     191     170    - Arquitectura detallada
   504	   425     221     192     171    - API Endpoints con ejemplos
   505	   426     222     193     172    - Componentes Frontend
   506	   427     223     194     173    - Guías de uso para cada rol
   507	   428     224     195     174    - Testing manual checklist
   508	   429     225     196     175    - Integración con fases anteriores
   509	   430     226     197     176    - Próximos pasos
   510	   431     227     198     177  
   511	   432     228     199     178  ### Statistics
   512	   433     229     200     179  - 17 archivos nuevos/modificados
   513	   434     230     201     180  - ~3,000 líneas de código
   514	   435     231     202     181  - 4 componentes React principales
   515	   436     232     203     182  - 8 endpoints API
   516	   437     233     204     183  - 30+ tipos TypeScript
   517	   438     234     205     184  - 10+ métodos de servicio
   518	   439     235     206     185  - Sin breaking changes
   519	   440     236     207     186  - 100% compatible con fases anteriores
   520	   441     237     208     187  
   521	   442     238     209     188  ### Breaking Changes
   522	   443     239     210     189  - ❌ **Ninguno** - Completamente compatible con v1.7.0
   523	   444     240     211     190  
   524	   445     241     212     191  ### Notes
   525	   446     242     213     192  - Sistema de calendario completamente funcional
   526	   447     243     214     193  - Drag & drop con validaciones en tiempo real
   527	   448     244     215     194  - Integración perfecta con horarios y asignaciones
   528	   449     245     216     195  - Permisos estrictos según rol
   529	   450     246     217     196  - Código limpio, comentado y mantenible
   530	   451     247     218     197  - Listo para producción
   531	   452     248     219     198  
   532	   453     249     220     199  ## [1.7.0] - 2025-10-14
   533	   454     250     221     200  
   534	   455     251     222     201  ### Added - Fase 3: Sistema de Reportes
   535	   456     252     223     202  
   536	   457     253     224     203  #### Backend
   537	   458     254     225     204  - **ReportManager Service** (800+ líneas)
   538	   459     255     226     205    - Generación de reportes por profesional, sucursal y general
   539	   460     256     227     206    - Cálculo de métricas: citas, ingresos, tiempo, clientes
   540	   461     257     228     207    - Tendencias y análisis temporal
   541	   462     258     229     208    - Soporte para múltiples períodos (día, semana, mes, año, custom)
   542	   463     259     230     209    - Reportes comparativos entre profesionales o sucursales
   543	   464     260     231     210  
   544	   465     261     232     211  #### API Endpoints
   545	   466     262     233     212  - `GET /api/reports/professional/[id]` - Reporte de profesional
   546	   467     263     234     213  - `GET /api/reports/branch/[id]` - Reporte de sucursal
   547	   468     264     235     214  - `GET /api/reports/overview` - Reporte general del negocio
   548	   469     265     236     215  - `GET /api/reports/comparison` - Reportes comparativos
   549	   470     266     237     216  
   550	   471     267     238     217  #### Frontend Components
   551	   472     268     239     218  - **ReportDashboard** (400+ líneas)
   552	   473     269     240     219    - Dashboard general con métricas consolidadas
   553	   474     270     241     220    - Gráficos de tendencias (líneas)
   554	   475     271     242     221    - Top 10 profesionales, sucursales y servicios
   555	   476     272     243     222    - Filtros de período y rango de fechas
   556	   477     273     244     223    
   557	   478     274     245     224  - **ProfessionalReportView** (450+ líneas)
   558	   479     275     246     225    - Vista detallada de profesional
   559	   480     276     247     226    - Métricas individuales
   560	   481     277     248     227    - Desempeño por sucursal
   561	   482     278     249     228    - Servicios más realizados
   562	   483     279     250     229    - Gráficos de pastel y barras
   563	   484     280     251     230    
   564	   485     281     252     231  - **BranchReportView** (450+ líneas)
   565	   486     282     253     232    - Vista detallada de sucursal
   566	   487     283     254     233    - Métricas de sucursal
   567	   488     284     255     234    - Desempeño de profesionales
   568	   489     285     256     235    - Servicios más solicitados
   569	   490     286     257     236    - Análisis de utilización
   570	   491     287     258     237  
   571	   492     288     259     238  #### Páginas
   572	   493     289     260     239  - `/dashboard/reports` - Dashboard principal de reportes
   573	   494     290     261     240  - `/dashboard/reports/professional/[id]` - Reporte de profesional
   574	   495     291     262     241  - `/dashboard/reports/branch/[id]` - Reporte de sucursal
   575	   496     292     263     242  
   576	   497     293     264     243  #### Tipos TypeScript
   577	   498     294     265     244  - Tipos completos para reportes (350+ líneas)
   578	   499     295     266     245  - Interfaces para métricas y filtros
   579	   500     296     267     246  - Enums para períodos y estados
   580	   501     297     268     247  
   581	   502     298     269     248  #### Visualizaciones
   582	   503     299     270     249  - Gráficos de línea (tendencias)
   583	   504     300     271     250  - Gráficos de barras (comparativas)
   584	   505     301     272     251  - Gráficos de pastel (distribuciones)
   585	   506     302     273     252  - Tarjetas de métricas clave
   586	   507     303     274     253  - Integración con Recharts
   587	   508     304     275     254  
   588	   509     305     276     255  #### Métricas Calculadas
   589	   510     306     277     256  - **Citas**: Total, completadas, canceladas, tasas
   590	   511     307     278     257  - **Ingresos**: Total, promedio, proyectado
   591	   512     308     279     258  - **Tiempo**: Horas trabajadas, utilización, horas pico
   592	   513     309     280     259  - **Clientes**: Total, nuevos, retención
   593	   514     310     281     260  
   594	   515     311     282     261  ### Documentation
   595	   516     312     283     262  - `FASE3_REPORTS.md` - Documentación completa de la Fase 3
   596	   517     313     284     263  - Casos de uso detallados
   597	   518     314     285     264  - Guías de integración
   598	   519     315     286     265  - Ejemplos de API
   599	   520     316     287     266  
   600	   521     317     288     267  ### Statistics
   601	   522     318     289     268  - 14 archivos nuevos
   602	   523     319     290     269  - ~3,500 líneas de código
   603	   524     320     291     270  - 3 componentes React principales
   604	   525     321     292     271  - 4 endpoints API
   605	   526     322     293     272  - 20+ tipos TypeScript
   606	   527     323     294     273  - 12+ métodos de servicio
   607	   528     324     295     274  
   608	   529     325     296     275  ## [1.6.0] - 2025-10-14
   609	   530     326     297     276  
   610	   531     327     298     277  ### Added - Fase 2: Sistema de Asignación Masiva
   611	   532     328     299     278  
   612	   533     329     300     279  #### Backend
   613	   534     330     301     280  - **BranchAssignment Model**
   614	   535     331     302     281    - Relación muchos-a-muchos entre profesionales y sucursales
   615	   536     332     303     282    - Gestión de sucursal primaria
   616	   537     333     304     283    - Estados activo/inactivo con soft delete
   617	   538     334     305     284    - Fechas de vigencia (inicio y fin)
   618	   539     335     306     285    - Campo para horarios específicos por sucursal
   619	   540     336     307     286    - Índices optimizados para consultas
   620	   541     337     308     287  
   621	   542     338     309     288  - **BranchAssignmentManager Service** (600+ líneas)
   622	   543     339     310     289    - `validateAssignment()` - Validación completa de asignaciones
   623	   544     340     311     290    - `createAssignment()` - Crear asignación individual
   624	   545     341     312     291    - `assignProfessionalsToBranch()` - Asignación masiva a sucursal
   625	   546     342     313     292    - `assignProfessionalToBranches()` - Asignar a múltiples sucursales
   626	   547     343     314     293    - `getBranchAssignments()` - Listar por sucursal
   627	   548     344     315     294    - `getProfessionalAssignments()` - Listar por profesional
   628	   549     345     316     295    - `updateAssignment()` - Actualizar asignación
   629	   550     346     317     296    - `deleteAssignment()` - Eliminar asignación
   630	   551     347     318     297    - `getAssignmentStats()` - Estadísticas
   631	   552     348     319     298    - `getAvailableProfessionals()` - Profesionales disponibles
   632	   553     349     320     299  
   633	   554     350     321     300  #### API Endpoints
   634	   555     351     322     301  - `POST /api/branches/[id]/assignments` - Asignación masiva
   635	   556     352     323     302  - `GET /api/branches/[id]/assignments` - Listar asignaciones
   636	   557     353     324     303  - `GET /api/branches/[id]/assignments/available` - Profesionales disponibles
   637	   558     354     325     304  - `PUT /api/branches/[id]/assignments/[assignmentId]` - Actualizar
   638	   559     355     326     305  - `DELETE /api/branches/[id]/assignments/[assignmentId]` - Eliminar
   639	   560     356     327     306  - `POST /api/professionals/[id]/assignments` - Asignar a múltiples sucursales
   640	   561     357     328     307  - `GET /api/professionals/[id]/assignments` - Listar por profesional
   641	   562     358     329     308  - `GET /api/assignments/stats` - Estadísticas generales
   642	   563     359     330     309  
   643	   564     360     331     310  #### Frontend Components
   644	   565     361     332     311  - **BranchAssignmentManager** (500+ líneas)
   645	   566     362     333     312    - Vista desde sucursal
   646	   567     363     334     313    - Modal de asignación masiva
   647	   568     364     335     314    - Selección múltiple con checkbox
   648	   569     365     336     315    - Opciones de asignación (primaria, fechas, notas)
   649	   570     366     337     316    - Lista de profesionales asignados
   650	   571     367     338     317    - Acciones inline (toggle estado, primaria, eliminar)
   651	   572     368     339     318  
   652	   573     369     340     319  - **ProfessionalBranchesManager** (350+ líneas)
   653	   574     370     341     320    - Vista desde profesional
   654	   575     371     342     321    - Grid de tarjetas de sucursales
   655	   576     372     343     322    - Indicador visual de sucursal primaria
   656	   577     373     344     323    - Gestión de asignaciones
   657	   578     374     345     324    - Resumen con estadísticas
   658	   579     375     346     325  
   659	   580     376     347     326  #### Pages
   660	   581     377     348     327  - `/dashboard/branches/[id]/assignments` - Gestión por sucursal
   661	   582     378     349     328  - `/dashboard/professionals/[id]/branches` - Gestión por profesional
   662	   583     379     350     329  
   663	   584     380     351     330  #### Database Migration
   664	   585     381     352     331  - `20251014_add_branch_assignments` - Tabla BranchAssignment con índices
   665	   586     382     353     332  
   666	   587     383     354     333  ### Documentation
   667	   588     384     355     334  - `FASE2_MASS_ASSIGNMENT.md` - Documentación completa de la Fase 2
   668	   589     385     356     335  - Casos de uso detallados
   669	   590     386     357     336  - Guías de integración
   670	   591     387     358     337  
   671	   592     388     359     338  ### Statistics
   672	   593     389     360     339  - 13 archivos nuevos
   673	   594     390     361     340  - ~2,500 líneas de código
   674	   595     391     362     341  - 2 componentes React principales
   675	   596     392     363     342  - 5 endpoints API principales
   676	   597     393     364     343  - 10+ tipos TypeScript
   677	   598     394     365     344  - 12+ métodos de servicio
   678	   599     395     366     345  
   679	   600     396     367     346  ## [1.5.0] - 2025-10-13
   680	   601     397     368     347  
   681	   602     398     369     348  ### Added - Fase 1: Sistema de Horarios
   682	   603     399     370     349  
   683	   604     400     371     350  #### Backend
   684	   605     401     372     351  - **ScheduleManager Service** (500+ líneas)
   685	   606     402     373     352    - Gestión completa de horarios de profesionales
   686	   607     403     374     353    - Validación de horarios y disponibilidad
   687	   608     404     375     354    - Cálculo de slots disponibles
   688	   609     405     376     355    - Manejo de días festivos y excepciones
   689	   610     406     377     356    - Soporte para horarios especiales
   690	   611     407     378     357  
   691	   612     408     379     358  #### API Endpoints
   692	   613     409     380     359  - `GET /api/professionals/[id]/schedule` - Obtener horario
   693	   614     410     381     360  - `PUT /api/professionals/[id]/schedule` - Actualizar horario
   694	   615     411     382     361  - `GET /api/professionals/[id]/availability` - Verificar disponibilidad
   695	   616     412     383     362  - `POST /api/professionals/[id]/schedule/exceptions` - Agregar excepciones
   696	   617     413     384     363  
   697	   618     414     385     364  #### Frontend Components
   698	   619     415     386     365  - **ScheduleEditor** (400+ líneas)
   699	   620     416     387     366    - Editor visual de horarios
   700	   621     417     388     367    - Configuración por día de la semana
   701	   622     418     389     368    - Gestión de bloques de tiempo
   702	   623     419     390     369    - Validación en tiempo real
   703	   624     420     391     370  
   704	   625     421     392     371  #### Types
   705	   626     422     393     372  - Tipos TypeScript completos para horarios
   706	   627     423     394     373  - Interfaces para configuración y validación
   707	   628     424     395     374  
   708	   629     425     396     375  ### Documentation
   709	   630     426     397     376  - `FASE1_SCHEDULES.md` - Documentación de horarios
   710	   631     427     398     377  
   711	   632     428     399     378  ## [1.4.0] - 2025-10-06
   712	   633     429     400     379  
   713	   634     430     401     380  ### Fixed - Errores Críticos en Producción
   714	   635     431     402     381  
   715	   636     432     403     382  #### NotificationLog Error
   716	   637     433     404     383  - Eliminado campo inexistente `recipient` de consultas Prisma
   717	   638     434     405     384  - Mejorado logging en notificationService.ts
   718	   639     435     406     385  - Agregado manejo de errores robusto
   719	   640     436     407     386  
   720	   641     437     408     387  #### Client Service Error
   721	   642     438     409     388  - Agregado logging detallado en clientService.ts
   722	   643     439     410     389  - Mejorados mensajes de error para usuarios
   723	   644     440     411     390  - Agregado rastreo de sesión y tenants disponibles
   724	   645     441     412     391  - Implementado debugging para "Tenant not found"
   725	   646     442     413     392  
   726	   647     443     414     393  ### Documentation
   727	   648     444     415     394  - `PR_92_MERGE_SUMMARY.md` - Resumen del merge
   728	   649     445     416     395  - `MERGE_PR92_VISUAL.md` - Documentación visual
   729	   650     446     417     396  
   730	   651     447     418     397  ## [1.3.0] - 2025-10-05
   731	   652     448     419     398  
   732	   653     449     420     399  ### Added - Checkpoint Estable
   733	   654     450     421     400  - Checkpoint v1.3.0 creado como punto de referencia estable
   734	   655     451     422     401  - Sistema completamente funcional con todos los módulos core
   735	   656     452     423     402  - Documentación completa actualizada
   736	   657     453     424     403  
   737	   658     454     425     404  ### Fixed
   738	   659     455     426     405  - Estandarización de respuestas API
   739	   660     456     427     406  - Corrección de errores de integración frontend-backend
   740	   661     457     428     407  - Mejoras en manejo de errores
   741	   662     458     429     408  
   742	   663     459     430     409  ## [1.2.0] - 2025-10-04
   743	   664     460     431     410  
   744	   665     461     432     411  ### Added - Internacionalización
   745	   666     462     433     412  - Soporte completo para español
   746	   667     463     434     413  - Traducción de toda la interfaz
   747	   668     464     435     414  - Mensajes de error en español
   748	   669     465     436     415  - Documentación en español
   749	   670     466     437     416  
   750	   671     467     438     417  ## [1.1.0] - 2025-10-03
   751	   672     468     439     418  
   752	   673     469     440     419  ### Added - Módulo de Ventas/POS/Inventario
   753	   674     470     441     420  - Sistema completo de punto de venta
   754	   675     471     442     421  - Gestión de inventario
   755	   676     472     443     422  - Reportes de ventas
   756	   677     473     444     423  - Integración con sistema de citas
   757	   678     474     445     424  
   758	   679     475     446     425  ## [1.0.0] - 2025-10-02
   759	   680     476     447     426  
   760	   681     477     448     427  ### Added - CRM de Clientes
   761	   682     478     449     428  - Gestión completa de clientes
   762	   683     479     450     429  - Historial de citas
   763	   684     480     451     430  - Notas y seguimiento
   764	   685     481     452     431  - Integración con sistema de notificaciones
   765	   686     482     453     432  
   766	   687     483     454     433  ## [0.9.0] - 2025-10-01
   767	   688     484     455     434  
   768	   689     485     456     435  ### Added - Sistema de Notificaciones
   769	   690     486     457     436  - Notificaciones por email
   770	   691     487     458     437  - Notificaciones por SMS
   771	   692     488     459     438  - Notificaciones push
   772	   693     489     460     439  - Configuración de servicios (Twilio, SendGrid)
   773	   694     490     461     440  
   774	   695     491     462     441  ## [0.8.0] - 2025-09-30
   775	   696     492     463     442  
   776	   697     493     464     443  ### Added - Configuración Inicial
   777	   698     494     465     444  - Estructura base del proyecto
   778	   699     495     466     445  - Configuración de Next.js
   779	   700     496     467     446  - Configuración de Prisma
   780	   701     497     468     447  - Configuración de Docker
   781	   702     498     469     448  - Configuración de Easypanel
   782	   703     499     470     449  
   783	   704     500     471     450  ---
   784	   705     501     472     451  
   785	   706     502     473     452  **Nota**: Este changelog se mantiene actualizado con cada release. Para más detalles sobre cada versión, consulta la documentación específica en la carpeta `docs/`.
   786	   707     503     474     453  