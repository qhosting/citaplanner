
'use client'

import { useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface ProfessionalPerformanceChartProps {
  data: {
    professional: string
    appointments: number
    revenue: number
    rating: number
    completionRate: number
  }[]
}

export function ProfessionalPerformanceChart({ data }: ProfessionalPerformanceChartProps) {
  const chartData = {
    labels: data.map(item => item.professional),
    datasets: [
      {
        label: 'Citas Realizadas',
        data: data.map(item => item.appointments),
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        label: 'Ingresos Generados',
        data: data.map(item => item.revenue / 100), // Escalar para visualización
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1,
        yAxisID: 'y1'
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Rendimiento por Profesional'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const dataIndex = context.dataIndex
            const professional = data[dataIndex]
            
            if (context.dataset.label === 'Citas Realizadas') {
              return `${context.dataset.label}: ${professional.appointments}`
            } else {
              return `${context.dataset.label}: ${new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN'
              }).format(professional.revenue)}`
            }
          },
          afterLabel: function(context: any) {
            const dataIndex = context.dataIndex
            const professional = data[dataIndex]
            return [
              `Tasa de Finalización: ${professional.completionRate}%`,
              `Calificación: ${professional.rating}/5 ⭐`
            ]
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número de Citas'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.2)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Ingresos (x100 MXN)'
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value: any) {
            return `$${(value * 100).toFixed(0)}`
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.2)'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  }

  return (
    <div className="space-y-4">
      <div className="h-80 w-full">
        <Bar data={chartData} options={options} />
      </div>
      
      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {data.map((professional, index) => (
          <div key={professional.professional} className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-2">{professional.professional}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Citas:</span>
                <span className="font-medium">{professional.appointments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ingresos:</span>
                <span className="font-medium text-green-600">
                  {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                    minimumFractionDigits: 0
                  }).format(professional.revenue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Finalización:</span>
                <span className="font-medium">{professional.completionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Calificación:</span>
                <span className="font-medium flex items-center">
                  {professional.rating} <span className="ml-1 text-yellow-500">⭐</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
