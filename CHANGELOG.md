Here's the result of running `cat -n` on /home/ubuntu/github_repos/citaplanner/CHANGELOG.md:

## [1.8.8] - 2025-10-15

### Added - Sprint 1 Fase 5: Endpoint API /api/dashboard/metrics para métricas del dashboard

#### Funcionalidades Implementadas
- **GET /api/dashboard/metrics:** Obtener métricas en tiempo real del negocio
  - **Métricas de Citas:** Total, completadas, pendientes, canceladas (en rango de fechas)
  - **Métricas de Ingresos:** Hoy, esta semana, este mes (solo pagos PAID)
  - **Métricas de Clientes:** Nuevos este mes, total activos
  - **Métricas de Profesionales:** Total activos (roles PROFESSIONAL y ADMIN)
  - **Métricas Calculadas:** Precio promedio de servicios, tasa de completado (%)
  - **Filtros Opcionales:**
    - branchId: Filtrar por sucursal específica
    - startDate: Fecha inicio (formato ISO, default: inicio del día)
    - endDate: Fecha fin (formato ISO, default: fin del día)
  - **Respuesta Estandarizada:** success, data, meta (con branchId, fechas, generatedAt)

#### Optimizaciones Implementadas
- ✅ **Queries Paralelos:** Promise.all con 12 queries en paralelo
- ✅ **Agregaciones de Prisma:** _count, _sum, _avg para cálculos en DB
- ✅ **Cálculo de Fechas:** Una sola vez (día, semana, mes)
- ✅ **Índices Aprovechados:** Appointment, Payment, Client, User, Service
- ✅ **Performance:** ~100-200ms tiempo de respuesta

#### Seguridad y Validaciones
- ✅ Autenticación requerida con NextAuth
- ✅ Multi-tenancy: Filtrado automático por tenantId
- ✅ Validación de branchId (existencia y pertenencia al tenant)
- ✅ Validación de formato de fechas (ISO)
- ✅ Validación de rango de fechas (endDate >= startDate)
- ✅ Manejo robusto de errores (400, 401, 500)

#### Documentación
- 📄 SPRINT1_FASE5_DASHBOARD_METRICS.md
  - Documentación completa del endpoint
  - Estructura de respuestas y errores
  - Ejemplos de uso (sin filtros, con branchId, con fechas)
  - Guía de integración con frontend
  - Métricas incluidas y cálculos
  - Optimizaciones y notas técnicas
  - Siguientes pasos (Fase 6)

#### Impacto
- ✅ Dashboard con datos reales (reemplaza datos mock de Fase 1)
- ✅ Visibilidad en tiempo real de métricas clave
- ✅ Análisis por sucursal para identificar rendimiento
- ✅ Control de ingresos diarios, semanales, mensuales
- ✅ Toma de decisiones basada en datos reales

#### Archivos Creados
- app/api/dashboard/metrics/route.ts (320 líneas)
- SPRINT1_FASE5_DASHBOARD_METRICS.md (634 líneas)

#### Compatibilidad
- ✅ No requiere migraciones de base de datos
- ✅ Sin breaking changes
- ✅ Compatible con todos los endpoints existentes

