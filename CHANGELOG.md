Here's the result of running `cat -n` on /home/ubuntu/github_repos/citaplanner/CHANGELOG.md:
     1	Here's the result of running `cat -n` on /home/ubuntu/github_repos/citaplanner/CHANGELOG.md:
     2	     1  Here's the result of running `cat -n` on /home/ubuntu/github_repos/citaplanner/CHANGELOG.md:
     3	     2       1  
     4	     3       2  # Changelog
     5	     4       3  

## [1.8.3] - 2025-10-15

### Added - Módulo de Gestión de Comisiones

#### Backend (API Endpoints)

- **CommissionManager Service** (580+ líneas)
  - `createCommission()` - Crear nueva comisión (servicio o venta)
  - `getCommissions()` - Listar comisiones con filtros avanzados
  - `getCommissionById()` - Obtener detalle de comisión específica
  - `updateCommission()` - Actualizar comisión (aprobar, rechazar, pagar)
  - `getProfessionalCommissionSummary()` - Resumen completo por profesional
  - Cálculo automático de montos de comisión
  - Gestión de estados: pending, approved, paid, rejected
  - Validaciones de permisos y acceso
  - Integración multi-tenant

- **3 Endpoints API**
  - `POST /api/commissions` - Crear comisión (servicio o venta)
    - Validación de datos y permisos
    - Cálculo automático de comisión
    - Registro de metadata (tipo de fuente, referencias)
  
  - `GET /api/commissions` - Listar y filtrar comisiones
    - Filtros: profesional, sucursal, rango de fechas, estado
    - Paginación y ordenamiento
    - Estadísticas agregadas (totales, pendientes, pagadas, aprobadas)
    - Cálculo de resúmenes por estado
  
  - `GET /api/commissions/[id]` - Detalle de comisión
    - Información completa de la comisión
    - Datos relacionados (profesional, sucursal)
    - Historial de estados
  
  - `PUT /api/commissions/[id]` - Actualizar comisión
    - Aprobar comisión pendiente
    - Rechazar comisión con razón
    - Marcar como pagada con fecha
    - Validaciones de transiciones de estado
    - Control de permisos por rol
  
  - `GET /api/commissions/professional/[id]` - Resumen por profesional
    - Total de comisiones (todas, pendientes, aprobadas, pagadas)
    - Comisiones este mes y totales
    - Lista de comisiones recientes
    - Desglose por tipo (servicio vs venta)
    - Estadísticas de desempeño

#### Frontend (Componentes y Páginas)

- **CommissionDashboard Component** (380 líneas)
  - Dashboard principal de gestión de comisiones
  - Filtros avanzados:
    - Por profesional (dropdown con búsqueda)
    - Por sucursal
    - Por estado (pending, approved, paid, rejected)
    - Rango de fechas personalizado
  - Estadísticas en tiempo real:
    - Total de comisiones
    - Pendientes de aprobación
    - Pagadas
    - Aprobadas no pagadas
  - Tabla interactiva de comisiones:
    - Columnas: profesional, monto, tipo, estado, fecha, sucursal
    - Badges de estado con colores
    - Acciones por estado:
      - Aprobar comisiones pendientes
      - Rechazar con razón
      - Marcar como pagada
  - UI moderna con Tailwind CSS y Lucide Icons
  - Responsive design para móvil y desktop

- **ProfessionalCommissionDetail Component** (273 líneas)
  - Vista detallada de comisiones por profesional
  - Métricas principales:
    - Total de comisiones
    - Comisiones este mes
    - Pendientes, aprobadas, pagadas
  - Gráfico de tendencias:
    - Visualización mensual con Recharts
    - Comparación de comisiones pagadas vs pendientes
    - Colores diferenciados por estado
  - Lista completa de comisiones:
    - Orden cronológico (más recientes primero)
    - Detalles por comisión (tipo, monto, estado, fecha)
    - Badges de estado visual
  - Desglose por tipo:
    - Comisiones por servicios
    - Comisiones por ventas
    - Subtotales y porcentajes

- **2 Páginas Next.js**
  - `/dashboard/commissions` - Dashboard principal
    - Gestión centralizada de todas las comisiones
    - Acceso completo para administradores
    - Filtros y acciones masivas
  
  - `/dashboard/commissions/[id]` - Detalle por profesional
    - Vista enfocada en un profesional específico
    - Métricas individuales y tendencias
    - Historial completo de comisiones

#### Tipos TypeScript

