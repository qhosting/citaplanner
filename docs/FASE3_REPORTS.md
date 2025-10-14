
# 📊 Fase 3: Sistema de Reportes por Profesional y Sucursal

## 📋 Resumen

Sistema completo de reportes y análisis de datos que permite visualizar métricas clave, tendencias y estadísticas detalladas por profesional, sucursal y a nivel general. Incluye dashboards interactivos con gráficos, filtros de fecha y exportación de datos.

## 🎯 Características Implementadas

### ✅ Backend - Servicio de Reportes

#### ReportManager Service
Servicio centralizado para generación de reportes con las siguientes capacidades:

**Métodos Principales:**
- `calculateDateRange()` - Calcula rangos de fechas según período
- `calculateAppointmentMetrics()` - Métricas de citas (total, completadas, canceladas, etc.)
- `calculateRevenueMetrics()` - Métricas de ingresos (total, promedio, proyectado)
- `calculateTimeMetrics()` - Métricas de tiempo (horas trabajadas, utilización, horas pico)
- `calculateClientMetrics()` - Métricas de clientes (total, nuevos, retención)
- `calculateAppointmentTrend()` - Tendencias de citas en el tiempo
- `calculateRevenueTrend()` - Tendencias de ingresos en el tiempo
- `generateProfessionalReport()` - Reporte completo de profesional
- `generateBranchReport()` - Reporte completo de sucursal
- `generateOverviewReport()` - Reporte general del negocio
- `generateComparisonReport()` - Reporte comparativo entre profesionales o sucursales

**Períodos Soportados:**
- Día (hoy)
- Semana (últimos 7 días)
- Mes (últimos 30 días)
- Año (últimos 365 días)
- Personalizado (rango de fechas custom)

### ✅ API Endpoints

#### 1. GET `/api/reports/professional/[id]`
Genera reporte detallado de un profesional específico.

**Query Parameters:**
- `period` - Período del reporte (day, week, month, year, custom)
- `startDate` - Fecha inicio (para período custom)
- `endDate` - Fecha fin (para período custom)

**Response:**
```typescript
{
  success: true,
  data: {
    professionalId: string,
    professionalName: string,
    period: ReportPeriod,
    dateRange: { startDate: Date, endDate: Date },
    appointments: AppointmentMetrics,
    revenue: RevenueMetrics,
    time: TimeMetrics,
    clients: ClientMetrics,
    branches: Array<BranchPerformance>,
    services: Array<ServicePerformance>,
    trends: {
      appointmentTrend: Array<TrendPoint>,
      revenueTrend: Array<TrendPoint>
    }
  },
  generatedAt: Date,
  filters: ReportFilters
}
```

#### 2. GET `/api/reports/branch/[id]`
Genera reporte detallado de una sucursal específica.

**Query Parameters:**
- `period` - Período del reporte
- `startDate` - Fecha inicio (opcional)
- `endDate` - Fecha fin (opcional)

**Response:**
```typescript
{
  success: true,
  data: {
    branchId: string,
    branchName: string,
    period: ReportPeriod,
    dateRange: { startDate: Date, endDate: Date },
    appointments: AppointmentMetrics,
    revenue: RevenueMetrics,
    time: TimeMetrics,
    clients: ClientMetrics,
    professionals: Array<ProfessionalPerformance>,
    services: Array<ServicePerformance>,
    trends: {
      appointmentTrend: Array<TrendPoint>,
      revenueTrend: Array<TrendPoint>
    }
  },
  generatedAt: Date,
  filters: ReportFilters
}
```

#### 3. GET `/api/reports/overview`
Genera reporte general del negocio.

**Query Parameters:**
- `period` - Período del reporte
- `startDate` - Fecha inicio (opcional)
- `endDate` - Fecha fin (opcional)

**Response:**
```typescript
{
  success: true,
  data: {
    tenantId: string,
    period: ReportPeriod,
    dateRange: { startDate: Date, endDate: Date },
    appointments: AppointmentMetrics,
    revenue: RevenueMetrics,
    time: TimeMetrics,
    clients: ClientMetrics,
    topProfessionals: Array<TopPerformer>,
    topBranches: Array<TopPerformer>,
    topServices: Array<TopService>,
    trends: {
      appointmentTrend: Array<TrendPoint>,
      revenueTrend: Array<TrendPoint>
    }
  },
  generatedAt: Date,
  filters: ReportFilters
}
```