#### Estado del Sprint 1
- ✅ Fase 1: Página principal del dashboard (#109, v1.8.4)
- ✅ Fase 2: Redirección appointments → calendar (#110, v1.8.5)
- ✅ Fase 3: API /api/services (CRUD completo) (#111, v1.8.6)
- ✅ Fase 4: API /api/branches (listado con stats) (#112, v1.8.7)
- ✅ Fase 5: API /api/dashboard/metrics (métricas reales) (#113, v1.8.8)
- 📋 Fase 6: Integración frontend con métricas reales (pendiente)

     1	Here's the result of running `cat -n` on /home/ubuntu/github_repos/citaplanner/CHANGELOG.md:
     2	     1  # Changelog
     3	## [1.8.7] - 2025-10-15
     4	
     5	### Added - Sprint 1 Fase 4: Endpoint API /api/branches para gestión de sucursales
     6	
     7	#### Funcionalidades Implementadas
     8	- **GET /api/branches:** Listar sucursales con filtros y estadísticas
     9	  - Filtros: isActive (boolean)
    10	  - Búsqueda: nombre, dirección, teléfono (case-insensitive)
    11	  - Paginación: limit (default: 50, max: 100), offset
    12	  - Estadísticas agregadas: total activas/inactivas
    13	  - Conteos de relaciones: users, appointments, payments, professionalAssignments
    14	  - Ordenamiento: por nombre (asc)
    15	  - Include: _count para todas las relaciones
    16	- **GET /api/branches/[id]:** Obtener sucursal específica con estadísticas detalladas
    17	  - Información completa de la sucursal
    18	  - Estadísticas de usuarios asignados
    19	  - Estadísticas de profesionales asignados (integración Fase 2)
    20	  - Estadísticas de citas: hoy, este mes, total, completadas, canceladas
    21	  - Estadísticas de ingresos: este mes, total (con conteos)
    22	  - Próximas 5 citas programadas (SCHEDULED/CONFIRMED)
    23	  - Top 10 profesionales asignados (ordenados por isPrimary)
    24	  - Filtrado multi-tenant
    25	
    26	#### Seguridad Implementada
    27	- ✅ Autenticación requerida con NextAuth en todos los endpoints
    28	- ✅ Multi-tenancy: Filtrado automático por tenantId
    29	- ✅ Validación de parámetros de entrada (tipos, rangos)
    30	- ✅ Protección contra SQL injection (Prisma ORM)
    31	- ✅ Manejo robusto de errores (400, 401, 404, 500)
    32	
    33	#### Validaciones Implementadas
    34	**GET /api/branches:**
    35	- isActive: debe ser "true" o "false" (string)
    36	- limit: número positivo, máximo 100
    37	- offset: número no negativo
    38	- search: trim automático, búsqueda en múltiples campos
    39	
    40	**GET /api/branches/[id]:**
    41	- id: debe existir en base de datos
    42	- tenantId: validación de pertenencia al tenant
    43	- Retorna 404 si no existe o no pertenece al tenant
    44	
    45	#### Optimizaciones
    46	- ✅ Select específicos para evitar carga innecesaria de datos
    47	- ✅ Uso de índices existentes (tenantId, isActive)
    48	- ✅ Conteos eficientes con Prisma _count
    49	- ✅ GroupBy para estadísticas agregadas
    50	- ✅ Queries paralelos con Promise.all (estadísticas detalladas)
    51	- ✅ Paginación para grandes volúmenes de datos
    52	
    53	#### Casos de Uso
    54	- Dashboard principal: selector de sucursales
    55	- Filtros de selección en citas y ventas
    56	- Reportes y análisis por sucursal
    57	- Gestión administrativa de sucursales
    58	- Vista de disponibilidad por ubicación
    59	- Análisis de rendimiento por sucursal
    60	
    61	#### Integración
    62	- ✅ Compatible con estructura existente de APIs
    63	- ✅ Mismo patrón que /api/services (consistencia)
    64	- ✅ Respuestas estandarizadas
    65	- ✅ Integración con Fase 2 (BranchAssignment)
    66	- ✅ Sin cambios en schema de Prisma
    67	- ✅ Sin migraciones de base de datos
    68	
    69	#### Archivos Creados
    70	- app/api/branches/route.ts - Listado con filtros
    71	- app/api/branches/[id]/route.ts - Detalle con estadísticas
    72	
    73	#### Documentación
    74	- SPRINT1_FASE4_API_BRANCHES.md - Documentación completa
    75	- PR #112 - Pull Request con descripción detallada
    76	
    77	     2  
    78	     3  ## [1.8.6] - 2025-10-15
    79	     4  
    80	     5  ### Added - Sprint 1 Fase 3: Endpoint API /api/services con CRUD completo
    81	     6  
    82	     7  #### Funcionalidades Implementadas
    83	     8  - **GET /api/services:** Listar servicios con filtros avanzados
    84	     9    - Filtros: isActive, category, search
    85	    10    - Paginación: limit, offset
    86	    11    - Include: category, serviceUsers (con user)
    87	    12  - **POST /api/services:** Crear nuevo servicio
    88	    13    - Validaciones completas de negocio
    89	    14    - Verificación de nombre único por tenant
    90	    15    - Validación de categoryId opcional
    91	    16  - **GET /api/services/[id]:** Obtener servicio específico
    92	    17    - Include: category, serviceUsers, appointments (próximos 5)
    93	    18    - Filtrado multi-tenant
    94	    19  - **PUT /api/services/[id]:** Actualizar servicio
    95	    20    - Actualización parcial (solo campos proporcionados)
    96	    21    - Validaciones de negocio completas
    97	    22    - Control de permisos: ADMIN, SUPER_ADMIN, MANAGER
    98	    23  - **DELETE /api/services/[id]:** Soft delete de servicio
    99	    24    - Verifica citas futuras antes de desactivar
   100	    25    - Control de permisos: ADMIN, SUPER_ADMIN, MANAGER
   101	    26    - Preserva integridad referencial
   102	    27  
   103	    28  #### Seguridad Implementada
   104	    29  - ✅ Autenticación requerida con NextAuth en todos los endpoints
   105	    30  - ✅ Multi-tenancy: Filtrado automático por tenantId
   106	    31  - ✅ Control de permisos por rol (PUT/DELETE: ADMIN, SUPER_ADMIN, MANAGER)
   107	    32  - ✅ Validación de datos: tipos, rangos, unicidad, integridad referencial
   108	    33  
   109	    34  #### Validaciones de Negocio
   110	    35  **Creación (POST):**
   111	    36  - Nombre: requerido, string válido, único por tenant (case-insensitive)
   112	    37  - Duración: requerida, entre 5 y 480 minutos (8 horas)
   113	    38  - Precio: requerido, entre 0 y 999999.99
   114	    39  - CategoryId: opcional, debe existir y pertenecer al tenant
   115	    40  
   116	    41  **Actualización (PUT):**
   117	    42  - Permisos: Solo ADMIN, SUPER_ADMIN, MANAGER
   118	    43  - Nombre: único por tenant si se cambia
   119	    44  - Validación de rangos en duración y precio
   120	    45  - Validación de categoryId si se proporciona
   121	    46  
   122	    47  **Eliminación (DELETE):**
   123	    48  - Permisos: Solo ADMIN, SUPER_ADMIN, MANAGER
   124	    49  - Soft delete: marca isActive=false
   125	    50  - Verifica que no haya citas futuras SCHEDULED/CONFIRMED
   126	    51  - Retorna error 400 con número de citas si hay citas futuras
   127	    52  
   128	    53  #### Características Técnicas
   129	    54  - **Autenticación:** NextAuth con getServerSession
   130	    55  - **ORM:** Prisma Client con queries optimizadas
   131	    56  - **Validaciones:** Runtime validation de tipos y rangos
   132	    57  - **Logging:** Console.error para debugging
   133	    58  - **Paginación:** Opcional con limit/offset
   134	    59  - **Búsqueda:** Case-insensitive en name y description
   135	    60  - **Soft Delete:** Preserva integridad referencial
   136	    61  - **Include Relations:** Category, serviceUsers, appointments
   137	    62  
   138	    63  #### Integración con el Sistema
   139	    64  - **CRM:** Asignación de servicios a citas de clientes
   140	    65  - **Calendario:** Duración de servicios determina duración de citas
   141	    66  - **POS/Ventas:** Servicios vendibles como productos
   142	    67  - **Profesionales:** Asignación de servicios mediante serviceUsers
   143	    68  - **Reportes:** Inclusión en reportes de ingresos y citas
   144	    69  
   145	    70  #### Archivos Creados
   146	    71  - `app/api/services/route.ts` - GET (listar), POST (crear)
   147	    72  - `app/api/services/[id]/route.ts` - GET (obtener), PUT (actualizar), DELETE (eliminar)
   148	    73  - `SPRINT1_FASE3_API_SERVICES.md` - Documentación completa con ejemplos
   149	    74  
   150	    75  #### Documentación
   151	    76  - Descripción detallada de cada endpoint
   152	    77  - Ejemplos de request/response
   153	    78  - Códigos de error y validaciones
   154	    79  - Casos de uso prácticos
   155	    80  - Guía de testing manual
   156	    81  - Notas técnicas y debugging
   157	    82  
   158	    83  #### Testing Verificado
   159	    84  - ✅ Compilación TypeScript sin errores
   160	    85  - ✅ Validación de estructura de archivos
   161	    86  - ✅ Verificación de importaciones
   162	    87  - ✅ Validación de lógica de negocio
   163	    88  - ✅ Revisión de seguridad multi-tenant
   164	    89  - ✅ Verificación de manejo de errores
   165	    90  
   166	    91  #### Deployment
   167	    92  - ✅ Sin cambios en schema de Prisma
   168	    93  - ✅ Sin migraciones de base de datos requeridas
   169	    94  - ✅ Compatible con despliegue automático en Easypanel
   170	    95  - ✅ No requiere configuración adicional
   171	    96  
   172	    97  #### PR y Release
   173	    98  - **PR:** #111 (mergeado con squash)
   174	    99  - **Tag:** v1.8.6
   175	   100  - **Branch:** feature/api-services-crud (eliminada post-merge)
   176	   101  - **Breaking Changes:** Ninguno
   177	   102  - **Requiere Migración:** No
   178	   103  
   179	   104  ---
   180	   105  
   181	   106       5       4       3       2       1  
   182	   107       6       5       4       3       2  # Changelog
   183	   108       7       6       5       4       3  
   184	   109       8  ## [1.8.5] - 2025-10-15
   185	   110       9  
   186	   111      10  ### Fixed - Sprint 1 Fase 2: Appointments Redirect
   187	   112      11  
   188	   113      12  #### Problema Resuelto
   189	   114      13  - Link roto en navegación: `/dashboard/appointments` retornaba 404
   190	   115      14  - Dashboard-nav.tsx tiene link "Agenda" apuntando a appointments
   191	   116      15  - Funcionalidad de agenda ya existe en `/dashboard/calendar`
   192	   117      16  
   193	   118      17  #### Solución Implementada
   194	   119      18  - **Nuevo archivo:** `app/dashboard/appointments/page.tsx`
   195	   120      19  - **Tipo de redirect:** Permanente (308) para SEO y cache del browser
   196	   121      20  - **Comportamiento:** Redirección instantánea a `/dashboard/calendar`
   197	   122      21  - **Compatibilidad:** Mantiene links existentes en dashboard-nav.tsx
   198	   123      22  - **Breaking changes:** Ninguno
   199	   124      23  
   200	   125      24  #### Detalles Técnicos
   201	   126      25  - Usa Next.js `redirect()` de 'next/navigation'
   202	   127      26  - Código minimalista y eficiente (18 líneas)
   203	   128      27  - Comentarios explicativos claros
   204	   129      28  - Sin lógica compleja ni dependencias adicionales
   205	   130      29  
   206	   131      30  #### Testing Verificado
   207	   132      31  - ✅ Redirect funciona correctamente
   208	   133      32  - ✅ No hay errores de TypeScript
   209	   134      33  - ✅ Redirect es instantáneo
   210	   135      34  - ✅ SEO-friendly (308 permanent redirect)
   211	   136      35  - ✅ Compatible con navegación existente
   212	   137      36  
   213	   138      37  #### Archivos Modificados
   214	   139      38  - **Nuevo:** `app/dashboard/appointments/page.tsx`
   215	   140      39  
   216	   141      40  #### PR y Release
   217	   142      41  - **PR:** #110 (mergeado con squash)
   218	   143      42  - **Tag:** v1.8.5
   219	   144      43  - **Branch:** feature/appointments-redirect (eliminada post-merge)
   220	   145      44  
   221	   146      45  ---
   222	   147      46  
   223	   148      47  ## [1.8.4] - 2025-10-15
   224	   149      48  
   225	   150      49  ### Added - Sprint 1 Fase 1: Dashboard Principal
   226	   151      50  
   227	   152      51  #### Nueva Página Principal del Dashboard
   228	   153      52  - **Archivo:** `app/dashboard/page.tsx` completamente rediseñada
   229	   154      53  - **Diseño:** UI moderna y profesional con componentes shadcn/ui
   230	   155      54  - **Funcionalidad:** Vista overview con métricas clave del negocio
   231	   156      55  
   232	   157      56  #### Features Implementadas
   233	   158      57  - Dashboard con 4 cards de métricas principales:
   234	   159      58    - Citas del día (con badge de porcentaje de cambio)
   235	   160      59    - Ingresos del mes (formato de moneda)
   236	   161      60    - Nuevos clientes (tracking de crecimiento)
   237	   162      61    - Tasa de ocupación (con indicador visual)
   238	   163      62  - Grid responsivo (1 columna en mobile, 2 en tablet, 4 en desktop)
   239	   164      63  - Cards con hover effects y animaciones suaves
   240	   165      64  - Iconos lucide-react integrados (Calendar, DollarSign, Users, TrendingUp)
   241	   166      65  - Colores y estilos consistentes con el brand de CitaPlanner
   242	   167      66  
   243	   168      67  #### Mejoras de UX
   244	   169      68  - Información clara y legible
   245	   170      69  - Visualización rápida del estado del negocio
   246	   171      70  - Acceso rápido a métricas clave
   247	   172      71  - Diseño profesional y moderno
   248	   173      72  
   249	   174      73  #### Testing
   250	   175      74  - ✅ Renderizado correcto en todos los tamaños de pantalla
   251	   176      75  - ✅ No hay errores de TypeScript
   252	   177      76  - ✅ Integración perfecta con layout existente
   253	   178      77  - ✅ Compatible con sistema de autenticación
   254	   179      78  
   255	   180      79  #### PR y Release
   256	   181      80  - **PR:** #109 (mergeado con squash)
   257	   182      81  - **Tag:** v1.8.4
   258	   183      82  - **Branch:** feature/dashboard-overview (eliminada post-merge)
   259	   184      83  
   260	   185      84  ---
   261	   186      85  
   262	   187      86       7  
   263	   188      87       8  ## [1.8.3] - 2025-10-15
   264	   189      88       9  
   265	   190      89      10  ### Added - Módulo de Gestión de Comisiones
   266	   191      90      11  
   267	   192      91      12  #### Backend (API Endpoints)
   268	   193      92      13  
   269	   194      93      14  - **CommissionManager Service** (580+ líneas)
   270	   195      94      15    - `createCommission()` - Crear nueva comisión (servicio o venta)
   271	   196      95      16    - `getCommissions()` - Listar comisiones con filtros avanzados
   272	   197      96      17    - `getCommissionById()` - Obtener detalle de comisión específica
   273	   198      97      18    - `updateCommission()` - Actualizar comisión (aprobar, rechazar, pagar)
   274	   199      98      19    - `getProfessionalCommissionSummary()` - Resumen completo por profesional
   275	   200      99      20    - Cálculo automático de montos de comisión
   276	   201     100      21    - Gestión de estados: pending, approved, paid, rejected
   277	   202     101      22    - Validaciones de permisos y acceso
   278	   203     102      23    - Integración multi-tenant
   279	   204     103      24  
   280	   205     104      25  - **3 Endpoints API**
   281	   206     105      26    - `POST /api/commissions` - Crear comisión (servicio o venta)
   282	   207     106      27      - Validación de datos y permisos
   283	   208     107      28      - Cálculo automático de comisión
   284	   209     108      29      - Registro de metadata (tipo de fuente, referencias)
   285	   210     109      30    
   286	   211     110      31    - `GET /api/commissions` - Listar y filtrar comisiones
   287	   212     111      32      - Filtros: profesional, sucursal, rango de fechas, estado
   288	   213     112      33      - Paginación y ordenamiento
   289	   214     113      34      - Estadísticas agregadas (totales, pendientes, pagadas, aprobadas)
   290	   215     114      35      - Cálculo de resúmenes por estado
   291	   216     115      36    
   292	   217     116      37    - `GET /api/commissions/[id]` - Detalle de comisión
   293	   218     117      38      - Información completa de la comisión
   294	   219     118      39      - Datos relacionados (profesional, sucursal)
   295	   220     119      40      - Historial de estados
   296	   221     120      41    
   297	   222     121      42    - `PUT /api/commissions/[id]` - Actualizar comisión
   298	   223     122      43      - Aprobar comisión pendiente
   299	   224     123      44      - Rechazar comisión con razón
   300	   225     124      45      - Marcar como pagada con fecha
   301	   226     125      46      - Validaciones de transiciones de estado
   302	   227     126      47      - Control de permisos por rol
   303	   228     127      48    
   304	   229     128      49    - `GET /api/commissions/professional/[id]` - Resumen por profesional
   305	   230     129      50      - Total de comisiones (todas, pendientes, aprobadas, pagadas)
   306	   231     130      51      - Comisiones este mes y totales
   307	   232     131      52      - Lista de comisiones recientes
   308	   233     132      53      - Desglose por tipo (servicio vs venta)
   309	   234     133      54      - Estadísticas de desempeño
   310	   235     134      55  
   311	   236     135      56  #### Frontend (Componentes y Páginas)
   312	   237     136      57  
   313	   238     137      58  - **CommissionDashboard Component** (380 líneas)
   314	   239     138      59    - Dashboard principal de gestión de comisiones
   315	   240     139      60    - Filtros avanzados:
   316	   241     140      61      - Por profesional (dropdown con búsqueda)
   317	   242     141      62      - Por sucursal
   318	   243     142      63      - Por estado (pending, approved, paid, rejected)
   319	   244     143      64      - Rango de fechas personalizado
   320	   245     144      65    - Estadísticas en tiempo real:
   321	   246     145      66      - Total de comisiones
   322	   247     146      67      - Pendientes de aprobación
   323	   248     147      68      - Pagadas
   324	   249     148      69      - Aprobadas no pagadas
   325	   250     149      70    - Tabla interactiva de comisiones:
   326	   251     150      71      - Columnas: profesional, monto, tipo, estado, fecha, sucursal
   327	   252     151      72      - Badges de estado con colores
   328	   253     152      73      - Acciones por estado:
   329	   254     153      74        - Aprobar comisiones pendientes
   330	   255     154      75        - Rechazar con razón
   331	   256     155      76        - Marcar como pagada
   332	   257     156      77    - UI moderna con Tailwind CSS y Lucide Icons
   333	   258     157      78    - Responsive design para móvil y desktop
   334	   259     158      79  
   335	   260     159      80  - **ProfessionalCommissionDetail Component** (273 líneas)
   336	   261     160      81    - Vista detallada de comisiones por profesional
   337	   262     161      82    - Métricas principales:
   338	   263     162      83      - Total de comisiones
   339	   264     163      84      - Comisiones este mes
   340	   265     164      85      - Pendientes, aprobadas, pagadas
   341	   266     165      86    - Gráfico de tendencias:
   342	   267     166      87      - Visualización mensual con Recharts
   343	   268     167      88      - Comparación de comisiones pagadas vs pendientes
   344	   269     168      89      - Colores diferenciados por estado
   345	   270     169      90    - Lista completa de comisiones:
   346	   271     170      91      - Orden cronológico (más recientes primero)
   347	   272     171      92      - Detalles por comisión (tipo, monto, estado, fecha)
   348	   273     172      93      - Badges de estado visual
   349	   274     173      94    - Desglose por tipo:
   350	   275     174      95      - Comisiones por servicios
   351	   276     175      96      - Comisiones por ventas
   352	   277     176      97      - Subtotales y porcentajes
   353	   278     177      98  
   354	   279     178      99  - **2 Páginas Next.js**
   355	   280     179     100    - `/dashboard/commissions` - Dashboard principal
   356	   281     180     101      - Gestión centralizada de todas las comisiones
   357	   282     181     102      - Acceso completo para administradores
   358	   283     182     103      - Filtros y acciones masivas
   359	   284     183     104    
   360	   285     184     105    - `/dashboard/commissions/[id]` - Detalle por profesional
   361	   286     185     106      - Vista enfocada en un profesional específico
   362	   287     186     107      - Métricas individuales y tendencias
   363	   288     187     108      - Historial completo de comisiones
   364	   289     188     109  
   365	   290     189     110  #### Tipos TypeScript
   366	   291     190     111  
   367	   292     191     112  - **Commission Interface**
   368	   293     192     113    - `id`, `professionalId`, `branchId`, `tenantId`
   369	   294     193     114    - `amount` - Monto de la comisión
   370	   295     194     115    - `type` - Tipo: 'service' | 'sale'
   371	   296     195     116    - `status` - Estado: 'pending' | 'approved' | 'paid' | 'rejected'
   372	   297     196     117    - `source` - Fuente (appointmentId o saleId)
   373	   298     197     118    - `metadata` - Información adicional (servicio, cliente, etc.)
   374	   299     198     119    - `approvedAt`, `paidAt`, `rejectedAt`, `rejectionReason`
   375	   300     199     120    - `createdAt`, `updatedAt`
   376	   301     200     121  
   377	   302     201     122  - **CommissionStatus Enum**
   378	   303     202     123    - `PENDING` - Pendiente de aprobación
   379	   304     203     124    - `APPROVED` - Aprobada, no pagada
   380	   305     204     125    - `PAID` - Pagada al profesional
   381	   306     205     126    - `REJECTED` - Rechazada
   382	   307     206     127  
   383	   308     207     128  - **CommissionType Enum**
   384	   309     208     129    - `SERVICE` - Comisión por servicio/cita
   385	   310     209     130    - `SALE` - Comisión por venta de producto
   386	   311     210     131  
   387	   312     211     132  - **CommissionSummary Interface**
   388	   313     212     133    - Resumen agregado por profesional
   389	   314     213     134    - Totales por estado
   390	   315     214     135    - Desglose mensual
   391	   316     215     136    - Estadísticas de desempeño
   392	   317     216     137  
   393	   318     217     138  #### Funcionalidades Clave
   394	   319     218     139  
   395	   320     219     140  1. **Gestión Completa de Comisiones**
   396	   321     220     141     - Crear comisiones automáticamente desde servicios y ventas
   397	   322     221     142     - Aprobar comisiones pendientes
   398	   323     222     143     - Rechazar con razón específica
   399	   324     223     144     - Marcar como pagadas con fecha
   400	   325     224     145     - Transiciones de estado validadas
   401	   326     225     146  
   402	   327     226     147  2. **Filtros y Búsqueda Avanzada**
   403	   328     227     148     - Filtrar por profesional
   404	   329     228     149     - Filtrar por sucursal
   405	   330     229     150     - Filtrar por estado
   406	   331     230     151     - Filtrar por rango de fechas
   407	   332     231     152     - Combinar múltiples filtros
   408	   333     232     153  
   409	   334     233     154  3. **Estadísticas en Tiempo Real**
   410	   335     234     155     - Total de comisiones
   411	   336     235     156     - Pendientes de aprobación
   412	   337     236     157     - Aprobadas no pagadas
   413	   338     237     158     - Pagadas en el mes
   414	   339     238     159     - Desglose por tipo
   415	   340     239     160  
   416	   341     240     161  4. **Visualizaciones y Reportes**
   417	   342     241     162     - Gráficos de tendencias mensuales
   418	   343     242     163     - Distribución por estado
   419	   344     243     164     - Comparativas de desempeño
   420	   345     244     165     - Rankings de profesionales
   421	   346     245     166     - Desglose por tipo de comisión
   422	   347     246     167  
   423	   348     247     168  5. **Integración con Módulos Existentes**
   424	   349     248     169     - Servicios y citas (comisiones por servicio)
   425	   350     249     170     - Ventas y POS (comisiones por venta)
   426	   351     250     171     - Profesionales (resumen por profesional)
   427	   352     251     172     - Sucursales (filtrado por ubicación)
   428	   353     252     173     - Sistema multi-tenant
   429	   354     253     174  
   430	   355     254     175  6. **Seguridad y Validaciones**
   431	   356     255     176     - Control de acceso por rol
   432	   357     256     177     - Validación de permisos
   433	   358     257     178     - Validación de transiciones de estado
   434	   359     258     179     - Aislamiento por tenant
   435	   360     259     180     - Auditoría de cambios
   436	   361     260     181  
   437	   362     261     182  #### Integración
   438	   363     262     183  
   439	   364     263     184  - Compatible con módulo de servicios (v1.0+)
   440	   365     264     185  - Compatible con módulo de ventas/POS (v1.2+)
   441	   366     265     186  - Compatible con sistema de profesionales (v1.5+)
   442	   367     266     187  - Compatible con asignaciones multi-sucursal (v1.6+)
   443	   368     267     188  - Integrado con sistema de reportes (v1.7+)
   444	   369     268     189  
   445	   370     269     190  #### Métricas del Módulo
   446	   371     270     191  
   447	   372     271     192  - **Archivos creados:** 8
   448	   373     272     193    - 3 endpoints API (582 líneas)
   449	   374     273     194    - 2 componentes React (653 líneas)
   450	   375     274     195    - 2 páginas Next.js (52 líneas)
   451	   376     275     196    - 1 archivo de tipos (37 líneas)
   452	   377     276     197  - **Total líneas de código:** 1,124
   453	   378     277     198  - **Breaking changes:** Ninguno
   454	   379     278     199  - **Migraciones:** No requeridas
   455	   380     279     200  - **Merge SHA:** `6d294849ee0b46fcba96f4a47e30f92e55d1dc81`
   456	   381     280     201  
   457	   382     281     202  #### PR #108
   458	   383     282     203  
   459	   384     283     204  - **Título:** Módulo completo de gestión de comisiones v1.8.3
   460	   385     284     205  - **Estado:** ✅ Merged
   461	   386     285     206  - **Tag:** v1.8.3
   462	   387     286     207  - **Deploy:** Automático en Easypanel
   463	   388     287     208  - **Documentación:** PR_108_COMMISSIONS_MODULE.md
   464	   389     288     209  
   465	   390     289     210       6       5       4  All notable changes to CitaPlanner will be documented in this file.
   466	   391     290     211       7       6       5  
   467	   392     291     212       8  
   468	   393     292     213       9  ## [1.8.2] - 2025-10-15
   469	   394     293     214      10  
   470	   395     294     215      11  ### Fixed - Ruta Working Hours
   471	   396     295     216      12  
   472	   397     296     217      13  #### Dashboard de Horarios
   473	   398     297     218      14  - **PR #105:** Crear ruta `/dashboard/working-hours` y endpoint `/api/professionals`
   474	   399     298     219      15    - **Problema:** Link en navegación apuntaba a ruta inexistente
   475	   400     299     220      16    - **Endpoint:** `GET /api/professionals` para listar todos los profesionales
   476	   401     300     221      17      - Filtros: por sucursal, incluir inactivos
   477	   402     301     222      18      - Datos completos: perfil, sucursales, horarios, citas
   478	   403     302     223      19      - Compatible con código existente (calendar, modals)
   479	   404     303     224      20    - **Página:** Vista centralizada de horarios
   480	   405     304     225      21      - Estadísticas: total, con horarios, sin configurar, activos
   481	   406     305     226      22      - Filtros: búsqueda, sucursal, mostrar inactivos
   482	   407     306     227      23      - Tarjetas con avatar, contacto, sucursales, citas
   483	   408     307     228      24      - Estado visual de horarios configurados
   484	   409     308     229      25      - Botón para gestionar horario individual
   485	   410     309     230      26    - Integración con sistema de horarios (Fase 1)
   486	   411     310     231      27    - Integración con asignaciones (Fase 2)
   487	   412     311     232      28    - UI moderna con Tailwind CSS y Lucide Icons
   488	   413     312     233      29    - Merge SHA: `880d520e0522a48f3c3122615bad11a2cf293434`
   489	   414     313     234      30  
   490	   415     314     235      31  #### Métricas del Fix
   491	   416     315     236      32  - Archivos creados: 2
   492	   417     316     237      33  - Líneas de código: 539
   493	   418     317     238      34  - Breaking changes: Ninguno
   494	   419     318     239      35  - Migraciones: No requeridas
   495	   420     319     240      36       7       6  The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
   496	   421     320     241      37       8       7  and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
   497	   422     321     242      38       9  ## [1.8.1] - 2025-10-15
   498	   423     322     243      39      10  
   499	   424     323     244      40      11  ### Fixed - Hotfix Crítico
   500	   425     324     245      41      12  
   501	   426     325     246      42      13  #### API de Notificaciones
   502	   427     326     247      43      14  - **PR #104:** Corregir campo `scheduledAt` inexistente en modelo Appointment
   503	   428     327     248      44      15    - Reemplazar `scheduledAt` con `startTime` en `notificationService.ts`
   504	   429     328     249      45      16    - Fix error crítico: Invalid `prisma.notificationLog.findMany()` invocation
   505	   430     329     250      46      17    - Endpoint afectado: `/api/notifications/logs`
   506	   431     330     251      47      18    - Causa: El modelo Appointment usa `startTime`/`endTime`, no `scheduledAt`
   507	   432     331     252      48      19    - Impacto: API de logs de notificaciones restaurada
   508	   433     332     253      49      20    - Severidad: 🔴 Crítica
   509	   434     333     254      50      21    - Merge SHA: `dfd9706ea7334e8dc9d0fb2f53ee25b967d72344`
   510	   435     334     255      51      22  
   511	   436     335     256      52      23  #### Métricas del Fix
   512	   437     336     257      53      24  - Archivos modificados: 1
   513	   438     337     258      54      25  - Líneas modificadas: 1
   514	   439     338     259      55      26  - Tiempo de resolución: ~13 minutos
   515	   440     339     260      56      27  - Breaking changes: Ninguno
   516	   441     340     261      57      28  
   517	   442     341     262      58      29       8  
   518	   443     342     263      59      30       9  ## [1.8.0] - 2025-10-14
   519	   444     343     264      60      31      10  
   520	   445     344     265      61      32      11  ### Added - Fase 4: Vista de Calendario por Profesional
   521	   446     345     266      62      33      12  
   522	   447     346     267      63      34      13  #### Dependencias
   523	   448     347     268      64      35      14  - **react-big-calendar** - Librería de calendario interactivo
   524	   449     348     269      65      36      15  - **date-fns** - Manejo de fechas y localización
   525	   450     349     270      66      37      16  - **@types/react-big-calendar** - Tipos TypeScript
   526	   451     350     271      67      38      17  
   527	   452     351     272      68      39      18  #### Backend
   528	   453     352     273      69      40      19  
   529	   454     353     274      70      41      20  - **CalendarManager Service** (600+ líneas)
   530	   455     354     275      71      42      21    - `getCalendarEvents()` - Obtener eventos con filtros avanzados
   531	   456     355     276      72      43      22    - `getProfessionalAvailability()` - Calcular disponibilidad completa
   532	   457     356     277      73      44      23    - `validateAvailability()` - Validar antes de crear/mover citas
   533	   458     357     278      74      45      24    - `getCalendarStatistics()` - Estadísticas del calendario
   534	   459     358     279      75      46      25    - `getAvailableSlots()` - Slots disponibles para agendar
   535	   460     359     280      76      47      26    - `validateCalendarAccess()` - Validación de permisos por rol
   536	   461     360     281      77      48      27    - Integración con `scheduleManager` (Fase 1)
   537	   462     361     282      78      49      28    - Integración con `branchAssignments` (Fase 2)
   538	   463     362     283      79      50      29    - Manejo de horarios override por sucursal
   539	   464     363     284      80      51      30    - Procesamiento de excepciones (vacaciones, bajas)
   540	   465     364     285      81      52      31  
   541	   466     365     286      82      53      32  #### API Endpoints
   542	   467     366     287      83      54      33  - `GET /api/calendar/professional/[id]` - Eventos del calendario con filtros
   543	   468     367     288      84      55      34  - `GET /api/calendar/availability/[professionalId]` - Disponibilidad y horarios
   544	   469     368     289      85      56      35  - `GET /api/calendar/availability/[professionalId]/slots` - Slots disponibles
   545	   470     369     290      86      57      36  - `POST /api/calendar/availability/validate` - Validar disponibilidad
   546	   471     370     291      87      58      37  - `POST /api/calendar/appointments` - Crear cita desde calendario
   547	   472     371     292      88      59      38  - `PATCH /api/calendar/appointments/[id]/reschedule` - Reprogramar cita (drag & drop)
   548	   473     372     293      89      60      39  - `GET /api/calendar/statistics/[professionalId]` - Estadísticas del calendario
   549	   474     373     294      90      61      40  - `GET /api/professionals/me` - Datos del profesional autenticado
   550	   475     374     295      91      62      41  
   551	   476     375     296      92      63      42  #### Tipos TypeScript (400+ líneas)
   552	   477     376     297      93      64      43  - `CalendarEvent` - Evento del calendario con metadata completa
   553	   478     377     298      94      65      44  - `CalendarEventResource` - Datos de la cita (cliente, servicio, estado)
   554	   479     378     299      95      66      45  - `AvailabilityBlock` - Bloques de disponibilidad (regular/exception/override)
   555	   480     379     300      96      67      46  - `ProfessionalAvailability` - Disponibilidad completa de profesional
   556	   481     380     301      97      68      47  - `CalendarFilters` - Filtros avanzados del calendario
   557	   482     381     302      98      69      48  - `CalendarView` - Vistas del calendario (month/week/day/agenda)
   558	   483     382     303      99      70      49  - `CalendarStatistics` - Estadísticas y métricas del calendario
   559	   484     383     304     100      71      50  - Helpers: `createCalendarEventFromAppointment()`, `getStatusColor()`, `getDateRangeForView()`
   560	   485     384     305     101      72      51  
   561	   486     385     306     102      73      52  #### Frontend Components
   562	   487     386     307     103      74      53  
   563	   488     387     308     104      75      54  - **ProfessionalCalendar** (300+ líneas)
   564	   489     388     309     105      76      55    - Integración completa con react-big-calendar
   565	   490     389     310     106      77      56    - Vistas: mensual, semanal, diaria, agenda
   566	   491     390     311     107      78      57    - Drag & drop para reprogramar citas
   567	   492     391     312     108      79      58    - Resize de eventos
   568	   493     392     313     109      80      59    - Estilos personalizados por estado
   569	   494     393     314     110      81      60    - Visualización de disponibilidad
   570	   495     394     315     111      82      61    - Localización en español
   571	   496     395     316     112      83      62    - Responsive design
   572	   497     396     317     113      84      63  
   573	   498     397     318     114      85      64  - **CalendarFilters** (150+ líneas)
   574	   499     398     319     115      86      65    - Selector de vista (mes/semana/día/agenda)
   575	   500     399     320     116      87      66    - Filtro por profesional (admin/gerente)
   576	   501     400     321     117      88      67    - Filtro por sucursal
   577	   502     401     322     118      89      68    - Filtro por estado de cita
   578	   503     402     323     119      90      69    - Filtro por servicio
   579	   504     403     324     120      91      70    - Aplicación en tiempo real
   580	   505     404     325     121      92      71  
   581	   506     405     326     122      93      72  - **CalendarLegend** (100+ líneas)
   582	   507     406     327     123      94      73    - Leyenda de colores por estado
   583	   508     407     328     124      95      74    - Indicadores de disponibilidad
   584	   509     408     329     125      96      75    - Diseño compacto y claro
   585	   510     409     330     126      97      76  
   586	   511     410     331     127      98      77  - **AppointmentModal** (350+ líneas)
   587	   512     411     332     128      99      78    - Tres modos: crear, editar, ver
   588	   513     412     333     129     100      79    - Formulario completo con validaciones
   589	   514     413     334     130     101      80    - Auto-cálculo de endTime según servicio
   590	   515     414     335     131     102      81    - Botón de cancelar cita
   591	   516     415     336     132     103      82    - Manejo de errores inline
   592	   517     416     337     133     104      83    - Estados visuales
   593	   518     417     338     134     105      84  
   594	   519     418     339     135     106      85  #### Páginas
   595	   520     419     340     136     107      86  - `/dashboard/calendar/page.tsx` - Página principal del calendario (500+ líneas)
   596	   521     420     341     137     108      87    - Estado completo del calendario
   597	   522     421     342     138     109      88    - Gestión de eventos y disponibilidad
   598	   523     422     343     139     110      89    - Integración con API endpoints
   599	   524     423     344     140     111      90    - Manejo de drag & drop
   600	   525     424     345     141     112      91    - Sistema de filtros
   601	   526     425     346     142     113      92    - Modal de citas
   602	   527     426     347     143     114      93    - Permisos por rol
   603	   528     427     348     144     115      94    - Loading states
   604	   529     428     349     145     116      95    - Error handling
   605	   530     429     350     146     117      96  
   606	   531     430     351     147     118      97  #### Funcionalidades Implementadas
   607	   532     431     352     148     119      98  
   608	   533     432     353     149     120      99  ##### Vistas del Calendario
   609	   534     433     354     150     121     100  - ✅ Vista mensual - Resumen del mes completo
   610	   535     434     355     151     122     101  - ✅ Vista semanal - 7 días con slots de tiempo
   611	   536     435     356     152     123     102  - ✅ Vista diaria - Día detallado con todos los slots
   612	   537     436     357     153     124     103  - ✅ Vista agenda - Lista cronológica de citas
   613	   538     437     358     154     125     104  
   614	   539     438     359     155     126     105  ##### Gestión de Citas
   615	   540     439     360     156     127     106  - ✅ **Crear citas** - Click en slot disponible → Modal → Crear
   616	   541     440     361     157     128     107  - ✅ **Editar citas** - Click en evento → Modal → Editar
   617	   542     441     362     158     129     108  - ✅ **Cancelar citas** - Botón en modal con confirmación
   618	   543     442     363     159     130     109  - ✅ **Reprogramar (Drag & Drop)** - Arrastrar evento → Validar → Guardar
   619	   544     443     364     160     131     110  - ✅ **Resize de eventos** - Ajustar duración visualmente
   620	   545     444     365     161     132     111  
   621	   546     445     366     162     133     112  ##### Validaciones Automáticas
   622	   547     446     367     163     134     113  - ✅ Horario dentro de disponibilidad
   623	   548     447     368     164     135     114  - ✅ Sin solapamientos con otras citas
   624	   549     448     369     165     136     115  - ✅ Respeto a excepciones (vacaciones, bajas)
   625	   550     449     370     166     137     116  - ✅ Duración correcta del servicio
   626	   551     450     371     167     138     117  - ✅ Permisos por rol
   627	   552     451     372     168     139     118  
   628	   553     452     373     169     140     119  ##### Visualización de Disponibilidad
   629	   554     453     374     170     141     120  - ✅ Bloques disponibles (fondo blanco, clickeable)
   630	   555     454     375     171     142     121  - ✅ Bloques no disponibles (fondo gris, bloqueado)
   631	   556     455     376     172     143     122  - ✅ Excepciones (vacaciones) diferenciadas
   632	   557     456     377     173     144     123  - ✅ Horarios override por sucursal
   633	   558     457     378     174     145     124  
   634	   559     458     379     175     146     125  ##### Filtros Avanzados
   635	   560     459     380     176     147     126  - ✅ Filtro por profesional (admin/gerente)
   636	   561     460     381     177     148     127  - ✅ Filtro por sucursal
   637	   562     461     382     178     149     128  - ✅ Filtro por estado (pendiente, confirmada, completada, etc.)
   638	   563     462     383     179     150     129  - ✅ Filtro por servicio
   639	   564     463     384     180     151     130  - ✅ Aplicación en tiempo real sin recargar
   640	   565     464     385     181     152     131  
   641	   566     465     386     182     153     132  ##### Permisos por Rol
   642	   567     466     387     183     154     133  - ✅ **Profesional**: Solo su propio calendario
   643	   568     467     388     184     155     134  - ✅ **Gerente**: Calendarios de profesionales de su(s) sucursal(es)
   644	   569     468     389     185     156     135  - ✅ **Admin/Super Admin**: Todos los calendarios
   645	   570     469     390     186     157     136  - ✅ **Cliente**: Sin acceso
   646	   571     470     391     187     158     137  
   647	   572     471     392     188     159     138  #### Integración con Fases Anteriores
   648	   573     472     393     189     160     139  
   649	   574     473     394     190     161     140  ##### Fase 1 (Horarios)
   650	   575     474     395     191     162     141  - ✅ Usa `scheduleManager.ts` para obtener horarios
   651	   576     475     396     192     163     142  - ✅ Respeta `ProfessionalSchedule` (dayOfWeek, startTime, endTime)
   652	   577     476     397     193     164     143  - ✅ Procesa `ScheduleException` para bloquear fechas
   653	   578     477     398     194     165     144  - ✅ Calcula disponibilidad basada en configuración
   654	   579     478     399     195     166     145  
   655	   580     479     400     196     167     146  ##### Fase 2 (Asignaciones)
   656	   581     480     401     197     168     147  - ✅ Considera `branchAssignments` con sucursal primaria
   657	   582     481     402     198     169     148  - ✅ Aplica `scheduleOverride` cuando está definido
   658	   583     482     403     199     170     149  - ✅ Filtra por sucursal en queries
   659	   584     483     404     200     171     150  - ✅ Valida permisos de gerente según sucursales
   660	   585     484     405     201     172     151  
   661	   586     485     406     202     173     152  ##### Fase 3 (Reportes)
   662	   587     486     407     203     174     153  - ✅ Estadísticas del calendario complementan reportes
   663	   588     487     408     204     175     154  - ✅ `CalendarStatistics` incluye métricas de utilización
   664	   589     488     409     205     176     155  - ✅ Datos alimentan dashboards de análisis
   665	   590     489     410     206     177     156  
   666	   591     490     411     207     178     157  #### Características Técnicas
   667	   592     491     412     208     179     158  - 🔒 Validaciones robustas en backend y frontend
   668	   593     492     413     209     180     159  - 🚀 Rendimiento optimizado con lazy loading
   669	   594     493     414     210     181     160  - 📱 Responsive design con TailwindCSS
   670	   595     494     415     211     182     161  - 🌐 Localización completa en español
   671	   596     495     416     212     183     162  - ♿ Accesibilidad con ARIA labels
   672	   597     496     417     213     184     163  - 🎨 UI/UX intuitiva y profesional
   673	   598     497     418     214     185     164  - 📊 Estadísticas de utilización
   674	   599     498     419     215     186     165  - 🔔 Toast notifications para feedback
   675	   600     499     420     216     187     166  - ⚡ Actualizaciones en tiempo real
   676	   601     500     421     217     188     167  
   677	   602     501     422     218     189     168  ### Documentation
   678	   603     502     423     219     190     169  - `FASE4_CALENDAR.md` - Documentación completa de la Fase 4 (50+ páginas)
   679	   604     503     424     220     191     170    - Arquitectura detallada
   680	   605     504     425     221     192     171    - API Endpoints con ejemplos
   681	   606     505     426     222     193     172    - Componentes Frontend
   682	   607     506     427     223     194     173    - Guías de uso para cada rol
   683	   608     507     428     224     195     174    - Testing manual checklist
   684	   609     508     429     225     196     175    - Integración con fases anteriores
   685	   610     509     430     226     197     176    - Próximos pasos
   686	   611     510     431     227     198     177  
   687	   612     511     432     228     199     178  ### Statistics
   688	   613     512     433     229     200     179  - 17 archivos nuevos/modificados
   689	   614     513     434     230     201     180  - ~3,000 líneas de código
   690	   615     514     435     231     202     181  - 4 componentes React principales
   691	   616     515     436     232     203     182  - 8 endpoints API
   692	   617     516     437     233     204     183  - 30+ tipos TypeScript
   693	   618     517     438     234     205     184  - 10+ métodos de servicio
   694	   619     518     439     235     206     185  - Sin breaking changes
   695	   620     519     440     236     207     186  - 100% compatible con fases anteriores
   696	   621     520     441     237     208     187  
   697	   622     521     442     238     209     188  ### Breaking Changes
   698	   623     522     443     239     210     189  - ❌ **Ninguno** - Completamente compatible con v1.7.0
   699	   624     523     444     240     211     190  
   700	   625     524     445     241     212     191  ### Notes
   701	   626     525     446     242     213     192  - Sistema de calendario completamente funcional
   702	   627     526     447     243     214     193  - Drag & drop con validaciones en tiempo real
   703	   628     527     448     244     215     194  - Integración perfecta con horarios y asignaciones
   704	   629     528     449     245     216     195  - Permisos estrictos según rol
   705	   630     529     450     246     217     196  - Código limpio, comentado y mantenible
   706	   631     530     451     247     218     197  - Listo para producción
   707	   632     531     452     248     219     198  
   708	   633     532     453     249     220     199  ## [1.7.0] - 2025-10-14
   709	   634     533     454     250     221     200  
   710	   635     534     455     251     222     201  ### Added - Fase 3: Sistema de Reportes
   711	   636     535     456     252     223     202  
   712	   637     536     457     253     224     203  #### Backend
   713	   638     537     458     254     225     204  - **ReportManager Service** (800+ líneas)
   714	   639     538     459     255     226     205    - Generación de reportes por profesional, sucursal y general
   715	   640     539     460     256     227     206    - Cálculo de métricas: citas, ingresos, tiempo, clientes
   716	   641     540     461     257     228     207    - Tendencias y análisis temporal
   717	   642     541     462     258     229     208    - Soporte para múltiples períodos (día, semana, mes, año, custom)
   718	   643     542     463     259     230     209    - Reportes comparativos entre profesionales o sucursales
   719	   644     543     464     260     231     210  
   720	   645     544     465     261     232     211  #### API Endpoints
   721	   646     545     466     262     233     212  - `GET /api/reports/professional/[id]` - Reporte de profesional
   722	   647     546     467     263     234     213  - `GET /api/reports/branch/[id]` - Reporte de sucursal
   723	   648     547     468     264     235     214  - `GET /api/reports/overview` - Reporte general del negocio
   724	   649     548     469     265     236     215  - `GET /api/reports/comparison` - Reportes comparativos
   725	   650     549     470     266     237     216  
   726	   651     550     471     267     238     217  #### Frontend Components
   727	   652     551     472     268     239     218  - **ReportDashboard** (400+ líneas)
   728	   653     552     473     269     240     219    - Dashboard general con métricas consolidadas
   729	   654     553     474     270     241     220    - Gráficos de tendencias (líneas)
   730	   655     554     475     271     242     221    - Top 10 profesionales, sucursales y servicios
   731	   656     555     476     272     243     222    - Filtros de período y rango de fechas
   732	   657     556     477     273     244     223    
   733	   658     557     478     274     245     224  - **ProfessionalReportView** (450+ líneas)
   734	   659     558     479     275     246     225    - Vista detallada de profesional
   735	   660     559     480     276     247     226    - Métricas individuales
   736	   661     560     481     277     248     227    - Desempeño por sucursal
   737	   662     561     482     278     249     228    - Servicios más realizados
   738	   663     562     483     279     250     229    - Gráficos de pastel y barras
   739	   664     563     484     280     251     230    
   740	   665     564     485     281     252     231  - **BranchReportView** (450+ líneas)
   741	   666     565     486     282     253     232    - Vista detallada de sucursal
   742	   667     566     487     283     254     233    - Métricas de sucursal
   743	   668     567     488     284     255     234    - Desempeño de profesionales
   744	   669     568     489     285     256     235    - Servicios más solicitados
   745	   670     569     490     286     257     236    - Análisis de utilización
   746	   671     570     491     287     258     237  
   747	   672     571     492     288     259     238  #### Páginas
   748	   673     572     493     289     260     239  - `/dashboard/reports` - Dashboard principal de reportes
   749	   674     573     494     290     261     240  - `/dashboard/reports/professional/[id]` - Reporte de profesional
   750	   675     574     495     291     262     241  - `/dashboard/reports/branch/[id]` - Reporte de sucursal
   751	   676     575     496     292     263     242  
   752	   677     576     497     293     264     243  #### Tipos TypeScript
   753	   678     577     498     294     265     244  - Tipos completos para reportes (350+ líneas)
   754	   679     578     499     295     266     245  - Interfaces para métricas y filtros
   755	   680     579     500     296     267     246  - Enums para períodos y estados
   756	   681     580     501     297     268     247  
   757	   682     581     502     298     269     248  #### Visualizaciones
   758	   683     582     503     299     270     249  - Gráficos de línea (tendencias)
   759	   684     583     504     300     271     250  - Gráficos de barras (comparativas)
   760	   685     584     505     301     272     251  - Gráficos de pastel (distribuciones)
   761	   686     585     506     302     273     252  - Tarjetas de métricas clave
   762	   687     586     507     303     274     253  - Integración con Recharts
   763	   688     587     508     304     275     254  
   764	   689     588     509     305     276     255  #### Métricas Calculadas
   765	   690     589     510     306     277     256  - **Citas**: Total, completadas, canceladas, tasas
   766	   691     590     511     307     278     257  - **Ingresos**: Total, promedio, proyectado
   767	   692     591     512     308     279     258  - **Tiempo**: Horas trabajadas, utilización, horas pico
   768	   693     592     513     309     280     259  - **Clientes**: Total, nuevos, retención
   769	   694     593     514     310     281     260  
   770	   695     594     515     311     282     261  ### Documentation
   771	   696     595     516     312     283     262  - `FASE3_REPORTS.md` - Documentación completa de la Fase 3
   772	   697     596     517     313     284     263  - Casos de uso detallados
   773	   698     597     518     314     285     264  - Guías de integración
   774	   699     598     519     315     286     265  - Ejemplos de API
   775	   700     599     520     316     287     266  
   776	   701     600     521     317     288     267  ### Statistics
   777	   702     601     522     318     289     268  - 14 archivos nuevos
   778	   703     602     523     319     290     269  - ~3,500 líneas de código
   779	   704     603     524     320     291     270  - 3 componentes React principales
   780	   705     604     525     321     292     271  - 4 endpoints API
   781	   706     605     526     322     293     272  - 20+ tipos TypeScript
   782	   707     606     527     323     294     273  - 12+ métodos de servicio
   783	   708     607     528     324     295     274  
   784	   709     608     529     325     296     275  ## [1.6.0] - 2025-10-14
   785	   710     609     530     326     297     276  
   786	   711     610     531     327     298     277  ### Added - Fase 2: Sistema de Asignación Masiva
   787	   712     611     532     328     299     278  
   788	   713     612     533     329     300     279  #### Backend
   789	   714     613     534     330     301     280  - **BranchAssignment Model**
   790	   715     614     535     331     302     281    - Relación muchos-a-muchos entre profesionales y sucursales
   791	   716     615     536     332     303     282    - Gestión de sucursal primaria
   792	   717     616     537     333     304     283    - Estados activo/inactivo con soft delete
   793	   718     617     538     334     305     284    - Fechas de vigencia (inicio y fin)
   794	   719     618     539     335     306     285    - Campo para horarios específicos por sucursal
   795	   720     619     540     336     307     286    - Índices optimizados para consultas
   796	   721     620     541     337     308     287  
   797	   722     621     542     338     309     288  - **BranchAssignmentManager Service** (600+ líneas)
   798	   723     622     543     339     310     289    - `validateAssignment()` - Validación completa de asignaciones
   799	   724     623     544     340     311     290    - `createAssignment()` - Crear asignación individual
   800	   725     624     545     341     312     291    - `assignProfessionalsToBranch()` - Asignación masiva a sucursal
   801	   726     625     546     342     313     292    - `assignProfessionalToBranches()` - Asignar a múltiples sucursales
   802	   727     626     547     343     314     293    - `getBranchAssignments()` - Listar por sucursal
   803	   728     627     548     344     315     294    - `getProfessionalAssignments()` - Listar por profesional
   804	   729     628     549     345     316     295    - `updateAssignment()` - Actualizar asignación
   805	   730     629     550     346     317     296    - `deleteAssignment()` - Eliminar asignación
   806	   731     630     551     347     318     297    - `getAssignmentStats()` - Estadísticas
   807	   732     631     552     348     319     298    - `getAvailableProfessionals()` - Profesionales disponibles
   808	   733     632     553     349     320     299  
   809	   734     633     554     350     321     300  #### API Endpoints
   810	   735     634     555     351     322     301  - `POST /api/branches/[id]/assignments` - Asignación masiva
   811	   736     635     556     352     323     302  - `GET /api/branches/[id]/assignments` - Listar asignaciones
   812	   737     636     557     353     324     303  - `GET /api/branches/[id]/assignments/available` - Profesionales disponibles
   813	   738     637     558     354     325     304  - `PUT /api/branches/[id]/assignments/[assignmentId]` - Actualizar
   814	   739     638     559     355     326     305  - `DELETE /api/branches/[id]/assignments/[assignmentId]` - Eliminar
   815	   740     639     560     356     327     306  - `POST /api/professionals/[id]/assignments` - Asignar a múltiples sucursales
   816	   741     640     561     357     328     307  - `GET /api/professionals/[id]/assignments` - Listar por profesional
   817	   742     641     562     358     329     308  - `GET /api/assignments/stats` - Estadísticas generales
   818	   743     642     563     359     330     309  
   819	   744     643     564     360     331     310  #### Frontend Components
   820	   745     644     565     361     332     311  - **BranchAssignmentManager** (500+ líneas)
   821	   746     645     566     362     333     312    - Vista desde sucursal
   822	   747     646     567     363     334     313    - Modal de asignación masiva
   823	   748     647     568     364     335     314    - Selección múltiple con checkbox
   824	   749     648     569     365     336     315    - Opciones de asignación (primaria, fechas, notas)
   825	   750     649     570     366     337     316    - Lista de profesionales asignados
   826	   751     650     571     367     338     317    - Acciones inline (toggle estado, primaria, eliminar)
   827	   752     651     572     368     339     318  
   828	   753     652     573     369     340     319  - **ProfessionalBranchesManager** (350+ líneas)
   829	   754     653     574     370     341     320    - Vista desde profesional
   830	   755     654     575     371     342     321    - Grid de tarjetas de sucursales
   831	   756     655     576     372     343     322    - Indicador visual de sucursal primaria
   832	   757     656     577     373     344     323    - Gestión de asignaciones
   833	   758     657     578     374     345     324    - Resumen con estadísticas
   834	   759     658     579     375     346     325  
   835	   760     659     580     376     347     326  #### Pages
   836	   761     660     581     377     348     327  - `/dashboard/branches/[id]/assignments` - Gestión por sucursal
   837	   762     661     582     378     349     328  - `/dashboard/professionals/[id]/branches` - Gestión por profesional
   838	   763     662     583     379     350     329  
   839	   764     663     584     380     351     330  #### Database Migration
   840	   765     664     585     381     352     331  - `20251014_add_branch_assignments` - Tabla BranchAssignment con índices
   841	   766     665     586     382     353     332  
   842	   767     666     587     383     354     333  ### Documentation
   843	   768     667     588     384     355     334  - `FASE2_MASS_ASSIGNMENT.md` - Documentación completa de la Fase 2
   844	   769     668     589     385     356     335  - Casos de uso detallados
   845	   770     669     590     386     357     336  - Guías de integración
   846	   771     670     591     387     358     337  
   847	   772     671     592     388     359     338  ### Statistics
   848	   773     672     593     389     360     339  - 13 archivos nuevos
   849	   774     673     594     390     361     340  - ~2,500 líneas de código
   850	   775     674     595     391     362     341  - 2 componentes React principales
   851	   776     675     596     392     363     342  - 5 endpoints API principales
   852	   777     676     597     393     364     343  - 10+ tipos TypeScript
   853	   778     677     598     394     365     344  - 12+ métodos de servicio
   854	   779     678     599     395     366     345  
   855	   780     679     600     396     367     346  ## [1.5.0] - 2025-10-13
   856	   781     680     601     397     368     347  
   857	   782     681     602     398     369     348  ### Added - Fase 1: Sistema de Horarios
   858	   783     682     603     399     370     349  
   859	   784     683     604     400     371     350  #### Backend
   860	   785     684     605     401     372     351  - **ScheduleManager Service** (500+ líneas)
   861	   786     685     606     402     373     352    - Gestión completa de horarios de profesionales
   862	   787     686     607     403     374     353    - Validación de horarios y disponibilidad
   863	   788     687     608     404     375     354    - Cálculo de slots disponibles
   864	   789     688     609     405     376     355    - Manejo de días festivos y excepciones
   865	   790     689     610     406     377     356    - Soporte para horarios especiales
   866	   791     690     611     407     378     357  
   867	   792     691     612     408     379     358  #### API Endpoints
   868	   793     692     613     409     380     359  - `GET /api/professionals/[id]/schedule` - Obtener horario
   869	   794     693     614     410     381     360  - `PUT /api/professionals/[id]/schedule` - Actualizar horario
   870	   795     694     615     411     382     361  - `GET /api/professionals/[id]/availability` - Verificar disponibilidad
   871	   796     695     616     412     383     362  - `POST /api/professionals/[id]/schedule/exceptions` - Agregar excepciones
   872	   797     696     617     413     384     363  
   873	   798     697     618     414     385     364  #### Frontend Components
   874	   799     698     619     415     386     365  - **ScheduleEditor** (400+ líneas)
   875	   800     699     620     416     387     366    - Editor visual de horarios
   876	   801     700     621     417     388     367    - Configuración por día de la semana
   877	   802     701     622     418     389     368    - Gestión de bloques de tiempo
   878	   803     702     623     419     390     369    - Validación en tiempo real
   879	   804     703     624     420     391     370  
   880	   805     704     625     421     392     371  #### Types
   881	   806     705     626     422     393     372  - Tipos TypeScript completos para horarios
   882	   807     706     627     423     394     373  - Interfaces para configuración y validación
   883	   808     707     628     424     395     374  
   884	   809     708     629     425     396     375  ### Documentation
   885	   810     709     630     426     397     376  - `FASE1_SCHEDULES.md` - Documentación de horarios
   886	   811     710     631     427     398     377  
   887	   812     711     632     428     399     378  ## [1.4.0] - 2025-10-06
   888	   813     712     633     429     400     379  
   889	   814     713     634     430     401     380  ### Fixed - Errores Críticos en Producción
   890	   815     714     635     431     402     381  
   891	   816     715     636     432     403     382  #### NotificationLog Error
   892	   817     716     637     433     404     383  - Eliminado campo inexistente `recipient` de consultas Prisma
   893	   818     717     638     434     405     384  - Mejorado logging en notificationService.ts
   894	   819     718     639     435     406     385  - Agregado manejo de errores robusto
   895	   820     719     640     436     407     386  
   896	   821     720     641     437     408     387  #### Client Service Error
   897	   822     721     642     438     409     388  - Agregado logging detallado en clientService.ts
   898	   823     722     643     439     410     389  - Mejorados mensajes de error para usuarios
   899	   824     723     644     440     411     390  - Agregado rastreo de sesión y tenants disponibles
   900	   825     724     645     441     412     391  - Implementado debugging para "Tenant not found"
   901	   826     725     646     442     413     392  
   902	   827     726     647     443     414     393  ### Documentation
   903	   828     727     648     444     415     394  - `PR_92_MERGE_SUMMARY.md` - Resumen del merge
   904	   829     728     649     445     416     395  - `MERGE_PR92_VISUAL.md` - Documentación visual
   905	   830     729     650     446     417     396  
   906	   831     730     651     447     418     397  ## [1.3.0] - 2025-10-05
   907	   832     731     652     448     419     398  
   908	   833     732     653     449     420     399  ### Added - Checkpoint Estable
   909	   834     733     654     450     421     400  - Checkpoint v1.3.0 creado como punto de referencia estable
   910	   835     734     655     451     422     401  - Sistema completamente funcional con todos los módulos core
   911	   836     735     656     452     423     402  - Documentación completa actualizada
   912	   837     736     657     453     424     403  
   913	   838     737     658     454     425     404  ### Fixed
   914	   839     738     659     455     426     405  - Estandarización de respuestas API
   915	   840     739     660     456     427     406  - Corrección de errores de integración frontend-backend
   916	   841     740     661     457     428     407  - Mejoras en manejo de errores
   917	   842     741     662     458     429     408  
   918	   843     742     663     459     430     409  ## [1.2.0] - 2025-10-04
   919	   844     743     664     460     431     410  
   920	   845     744     665     461     432     411  ### Added - Internacionalización
   921	   846     745     666     462     433     412  - Soporte completo para español
   922	   847     746     667     463     434     413  - Traducción de toda la interfaz
   923	   848     747     668     464     435     414  - Mensajes de error en español
   924	   849     748     669     465     436     415  - Documentación en español
   925	   850     749     670     466     437     416  
   926	   851     750     671     467     438     417  ## [1.1.0] - 2025-10-03
   927	   852     751     672     468     439     418  
   928	   853     752     673     469     440     419  ### Added - Módulo de Ventas/POS/Inventario
   929	   854     753     674     470     441     420  - Sistema completo de punto de venta
   930	   855     754     675     471     442     421  - Gestión de inventario
   931	   856     755     676     472     443     422  - Reportes de ventas
   932	   857     756     677     473     444     423  - Integración con sistema de citas
   933	   858     757     678     474     445     424  
   934	   859     758     679     475     446     425  ## [1.0.0] - 2025-10-02
   935	   860     759     680     476     447     426  
   936	   861     760     681     477     448     427  ### Added - CRM de Clientes
   937	   862     761     682     478     449     428  - Gestión completa de clientes
   938	   863     762     683     479     450     429  - Historial de citas
   939	   864     763     684     480     451     430  - Notas y seguimiento
   940	   865     764     685     481     452     431  - Integración con sistema de notificaciones
   941	   866     765     686     482     453     432  
   942	   867     766     687     483     454     433  ## [0.9.0] - 2025-10-01
   943	   868     767     688     484     455     434  
   944	   869     768     689     485     456     435  ### Added - Sistema de Notificaciones
   945	   870     769     690     486     457     436  - Notificaciones por email
   946	   871     770     691     487     458     437  - Notificaciones por SMS
   947	   872     771     692     488     459     438  - Notificaciones push
   948	   873     772     693     489     460     439  - Configuración de servicios (Twilio, SendGrid)
   949	   874     773     694     490     461     440  
   950	   875     774     695     491     462     441  ## [0.8.0] - 2025-09-30
   951	   876     775     696     492     463     442  
   952	   877     776     697     493     464     443  ### Added - Configuración Inicial
   953	   878     777     698     494     465     444  - Estructura base del proyecto
   954	   879     778     699     495     466     445  - Configuración de Next.js
   955	   880     779     700     496     467     446  - Configuración de Prisma
   956	   881     780     701     497     468     447  - Configuración de Docker
   957	   882     781     702     498     469     448  - Configuración de Easypanel
   958	   883     782     703     499     470     449  
   959	   884     783     704     500     471     450  ---
   960	   885     784     705     501     472     451  
   961	   886     785     706     502     473     452  **Nota**: Este changelog se mantiene actualizado con cada release. Para más detalles sobre cada versión, consulta la documentación específica en la carpeta `docs/`.
   962	   887     786     707     503     474     453  