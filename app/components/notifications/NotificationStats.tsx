
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import type { NotificationStats } from '@/types/notifications'

export function NotificationStats() {
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
    read: 0,
    deliveryRate: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/notifications/logs')
      const data = await response.json()
      
      if (response.ok && data.data) {
        const logs = data.data
        const total = logs.length
        const sent = logs.filter((l: any) => l.status === 'SENT' || l.status === 'DELIVERED' || l.status === 'READ').length
        const delivered = logs.filter((l: any) => l.status === 'DELIVERED' || l.status === 'READ').length
        const failed = logs.filter((l: any) => l.status === 'FAILED').length
        const read = logs.filter((l: any) => l.status === 'READ').length
        const deliveryRate = total > 0 ? (delivered / total) * 100 : 0

        setStats({
          total,
          sent,
          delivered,
          failed,
          read,
          deliveryRate
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Enviadas',
      value: stats.total,
      icon: Bell,
      color: 'text-blue-600'
    },
    {
      title: 'Entregadas',
      value: stats.delivered,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Fallidas',
      value: stats.failed,
      icon: XCircle,
      color: 'text-red-600'
    },
    {
      title: 'Tasa de Entrega',
      value: `${stats.deliveryRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cargando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