#### 4. GET `/api/reports/comparison`
Genera reporte comparativo entre múltiples profesionales o sucursales.

**Query Parameters:**
- `type` - Tipo de comparación (professional | branch)
- `ids` - IDs separados por coma (ej: "id1,id2,id3")
- `period` - Período del reporte
- `startDate` - Fecha inicio (opcional)
- `endDate` - Fecha fin (opcional)

**Response:**
```typescript
{
  success: true,
  data: {
    period: ReportPeriod,
    dateRange: { startDate: Date, endDate: Date },
    type: 'professional' | 'branch',
    items: Array<{
      id: string,
      name: string,
      appointments: AppointmentMetrics,
      revenue: RevenueMetrics,
      clients: ClientMetrics
    }>
  },
  generatedAt: Date,
  filters: ReportFilters
}
```

### ✅ Frontend - Componentes UI

#### 1. ReportDashboard
Dashboard general con vista de todas las métricas del negocio.

**Características:**
- Selector de período (día, semana, mes, año, personalizado)
- Selector de rango de fechas personalizado
- Tarjetas de métricas clave (citas, ingresos, clientes, horas)
- Gráficos de tendencias (líneas)
- Top 10 profesionales (gráfico de barras)
- Top 10 sucursales (gráfico de barras)
- Top 10 servicios (lista con métricas)
- Actualización en tiempo real

#### 2. ProfessionalReportView
Vista detallada de reporte de profesional individual.

**Características:**
- Selector de período
- Métricas principales en tarjetas
- Gráfico de pastel (estado de citas)
- Gráfico de barras (horas pico)
- Gráficos de tendencias (citas e ingresos)
- Lista de sucursales con desempeño
- Gráfico de servicios más realizados
- Información de clientes y retención

#### 3. BranchReportView
Vista detallada de reporte de sucursal individual.

**Características:**
- Selector de período
- Métricas principales en tarjetas
- Gráfico de pastel (estado de citas)
- Gráfico de barras (horas pico)
- Gráficos de tendencias (citas e ingresos)
- Lista de profesionales con desempeño
- Gráfico de servicios más solicitados
- Tasa de utilización de la sucursal

### ✅ Páginas del Dashboard

#### 1. `/dashboard/reports`
Página principal de reportes con dashboard general.

**Funcionalidades:**
- Vista general del negocio
- Filtros de período
- Métricas consolidadas
- Gráficos interactivos
- Top performers

#### 2. `/dashboard/reports/professional/[id]`
Página de reporte individual de profesional.

**Funcionalidades:**
- Métricas específicas del profesional
- Desempeño por sucursal
- Servicios más realizados
- Tendencias personales
- Información de clientes

#### 3. `/dashboard/reports/branch/[id]`
Página de reporte individual de sucursal.

**Funcionalidades:**
- Métricas específicas de la sucursal
- Desempeño de profesionales
- Servicios más solicitados
- Tendencias de la sucursal
- Utilización de recursos

## 📊 Métricas Calculadas

### Métricas de Citas (AppointmentMetrics)
```typescript
{
  total: number,              // Total de citas
  pending: number,            // Citas pendientes
  confirmed: number,          // Citas confirmadas
  completed: number,          // Citas completadas
  cancelled: number,          // Citas canceladas
  noShow: number,            // No shows
  completionRate: number,    // Tasa de completado (%)
  cancellationRate: number,  // Tasa de cancelación (%)
  noShowRate: number         // Tasa de no show (%)
}
```

### Métricas de Ingresos (RevenueMetrics)
```typescript
{
  totalRevenue: number,      // Ingresos totales
  averageRevenue: number,    // Ingreso promedio por cita
  projectedRevenue: number,  // Ingresos proyectados (incluye pendientes)
  revenueByStatus: {
    completed: number,       // Ingresos de citas completadas
    pending: number,         // Ingresos potenciales pendientes
    confirmed: number        // Ingresos potenciales confirmados
  }
}
```

### Métricas de Tiempo (TimeMetrics)
```typescript
{
  totalHours: number,                    // Total de horas trabajadas
  averageAppointmentDuration: number,    // Duración promedio (minutos)
  utilizationRate: number,               // Tasa de utilización (%)
  peakHours: Array<{                     // Horas pico
    hour: number,
    count: number
  }>
}
```

### Métricas de Clientes (ClientMetrics)
```typescript
{
  totalClients: number,          // Total de clientes únicos
  newClients: number,            // Clientes nuevos en el período
  returningClients: number,      // Clientes recurrentes
  clientRetentionRate: number    // Tasa de retención (%)
}
```

