
'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import type {
  NotificationSettings,
  NotificationTemplate,
  NotificationLog,
  NotificationStats,
  SendNotificationRequest
} from '@/types/notifications'

export function useNotifications() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch notification settings
  const fetchSettings = useCallback(async (): Promise<NotificationSettings | null> => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/notifications/settings')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar configuración')
      }
      
      return data.data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Update notification settings
  const updateSettings = useCallback(async (settings: Partial<NotificationSettings>): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar configuración')
      }
      
      toast.success('Configuración actualizada correctamente')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch templates
  const fetchTemplates = useCallback(async (): Promise<NotificationTemplate[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/notifications/templates')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar plantillas')
      }
      
      return data.data || []
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      toast.error(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Create template
  const createTemplate = useCallback(async (template: Partial<NotificationTemplate>): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/notifications/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear plantilla')
      }
      
      toast.success('Plantilla creada correctamente')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Update template
  const updateTemplate = useCallback(async (id: string, template: Partial<NotificationTemplate>): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/notifications/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar plantilla')
      }
      
      toast.success('Plantilla actualizada correctamente')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete template
  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/notifications/templates/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar plantilla')
      }
      
      toast.success('Plantilla eliminada correctamente')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch logs
  const fetchLogs = useCallback(async (params?: {
    type?: string
    channel?: string
    status?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<{ logs: NotificationLog[], total: number }> => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      if (params?.type) queryParams.append('type', params.type)
      if (params?.channel) queryParams.append('channel', params.channel)
      if (params?.status) queryParams.append('status', params.status)
      if (params?.startDate) queryParams.append('startDate', params.startDate)
      if (params?.endDate) queryParams.append('endDate', params.endDate)
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())

      const response = await fetch(`/api/notifications/logs?${queryParams.toString()}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar historial')
      }
      
      return {
        logs: data.data || [],
        total: data.total || 0
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      toast.error(message)
      return { logs: [], total: 0 }
    } finally {
      setLoading(false)
    }
  }, [])

  // Send notification
  const sendNotification = useCallback(async (request: SendNotificationRequest): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const endpoint = request.channel === 'WHATSAPP' 
        ? '/api/notifications/whatsapp/send-bulk'
        : '/api/notifications/push/send-bulk'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar notificación')
      }
      
      toast.success('Notificación enviada correctamente')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    fetchSettings,
    updateSettings,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    fetchLogs,
    sendNotification
  }
}
