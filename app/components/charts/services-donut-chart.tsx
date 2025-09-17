
'use client'

import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface ServicesDonutChartProps {
  data: {
    service: string
    count: number
    revenue: number
  }[]
}

export function ServicesDonutChart({ data }: ServicesDonutChartProps) {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ]

  const chartData = {
    labels: data.map(item => item.service),
    datasets: [
      {
        data: data.map(item => item.count),
        backgroundColor: colors.slice(0, data.length),
        borderColor: colors.slice(0, data.length),
        borderWidth: 2,
        hoverBorderWidth: 3
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15
        }
      },
      title: {
        display: true,
        text: 'Servicios Más Solicitados'
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
            const count = data[dataIndex].count
            const revenue = data[dataIndex].revenue
            const percentage = ((count / data.reduce((sum, item) => sum + item.count, 0)) * 100).toFixed(1)
            
            return [
              `Citas: ${count} (${percentage}%)`,
              `Ingresos: ${new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN'
              }).format(revenue)}`
            ]
          }
        }
      }
    },
    cutout: '60%',
    animation: {
      animateRotate: true,
      animateScale: true
    }
  }

  const totalAppointments = data.reduce((sum, item) => sum + item.count, 0)
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)

  return (
    <div className="relative">
      <div className="h-80 w-full">
        <Doughnut data={chartData} options={options} />
      </div>
      
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{totalAppointments}</div>
          <div className="text-sm text-gray-500">Total Citas</div>
          <div className="text-lg font-semibold text-green-600 mt-1">
            {new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              minimumFractionDigits: 0
            }).format(totalRevenue)}
          </div>
        </div>
      </div>
    </div>
  )
}