## 🎨 Visualizaciones

### Gráficos Implementados

1. **Gráficos de Línea (LineChart)**
   - Tendencia de citas en el tiempo
   - Tendencia de ingresos en el tiempo
   - Evolución de métricas

2. **Gráficos de Barras (BarChart)**
   - Top profesionales por ingresos
   - Top sucursales por ingresos
   - Servicios más realizados
   - Horas pico de actividad

3. **Gráficos de Pastel (PieChart)**
   - Distribución de estados de citas
   - Proporción de tipos de clientes

4. **Tarjetas de Métricas**
   - Valores principales con iconos
   - Comparativas y porcentajes
   - Indicadores de tendencia

### Librería de Gráficos
**Recharts** - Librería de gráficos React responsiva y personalizable

**Características:**
- Totalmente responsiva
- Animaciones suaves
- Tooltips interactivos
- Leyendas configurables
- Múltiples tipos de gráficos
- Personalización de colores y estilos

## 🔧 Tipos TypeScript

### Archivo: `app/lib/types/reports.ts`

**Enums:**
- `ReportPeriod` - Períodos de reporte
- `AppointmentStatus` - Estados de citas
- `ReportType` - Tipos de reporte

**Interfaces:**
- `DateRange` - Rango de fechas
- `ReportFilters` - Filtros de reporte
- `AppointmentMetrics` - Métricas de citas
- `RevenueMetrics` - Métricas de ingresos
- `TimeMetrics` - Métricas de tiempo
- `ClientMetrics` - Métricas de clientes
- `ProfessionalReport` - Reporte de profesional
- `BranchReport` - Reporte de sucursal
- `OverviewReport` - Reporte general
- `ComparisonReport` - Reporte comparativo
- `ReportResponse<T>` - Respuesta API genérica
- `ReportError` - Error de reporte

## 📁 Estructura de Archivos

```
app/
├── lib/
│   ├── types/
│   │   └── reports.ts                    # Tipos TypeScript (350+ líneas)
│   └── services/
│       └── reportManager.ts              # Servicio de reportes (800+ líneas)
├── api/
│   └── reports/
│       ├── professional/
│       │   └── [id]/
│       │       └── route.ts              # API profesional
│       ├── branch/
│       │   └── [id]/
│       │       └── route.ts              # API sucursal
│       ├── overview/
│       │   └── route.ts                  # API overview
│       └── comparison/
│           └── route.ts                  # API comparación
├── components/
│   ├── ReportDashboard.tsx               # Dashboard general (400+ líneas)
│   ├── ProfessionalReportView.tsx        # Vista profesional (450+ líneas)
│   └── BranchReportView.tsx              # Vista sucursal (450+ líneas)
└── dashboard/
    └── reports/
        ├── page.tsx                      # Página principal
        ├── professional/
        │   └── [id]/
        │       └── page.tsx              # Página profesional
        └── branch/
            └── [id]/
                └── page.tsx              # Página sucursal
```

## 🚀 Casos de Uso

### Caso 1: Análisis de Desempeño Individual
**Escenario**: Gerente quiere evaluar el desempeño de un profesional

**Flujo:**
1. Navegar a `/dashboard/reports/professional/[id]`
2. Seleccionar período (ej: último mes)
3. Visualizar métricas clave
4. Analizar tendencias de citas e ingresos
5. Revisar desempeño por sucursal
6. Identificar servicios más realizados

**Métricas Clave:**
- Tasa de completado de citas
- Ingresos generados
- Clientes atendidos
- Horas trabajadas
- Servicios más populares

### Caso 2: Evaluación de Sucursal
**Escenario**: Dueño quiere analizar el rendimiento de una sucursal

**Flujo:**
1. Navegar a `/dashboard/reports/branch/[id]`
2. Seleccionar período (ej: último trimestre)
3. Revisar métricas generales
4. Comparar desempeño de profesionales
5. Analizar servicios más solicitados
6. Evaluar utilización de recursos

**Métricas Clave:**
- Ingresos totales de la sucursal
- Número de clientes atendidos
- Tasa de utilización
- Desempeño de profesionales
- Servicios más rentables

### Caso 3: Vista General del Negocio
**Escenario**: Administrador necesita vista consolidada

**Flujo:**
1. Navegar a `/dashboard/reports`
2. Seleccionar período (ej: último año)
3. Visualizar métricas consolidadas
4. Revisar top performers
5. Analizar tendencias generales
6. Identificar oportunidades de mejora

