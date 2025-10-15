/**
 * DashboardCharts Component
 * 
 * Componente placeholder para gráficos del dashboard
 * NOTA: Los datos reales y gráficos completos se implementarán en fases posteriores
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';

export default function DashboardCharts() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
      {/* Gráfico de Citas por Día */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Citas por Día
          </CardTitle>
          <p className="text-sm text-gray-500">
            Últimos 7 días
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-dashed border-blue-200">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-600">
                Gráfico de citas
              </p>
              <p className="text-xs text-blue-500 mt-1">
                Implementación en Fase 5
              </p>
            </div>
          </div>
          {/* Mock data para visualización */}
          <div className="mt-4 flex justify-between text-xs text-gray-600">
            <div className="text-center">
              <div className="font-semibold text-blue-600">Lun</div>
              <div className="mt-1">12</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600">Mar</div>
              <div className="mt-1">15</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600">Mié</div>
              <div className="mt-1">18</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600">Jue</div>
              <div className="mt-1">14</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600">Vie</div>
              <div className="mt-1">16</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600">Sáb</div>
              <div className="mt-1">10</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600">Dom</div>
              <div className="mt-1">8</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Ingresos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Ingresos Mensuales
          </CardTitle>
          <p className="text-sm text-gray-500">
            Evolución mensual
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-dashed border-green-200">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-green-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-600">
                Gráfico de ingresos
              </p>
              <p className="text-xs text-green-500 mt-1">
                Implementación en Fase 5
              </p>
            </div>
          </div>
          {/* Mock data para visualización */}
          <div className="mt-4 flex justify-between text-xs text-gray-600">
            <div className="text-center">
              <div className="font-semibold text-green-600">Ene</div>
              <div className="mt-1">$95K</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">Feb</div>
              <div className="mt-1">$105K</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">Mar</div>
              <div className="mt-1">$118K</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">Abr</div>
              <div className="mt-1">$125K</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribución de Servicios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-600" />
            Servicios Populares
          </CardTitle>
          <p className="text-sm text-gray-500">
            Top 5 servicios más solicitados
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-dashed border-purple-200">
            <div className="text-center">
              <PieChart className="h-12 w-12 text-purple-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-purple-600">
                Distribución de servicios
              </p>
              <p className="text-xs text-purple-500 mt-1">
                Implementación en Fase 5
              </p>
            </div>
          </div>
          {/* Mock data para visualización */}
          <div className="mt-4 space-y-2">
            {['Corte de cabello', 'Tinte', 'Manicure', 'Pedicure', 'Masaje'].map((service, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{service}</span>
                <span className="font-semibold text-purple-600">{[35, 25, 18, 12, 10][index]}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actividad Reciente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-600" />
            Actividad Reciente
          </CardTitle>
          <p className="text-sm text-gray-500">
            Últimas acciones del sistema
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: 'Hace 5 min', action: 'Nueva cita agendada', client: 'María García', color: 'blue' },
              { time: 'Hace 15 min', action: 'Pago registrado', client: 'Juan Pérez', color: 'green' },
              { time: 'Hace 30 min', action: 'Cita completada', client: 'Ana López', color: 'purple' },
              { time: 'Hace 1 hora', action: 'Nueva cita agendada', client: 'Carlos Ruiz', color: 'blue' },
              { time: 'Hace 2 horas', action: 'Cliente registrado', client: 'Laura Martínez', color: 'indigo' }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                <div className={`w-2 h-2 mt-1 rounded-full bg-${item.color}-500`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.action}</p>
                  <p className="text-xs text-gray-500">{item.client}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