- **Commission Interface**
  - `id`, `professionalId`, `branchId`, `tenantId`
  - `amount` - Monto de la comisión
  - `type` - Tipo: 'service' | 'sale'
  - `status` - Estado: 'pending' | 'approved' | 'paid' | 'rejected'
  - `source` - Fuente (appointmentId o saleId)
  - `metadata` - Información adicional (servicio, cliente, etc.)
  - `approvedAt`, `paidAt`, `rejectedAt`, `rejectionReason`
  - `createdAt`, `updatedAt`

- **CommissionStatus Enum**
  - `PENDING` - Pendiente de aprobación
  - `APPROVED` - Aprobada, no pagada
  - `PAID` - Pagada al profesional
  - `REJECTED` - Rechazada

- **CommissionType Enum**
  - `SERVICE` - Comisión por servicio/cita
  - `SALE` - Comisión por venta de producto

- **CommissionSummary Interface**
  - Resumen agregado por profesional
  - Totales por estado
  - Desglose mensual
  - Estadísticas de desempeño

#### Funcionalidades Clave

1. **Gestión Completa de Comisiones**
   - Crear comisiones automáticamente desde servicios y ventas
   - Aprobar comisiones pendientes
   - Rechazar con razón específica
   - Marcar como pagadas con fecha
   - Transiciones de estado validadas

2. **Filtros y Búsqueda Avanzada**
   - Filtrar por profesional
   - Filtrar por sucursal
   - Filtrar por estado
   - Filtrar por rango de fechas
   - Combinar múltiples filtros

3. **Estadísticas en Tiempo Real**
   - Total de comisiones
   - Pendientes de aprobación
   - Aprobadas no pagadas
   - Pagadas en el mes
   - Desglose por tipo

4. **Visualizaciones y Reportes**
   - Gráficos de tendencias mensuales
   - Distribución por estado
   - Comparativas de desempeño
   - Rankings de profesionales
   - Desglose por tipo de comisión

5. **Integración con Módulos Existentes**
   - Servicios y citas (comisiones por servicio)
   - Ventas y POS (comisiones por venta)
   - Profesionales (resumen por profesional)
   - Sucursales (filtrado por ubicación)
   - Sistema multi-tenant

6. **Seguridad y Validaciones**
   - Control de acceso por rol
   - Validación de permisos
   - Validación de transiciones de estado
   - Aislamiento por tenant
   - Auditoría de cambios

#### Integración

- Compatible con módulo de servicios (v1.0+)
- Compatible con módulo de ventas/POS (v1.2+)
- Compatible con sistema de profesionales (v1.5+)
- Compatible con asignaciones multi-sucursal (v1.6+)
- Integrado con sistema de reportes (v1.7+)

#### Métricas del Módulo

- **Archivos creados:** 8
  - 3 endpoints API (582 líneas)
  - 2 componentes React (653 líneas)
  - 2 páginas Next.js (52 líneas)
  - 1 archivo de tipos (37 líneas)
- **Total líneas de código:** 1,124
- **Breaking changes:** Ninguno
- **Migraciones:** No requeridas
- **Merge SHA:** `6d294849ee0b46fcba96f4a47e30f92e55d1dc81`

#### PR #108