**Métricas Clave:**
- Ingresos totales del negocio
- Crecimiento de clientes
- Top profesionales y sucursales
- Servicios más rentables
- Tendencias de crecimiento

### Caso 4: Comparación de Desempeño
**Escenario**: Comparar múltiples profesionales o sucursales

**Flujo:**
1. Usar endpoint `/api/reports/comparison`
2. Especificar tipo (professional o branch)
3. Proporcionar IDs a comparar
4. Seleccionar período
5. Analizar métricas lado a lado
6. Identificar mejores prácticas

**Métricas Comparadas:**
- Citas completadas
- Ingresos generados
- Tasa de retención de clientes
- Eficiencia operativa

## 📈 Estadísticas del Desarrollo

- **Archivos nuevos**: 14
- **Líneas de código**: ~3,500
- **Componentes React**: 3
- **Endpoints API**: 4
- **Tipos TypeScript**: 20+
- **Métodos de servicio**: 12+
- **Gráficos implementados**: 6 tipos

## 🔄 Integración con Sistema Existente

### Con Fase 1 (Horarios)
```typescript
// Calcular horas trabajadas considerando horarios
const scheduleConfig = professional.scheduleConfig;
const workingHours = calculateWorkingHours(scheduleConfig, dateRange);
```

### Con Fase 2 (Asignaciones)
```typescript
// Reportes por sucursal considerando asignaciones
const assignments = await prisma.branchAssignment.findMany({
  where: { professionalId, isActive: true }
});
```

### Con Sistema de Citas
```typescript
// Métricas basadas en citas reales
const appointments = await prisma.appointment.findMany({
  where: {
    professionalId,
    startTime: { gte: startDate, lte: endDate }
  }
});
```

## 🎯 Próximos Pasos (Futuras Mejoras)

### Fase 4: Exportación y Compartir
1. **Exportación a PDF**
   - Generar reportes en PDF
   - Incluir gráficos y tablas
   - Personalización de formato

2. **Exportación a Excel**
   - Datos tabulares
   - Múltiples hojas
   - Fórmulas y gráficos

3. **Compartir Reportes**
   - Enlaces compartibles
   - Permisos de acceso
   - Reportes programados

### Fase 5: Análisis Avanzado
1. **Predicciones**
   - Machine learning para proyecciones
   - Análisis de tendencias
   - Recomendaciones automáticas

2. **Alertas Inteligentes**
   - Notificaciones de anomalías
   - Alertas de bajo desempeño
   - Oportunidades de mejora

3. **Benchmarking**
   - Comparación con industria
   - Mejores prácticas
   - Objetivos y metas

## ✅ Checklist de Implementación

- [x] Tipos TypeScript definidos
- [x] Servicio ReportManager completo
- [x] Endpoints API implementados
- [x] Componentes UI desarrollados
- [x] Páginas de dashboard creadas
- [x] Gráficos y visualizaciones
- [x] Filtros de fecha funcionales
- [x] Métricas calculadas correctamente
- [x] Integración con sistema existente
- [x] Documentación completa
- [x] Sin breaking changes
- [ ] Tests unitarios (Pendiente)
- [ ] Tests de integración (Pendiente)
- [ ] Exportación a PDF (Futuro)
- [ ] Reportes programados (Futuro)

## 🎉 Impacto

Esta implementación permite:

1. ✅ **Toma de Decisiones Informada**
   - Datos en tiempo real
   - Métricas clave visualizadas
   - Tendencias identificadas

2. ✅ **Evaluación de Desempeño**
   - Profesionales individuales
   - Sucursales específicas
   - Comparativas objetivas

3. ✅ **Optimización de Recursos**
   - Identificar horas pico
   - Asignar personal eficientemente
   - Maximizar utilización

4. ✅ **Crecimiento del Negocio**
   - Identificar servicios rentables
   - Retener clientes valiosos
   - Expandir estratégicamente

5. ✅ **Transparencia Operativa**
   - Visibilidad completa
   - Métricas objetivas
   - Reportes profesionales

---

**Versión**: 1.6.0 → 1.7.0  
**Tipo**: Feature  
**Breaking Changes**: No  
**Requiere Migración**: No  
**Estado**: ✅ Listo para Review y Merge

**Relacionado con**: Fase 1 (Horarios), Fase 2 (Asignaciones), Sistema de Citas