- **Título:** Módulo completo de gestión de comisiones v1.8.3
- **Estado:** ✅ Merged
- **Tag:** v1.8.3
- **Deploy:** Automático en Easypanel
- **Documentación:** PR_108_COMMISSIONS_MODULE.md

     6	     5       4  All notable changes to CitaPlanner will be documented in this file.
     7	     6       5  
     8	
     9	## [1.8.2] - 2025-10-15
    10	
    11	### Fixed - Ruta Working Hours
    12	
    13	#### Dashboard de Horarios
    14	- **PR #105:** Crear ruta `/dashboard/working-hours` y endpoint `/api/professionals`
    15	  - **Problema:** Link en navegación apuntaba a ruta inexistente
    16	  - **Endpoint:** `GET /api/professionals` para listar todos los profesionales
    17	    - Filtros: por sucursal, incluir inactivos
    18	    - Datos completos: perfil, sucursales, horarios, citas
    19	    - Compatible con código existente (calendar, modals)
    20	  - **Página:** Vista centralizada de horarios
    21	    - Estadísticas: total, con horarios, sin configurar, activos
    22	    - Filtros: búsqueda, sucursal, mostrar inactivos
    23	    - Tarjetas con avatar, contacto, sucursales, citas
    24	    - Estado visual de horarios configurados
    25	    - Botón para gestionar horario individual
    26	  - Integración con sistema de horarios (Fase 1)
    27	  - Integración con asignaciones (Fase 2)
    28	  - UI moderna con Tailwind CSS y Lucide Icons
    29	  - Merge SHA: `880d520e0522a48f3c3122615bad11a2cf293434`
    30	
    31	#### Métricas del Fix
    32	- Archivos creados: 2
    33	- Líneas de código: 539
    34	- Breaking changes: Ninguno
    35	- Migraciones: No requeridas
    36	     7       6  The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
    37	     8       7  and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
    38	     9  ## [1.8.1] - 2025-10-15
    39	    10  
    40	    11  ### Fixed - Hotfix Crítico
    41	    12  
    42	    13  #### API de Notificaciones
    43	    14  - **PR #104:** Corregir campo `scheduledAt` inexistente en modelo Appointment
    44	    15    - Reemplazar `scheduledAt` con `startTime` en `notificationService.ts`
    45	    16    - Fix error crítico: Invalid `prisma.notificationLog.findMany()` invocation
    46	    17    - Endpoint afectado: `/api/notifications/logs`
    47	    18    - Causa: El modelo Appointment usa `startTime`/`endTime`, no `scheduledAt`
    48	    19    - Impacto: API de logs de notificaciones restaurada
    49	    20    - Severidad: 🔴 Crítica
    50	    21    - Merge SHA: `dfd9706ea7334e8dc9d0fb2f53ee25b967d72344`
    51	    22  
    52	    23  #### Métricas del Fix
    53	    24  - Archivos modificados: 1
    54	    25  - Líneas modificadas: 1
    55	    26  - Tiempo de resolución: ~13 minutos
    56	    27  - Breaking changes: Ninguno
    57	    28  
    58	    29       8  
    59	    30       9  ## [1.8.0] - 2025-10-14
    60	    31      10  
    61	    32      11  ### Added - Fase 4: Vista de Calendario por Profesional
    62	    33      12  
    63	    34      13  #### Dependencias
    64	    35      14  - **react-big-calendar** - Librería de calendario interactivo
    65	    36      15  - **date-fns** - Manejo de fechas y localización
    66	    37      16  - **@types/react-big-calendar** - Tipos TypeScript
    67	    38      17  
    68	    39      18  #### Backend
    69	    40      19  
    70	    41      20  - **CalendarManager Service** (600+ líneas)
    71	    42      21    - `getCalendarEvents()` - Obtener eventos con filtros avanzados
    72	    43      22    - `getProfessionalAvailability()` - Calcular disponibilidad completa
    73	    44      23    - `validateAvailability()` - Validar antes de crear/mover citas
    74	    45      24    - `getCalendarStatistics()` - Estadísticas del calendario
    75	    46      25    - `getAvailableSlots()` - Slots disponibles para agendar
    76	    47      26    - `validateCalendarAccess()` - Validación de permisos por rol
    77	    48      27    - Integración con `scheduleManager` (Fase 1)
    78	    49      28    - Integración con `branchAssignments` (Fase 2)
    79	    50      29    - Manejo de horarios override por sucursal
    80	    51      30    - Procesamiento de excepciones (vacaciones, bajas)
    81	    52      31  
    82	    53      32  #### API Endpoints
    83	    54      33  - `GET /api/calendar/professional/[id]` - Eventos del calendario con filtros
    84	    55      34  - `GET /api/calendar/availability/[professionalId]` - Disponibilidad y horarios
    85	    56      35  - `GET /api/calendar/availability/[professionalId]/slots` - Slots disponibles
    86	    57      36  - `POST /api/calendar/availability/validate` - Validar disponibilidad
    87	    58      37  - `POST /api/calendar/appointments` - Crear cita desde calendario
    88	    59      38  - `PATCH /api/calendar/appointments/[id]/reschedule` - Reprogramar cita (drag & drop)
    89	    60      39  - `GET /api/calendar/statistics/[professionalId]` - Estadísticas del calendario
    90	    61      40  - `GET /api/professionals/me` - Datos del profesional autenticado
    91	    62      41  
    92	    63      42  #### Tipos TypeScript (400+ líneas)
    93	    64      43  - `CalendarEvent` - Evento del calendario con metadata completa
    94	    65      44  - `CalendarEventResource` - Datos de la cita (cliente, servicio, estado)
    95	    66      45  - `AvailabilityBlock` - Bloques de disponibilidad (regular/exception/override)
    96	    67      46  - `ProfessionalAvailability` - Disponibilidad completa de profesional
    97	    68      47  - `CalendarFilters` - Filtros avanzados del calendario
    98	    69      48  - `CalendarView` - Vistas del calendario (month/week/day/agenda)
    99	    70      49  - `CalendarStatistics` - Estadísticas y métricas del calendario
   100	    71      50  - Helpers: `createCalendarEventFromAppointment()`, `getStatusColor()`, `getDateRangeForView()`
   101	    72      51  
   102	    73      52  #### Frontend Components
   103	    74      53  
   104	    75      54  - **ProfessionalCalendar** (300+ líneas)
   105	    76      55    - Integración completa con react-big-calendar
   106	    77      56    - Vistas: mensual, semanal, diaria, agenda
   107	    78      57    - Drag & drop para reprogramar citas
   108	    79      58    - Resize de eventos
   109	    80      59    - Estilos personalizados por estado
   110	    81      60    - Visualización de disponibilidad
   111	    82      61    - Localización en español
   112	    83      62    - Responsive design
   113	    84      63  
   114	    85      64  - **CalendarFilters** (150+ líneas)
   115	    86      65    - Selector de vista (mes/semana/día/agenda)
   116	    87      66    - Filtro por profesional (admin/gerente)
   117	    88      67    - Filtro por sucursal
   118	    89      68    - Filtro por estado de cita
   119	    90      69    - Filtro por servicio
   120	    91      70    - Aplicación en tiempo real
   121	    92      71  
   122	    93      72  - **CalendarLegend** (100+ líneas)
   123	    94      73    - Leyenda de colores por estado
   124	    95      74    - Indicadores de disponibilidad
   125	    96      75    - Diseño compacto y claro
   126	    97      76  
   127	    98      77  - **AppointmentModal** (350+ líneas)
   128	    99      78    - Tres modos: crear, editar, ver
   129	   100      79    - Formulario completo con validaciones
   130	   101      80    - Auto-cálculo de endTime según servicio
   131	   102      81    - Botón de cancelar cita
   132	   103      82    - Manejo de errores inline
   133	   104      83    - Estados visuales
   134	   105      84  
   135	   106      85  #### Páginas
   136	   107      86  - `/dashboard/calendar/page.tsx` - Página principal del calendario (500+ líneas)
   137	   108      87    - Estado completo del calendario
   138	   109      88    - Gestión de eventos y disponibilidad
   139	   110      89    - Integración con API endpoints
   140	   111      90    - Manejo de drag & drop
   141	   112      91    - Sistema de filtros
   142	   113      92    - Modal de citas
   143	   114      93    - Permisos por rol
   144	   115      94    - Loading states
   145	   116      95    - Error handling
   146	   117      96  
   147	   118      97  #### Funcionalidades Implementadas
   148	   119      98  
   149	   120      99  ##### Vistas del Calendario
   150	   121     100  - ✅ Vista mensual - Resumen del mes completo
   151	   122     101  - ✅ Vista semanal - 7 días con slots de tiempo
   152	   123     102  - ✅ Vista diaria - Día detallado con todos los slots
   153	   124     103  - ✅ Vista agenda - Lista cronológica de citas
   154	   125     104  
   155	   126     105  ##### Gestión de Citas
   156	   127     106  - ✅ **Crear citas** - Click en slot disponible → Modal → Crear
   157	   128     107  - ✅ **Editar citas** - Click en evento → Modal → Editar
   158	   129     108  - ✅ **Cancelar citas** - Botón en modal con confirmación
   159	   130     109  - ✅ **Reprogramar (Drag & Drop)** - Arrastrar evento → Validar → Guardar
   160	   131     110  - ✅ **Resize de eventos** - Ajustar duración visualmente
   161	   132     111  
   162	   133     112  ##### Validaciones Automáticas
   163	   134     113  - ✅ Horario dentro de disponibilidad
   164	   135     114  - ✅ Sin solapamientos con otras citas
   165	   136     115  - ✅ Respeto a excepciones (vacaciones, bajas)
   166	   137     116  - ✅ Duración correcta del servicio
   167	   138     117  - ✅ Permisos por rol
   168	   139     118  
   169	   140     119  ##### Visualización de Disponibilidad
   170	   141     120  - ✅ Bloques disponibles (fondo blanco, clickeable)
   171	   142     121  - ✅ Bloques no disponibles (fondo gris, bloqueado)
   172	   143     122  - ✅ Excepciones (vacaciones) diferenciadas
   173	   144     123  - ✅ Horarios override por sucursal
   174	   145     124  
   175	   146     125  ##### Filtros Avanzados
   176	   147     126  - ✅ Filtro por profesional (admin/gerente)
   177	   148     127  - ✅ Filtro por sucursal
   178	   149     128  - ✅ Filtro por estado (pendiente, confirmada, completada, etc.)
   179	   150     129  - ✅ Filtro por servicio
   180	   151     130  - ✅ Aplicación en tiempo real sin recargar
   181	   152     131  
   182	   153     132  ##### Permisos por Rol
   183	   154     133  - ✅ **Profesional**: Solo su propio calendario
   184	   155     134  - ✅ **Gerente**: Calendarios de profesionales de su(s) sucursal(es)
   185	   156     135  - ✅ **Admin/Super Admin**: Todos los calendarios
   186	   157     136  - ✅ **Cliente**: Sin acceso
   187	   158     137  
   188	   159     138  #### Integración con Fases Anteriores
   189	   160     139  
   190	   161     140  ##### Fase 1 (Horarios)
   191	   162     141  - ✅ Usa `scheduleManager.ts` para obtener horarios
   192	   163     142  - ✅ Respeta `ProfessionalSchedule` (dayOfWeek, startTime, endTime)
   193	   164     143  - ✅ Procesa `ScheduleException` para bloquear fechas
   194	   165     144  - ✅ Calcula disponibilidad basada en configuración
   195	   166     145  
   196	   167     146  ##### Fase 2 (Asignaciones)
   197	   168     147  - ✅ Considera `branchAssignments` con sucursal primaria
   198	   169     148  - ✅ Aplica `scheduleOverride` cuando está definido
   199	   170     149  - ✅ Filtra por sucursal en queries
   200	   171     150  - ✅ Valida permisos de gerente según sucursales
   201	   172     151  
   202	   173     152  ##### Fase 3 (Reportes)
   203	   174     153  - ✅ Estadísticas del calendario complementan reportes
   204	   175     154  - ✅ `CalendarStatistics` incluye métricas de utilización
   205	   176     155  - ✅ Datos alimentan dashboards de análisis
   206	   177     156  
   207	   178     157  #### Características Técnicas
   208	   179     158  - 🔒 Validaciones robustas en backend y frontend
   209	   180     159  - 🚀 Rendimiento optimizado con lazy loading
   210	   181     160  - 📱 Responsive design con TailwindCSS
   211	   182     161  - 🌐 Localización completa en español
   212	   183     162  - ♿ Accesibilidad con ARIA labels
   213	   184     163  - 🎨 UI/UX intuitiva y profesional
   214	   185     164  - 📊 Estadísticas de utilización
   215	   186     165  - 🔔 Toast notifications para feedback
   216	   187     166  - ⚡ Actualizaciones en tiempo real
   217	   188     167  
   218	   189     168  ### Documentation
   219	   190     169  - `FASE4_CALENDAR.md` - Documentación completa de la Fase 4 (50+ páginas)
   220	   191     170    - Arquitectura detallada
   221	   192     171    - API Endpoints con ejemplos
   222	   193     172    - Componentes Frontend
   223	   194     173    - Guías de uso para cada rol
   224	   195     174    - Testing manual checklist
   225	   196     175    - Integración con fases anteriores
   226	   197     176    - Próximos pasos
   227	   198     177  
   228	   199     178  ### Statistics
   229	   200     179  - 17 archivos nuevos/modificados
   230	   201     180  - ~3,000 líneas de código
   231	   202     181  - 4 componentes React principales
   232	   203     182  - 8 endpoints API
   233	   204     183  - 30+ tipos TypeScript
   234	   205     184  - 10+ métodos de servicio
   235	   206     185  - Sin breaking changes
   236	   207     186  - 100% compatible con fases anteriores
   237	   208     187  
   238	   209     188  ### Breaking Changes
   239	   210     189  - ❌ **Ninguno** - Completamente compatible con v1.7.0
   240	   211     190  
   241	   212     191  ### Notes
   242	   213     192  - Sistema de calendario completamente funcional
   243	   214     193  - Drag & drop con validaciones en tiempo real
   244	   215     194  - Integración perfecta con horarios y asignaciones
   245	   216     195  - Permisos estrictos según rol
   246	   217     196  - Código limpio, comentado y mantenible
   247	   218     197  - Listo para producción
   248	   219     198  
   249	   220     199  ## [1.7.0] - 2025-10-14
   250	   221     200  
   251	   222     201  ### Added - Fase 3: Sistema de Reportes
   252	   223     202  
   253	   224     203  #### Backend
   254	   225     204  - **ReportManager Service** (800+ líneas)
   255	   226     205    - Generación de reportes por profesional, sucursal y general
   256	   227     206    - Cálculo de métricas: citas, ingresos, tiempo, clientes
   257	   228     207    - Tendencias y análisis temporal
   258	   229     208    - Soporte para múltiples períodos (día, semana, mes, año, custom)
   259	   230     209    - Reportes comparativos entre profesionales o sucursales
   260	   231     210  
   261	   232     211  #### API Endpoints
   262	   233     212  - `GET /api/reports/professional/[id]` - Reporte de profesional
   263	   234     213  - `GET /api/reports/branch/[id]` - Reporte de sucursal
   264	   235     214  - `GET /api/reports/overview` - Reporte general del negocio
   265	   236     215  - `GET /api/reports/comparison` - Reportes comparativos
   266	   237     216  
   267	   238     217  #### Frontend Components
   268	   239     218  - **ReportDashboard** (400+ líneas)
   269	   240     219    - Dashboard general con métricas consolidadas
   270	   241     220    - Gráficos de tendencias (líneas)
   271	   242     221    - Top 10 profesionales, sucursales y servicios
   272	   243     222    - Filtros de período y rango de fechas
   273	   244     223    
   274	   245     224  - **ProfessionalReportView** (450+ líneas)
   275	   246     225    - Vista detallada de profesional
   276	   247     226    - Métricas individuales
   277	   248     227    - Desempeño por sucursal
   278	   249     228    - Servicios más realizados
   279	   250     229    - Gráficos de pastel y barras
   280	   251     230    
   281	   252     231  - **BranchReportView** (450+ líneas)
   282	   253     232    - Vista detallada de sucursal
   283	   254     233    - Métricas de sucursal
   284	   255     234    - Desempeño de profesionales
   285	   256     235    - Servicios más solicitados
   286	   257     236    - Análisis de utilización
   287	   258     237  
   288	   259     238  #### Páginas
   289	   260     239  - `/dashboard/reports` - Dashboard principal de reportes
   290	   261     240  - `/dashboard/reports/professional/[id]` - Reporte de profesional
   291	   262     241  - `/dashboard/reports/branch/[id]` - Reporte de sucursal
   292	   263     242  
   293	   264     243  #### Tipos TypeScript
   294	   265     244  - Tipos completos para reportes (350+ líneas)
   295	   266     245  - Interfaces para métricas y filtros
   296	   267     246  - Enums para períodos y estados
   297	   268     247  
   298	   269     248  #### Visualizaciones
   299	   270     249  - Gráficos de línea (tendencias)
   300	   271     250  - Gráficos de barras (comparativas)
   301	   272     251  - Gráficos de pastel (distribuciones)
   302	   273     252  - Tarjetas de métricas clave
   303	   274     253  - Integración con Recharts
   304	   275     254  
   305	   276     255  #### Métricas Calculadas
   306	   277     256  - **Citas**: Total, completadas, canceladas, tasas
   307	   278     257  - **Ingresos**: Total, promedio, proyectado
   308	   279     258  - **Tiempo**: Horas trabajadas, utilización, horas pico
   309	   280     259  - **Clientes**: Total, nuevos, retención
   310	   281     260  
   311	   282     261  ### Documentation
   312	   283     262  - `FASE3_REPORTS.md` - Documentación completa de la Fase 3
   313	   284     263  - Casos de uso detallados
   314	   285     264  - Guías de integración
   315	   286     265  - Ejemplos de API
   316	   287     266  
   317	   288     267  ### Statistics
   318	   289     268  - 14 archivos nuevos
   319	   290     269  - ~3,500 líneas de código
   320	   291     270  - 3 componentes React principales
   321	   292     271  - 4 endpoints API
   322	   293     272  - 20+ tipos TypeScript
   323	   294     273  - 12+ métodos de servicio
   324	   295     274  
   325	   296     275  ## [1.6.0] - 2025-10-14
   326	   297     276  
   327	   298     277  ### Added - Fase 2: Sistema de Asignación Masiva
   328	   299     278  
   329	   300     279  #### Backend
   330	   301     280  - **BranchAssignment Model**
   331	   302     281    - Relación muchos-a-muchos entre profesionales y sucursales
   332	   303     282    - Gestión de sucursal primaria
   333	   304     283    - Estados activo/inactivo con soft delete
   334	   305     284    - Fechas de vigencia (inicio y fin)
   335	   306     285    - Campo para horarios específicos por sucursal
   336	   307     286    - Índices optimizados para consultas
   337	   308     287  
   338	   309     288  - **BranchAssignmentManager Service** (600+ líneas)
   339	   310     289    - `validateAssignment()` - Validación completa de asignaciones
   340	   311     290    - `createAssignment()` - Crear asignación individual
   341	   312     291    - `assignProfessionalsToBranch()` - Asignación masiva a sucursal
   342	   313     292    - `assignProfessionalToBranches()` - Asignar a múltiples sucursales
   343	   314     293    - `getBranchAssignments()` - Listar por sucursal
   344	   315     294    - `getProfessionalAssignments()` - Listar por profesional
   345	   316     295    - `updateAssignment()` - Actualizar asignación
   346	   317     296    - `deleteAssignment()` - Eliminar asignación
   347	   318     297    - `getAssignmentStats()` - Estadísticas
   348	   319     298    - `getAvailableProfessionals()` - Profesionales disponibles
   349	   320     299  
   350	   321     300  #### API Endpoints
   351	   322     301  - `POST /api/branches/[id]/assignments` - Asignación masiva
   352	   323     302  - `GET /api/branches/[id]/assignments` - Listar asignaciones
   353	   324     303  - `GET /api/branches/[id]/assignments/available` - Profesionales disponibles
   354	   325     304  - `PUT /api/branches/[id]/assignments/[assignmentId]` - Actualizar
   355	   326     305  - `DELETE /api/branches/[id]/assignments/[assignmentId]` - Eliminar
   356	   327     306  - `POST /api/professionals/[id]/assignments` - Asignar a múltiples sucursales
   357	   328     307  - `GET /api/professionals/[id]/assignments` - Listar por profesional
   358	   329     308  - `GET /api/assignments/stats` - Estadísticas generales
   359	   330     309  
   360	   331     310  #### Frontend Components
   361	   332     311  - **BranchAssignmentManager** (500+ líneas)
   362	   333     312    - Vista desde sucursal
   363	   334     313    - Modal de asignación masiva
   364	   335     314    - Selección múltiple con checkbox
   365	   336     315    - Opciones de asignación (primaria, fechas, notas)
   366	   337     316    - Lista de profesionales asignados
   367	   338     317    - Acciones inline (toggle estado, primaria, eliminar)
   368	   339     318  
   369	   340     319  - **ProfessionalBranchesManager** (350+ líneas)
   370	   341     320    - Vista desde profesional
   371	   342     321    - Grid de tarjetas de sucursales
   372	   343     322    - Indicador visual de sucursal primaria
   373	   344     323    - Gestión de asignaciones
   374	   345     324    - Resumen con estadísticas
   375	   346     325  
   376	   347     326  #### Pages
   377	   348     327  - `/dashboard/branches/[id]/assignments` - Gestión por sucursal
   378	   349     328  - `/dashboard/professionals/[id]/branches` - Gestión por profesional
   379	   350     329  
   380	   351     330  #### Database Migration
   381	   352     331  - `20251014_add_branch_assignments` - Tabla BranchAssignment con índices
   382	   353     332  
   383	   354     333  ### Documentation
   384	   355     334  - `FASE2_MASS_ASSIGNMENT.md` - Documentación completa de la Fase 2
   385	   356     335  - Casos de uso detallados
   386	   357     336  - Guías de integración
   387	   358     337  
   388	   359     338  ### Statistics
   389	   360     339  - 13 archivos nuevos
   390	   361     340  - ~2,500 líneas de código
   391	   362     341  - 2 componentes React principales
   392	   363     342  - 5 endpoints API principales
   393	   364     343  - 10+ tipos TypeScript
   394	   365     344  - 12+ métodos de servicio
   395	   366     345  
   396	   367     346  ## [1.5.0] - 2025-10-13
   397	   368     347  
   398	   369     348  ### Added - Fase 1: Sistema de Horarios
   399	   370     349  
   400	   371     350  #### Backend
   401	   372     351  - **ScheduleManager Service** (500+ líneas)
   402	   373     352    - Gestión completa de horarios de profesionales
   403	   374     353    - Validación de horarios y disponibilidad
   404	   375     354    - Cálculo de slots disponibles
   405	   376     355    - Manejo de días festivos y excepciones
   406	   377     356    - Soporte para horarios especiales
   407	   378     357  
   408	   379     358  #### API Endpoints
   409	   380     359  - `GET /api/professionals/[id]/schedule` - Obtener horario
   410	   381     360  - `PUT /api/professionals/[id]/schedule` - Actualizar horario
   411	   382     361  - `GET /api/professionals/[id]/availability` - Verificar disponibilidad
   412	   383     362  - `POST /api/professionals/[id]/schedule/exceptions` - Agregar excepciones
   413	   384     363  
   414	   385     364  #### Frontend Components
   415	   386     365  - **ScheduleEditor** (400+ líneas)
   416	   387     366    - Editor visual de horarios
   417	   388     367    - Configuración por día de la semana
   418	   389     368    - Gestión de bloques de tiempo
   419	   390     369    - Validación en tiempo real
   420	   391     370  
   421	   392     371  #### Types
   422	   393     372  - Tipos TypeScript completos para horarios
   423	   394     373  - Interfaces para configuración y validación
   424	   395     374  
   425	   396     375  ### Documentation
   426	   397     376  - `FASE1_SCHEDULES.md` - Documentación de horarios
   427	   398     377  
   428	   399     378  ## [1.4.0] - 2025-10-06
   429	   400     379  
   430	   401     380  ### Fixed - Errores Críticos en Producción
   431	   402     381  
   432	   403     382  #### NotificationLog Error
   433	   404     383  - Eliminado campo inexistente `recipient` de consultas Prisma
   434	   405     384  - Mejorado logging en notificationService.ts
   435	   406     385  - Agregado manejo de errores robusto
   436	   407     386  
   437	   408     387  #### Client Service Error
   438	   409     388  - Agregado logging detallado en clientService.ts
   439	   410     389  - Mejorados mensajes de error para usuarios
   440	   411     390  - Agregado rastreo de sesión y tenants disponibles
   441	   412     391  - Implementado debugging para "Tenant not found"
   442	   413     392  
   443	   414     393  ### Documentation
   444	   415     394  - `PR_92_MERGE_SUMMARY.md` - Resumen del merge
   445	   416     395  - `MERGE_PR92_VISUAL.md` - Documentación visual
   446	   417     396  
   447	   418     397  ## [1.3.0] - 2025-10-05
   448	   419     398  
   449	   420     399  ### Added - Checkpoint Estable
   450	   421     400  - Checkpoint v1.3.0 creado como punto de referencia estable
   451	   422     401  - Sistema completamente funcional con todos los módulos core
   452	   423     402  - Documentación completa actualizada
   453	   424     403  
   454	   425     404  ### Fixed
   455	   426     405  - Estandarización de respuestas API
   456	   427     406  - Corrección de errores de integración frontend-backend
   457	   428     407  - Mejoras en manejo de errores
   458	   429     408  
   459	   430     409  ## [1.2.0] - 2025-10-04
   460	   431     410  
   461	   432     411  ### Added - Internacionalización
   462	   433     412  - Soporte completo para español
   463	   434     413  - Traducción de toda la interfaz
   464	   435     414  - Mensajes de error en español
   465	   436     415  - Documentación en español
   466	   437     416  
   467	   438     417  ## [1.1.0] - 2025-10-03
   468	   439     418  
   469	   440     419  ### Added - Módulo de Ventas/POS/Inventario
   470	   441     420  - Sistema completo de punto de venta
   471	   442     421  - Gestión de inventario
   472	   443     422  - Reportes de ventas
   473	   444     423  - Integración con sistema de citas
   474	   445     424  
   475	   446     425  ## [1.0.0] - 2025-10-02
   476	   447     426  
   477	   448     427  ### Added - CRM de Clientes
   478	   449     428  - Gestión completa de clientes
   479	   450     429  - Historial de citas
   480	   451     430  - Notas y seguimiento
   481	   452     431  - Integración con sistema de notificaciones
   482	   453     432  
   483	   454     433  ## [0.9.0] - 2025-10-01
   484	   455     434  
   485	   456     435  ### Added - Sistema de Notificaciones
   486	   457     436  - Notificaciones por email
   487	   458     437  - Notificaciones por SMS
   488	   459     438  - Notificaciones push
   489	   460     439  - Configuración de servicios (Twilio, SendGrid)
   490	   461     440  
   491	   462     441  ## [0.8.0] - 2025-09-30
   492	   463     442  
   493	   464     443  ### Added - Configuración Inicial
   494	   465     444  - Estructura base del proyecto
   495	   466     445  - Configuración de Next.js
   496	   467     446  - Configuración de Prisma
   497	   468     447  - Configuración de Docker
   498	   469     448  - Configuración de Easypanel
   499	   470     449  
   500	   471     450  ---
   501	   472     451  
   502	   473     452  **Nota**: Este changelog se mantiene actualizado con cada release. Para más detalles sobre cada versión, consulta la documentación específica en la carpeta `docs/`.
   503	   474     453  