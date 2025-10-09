
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { TemplateEditor } from './TemplateEditor'
import { NotificationType, NotificationChannel } from '@/types/notifications'
import type { NotificationTemplate } from '@/types/notifications'
import { toast } from 'sonner'

export function TemplatesTab() {
  const { fetchTemplates, createTemplate, updateTemplate, deleteTemplate, loading } = useNotifications()
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<NotificationTemplate[]>([])
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    type: 'all',
    channel: 'all',
    active: 'all'
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [templates, filters])

  const loadTemplates = async () => {
    const data = await fetchTemplates()
    setTemplates(data)
  }

  const applyFilters = () => {
    let filtered = [...templates]

    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type)
    }

    if (filters.channel !== 'all') {
      filtered = filtered.filter(t => t.channel === filters.channel)
    }

    if (filters.active !== 'all') {
      const isActive = filters.active === 'true'
      filtered = filtered.filter(t => t.isActive === isActive)
    }

    setFilteredTemplates(filtered)
  }

  const handleCreate = () => {
    setSelectedTemplate(undefined)
    setEditorOpen(true)
  }

  const handleEdit = (template: NotificationTemplate) => {
    setSelectedTemplate(template)
    setEditorOpen(true)
  }

  const handleSave = async (template: Partial<NotificationTemplate>) => {
    let success = false
    if (selectedTemplate) {
      success = await updateTemplate(selectedTemplate.id, template)
    } else {
      success = await createTemplate(template)
    }

    if (success) {
      await loadTemplates()
    }

    return success
  }

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (templateToDelete) {
      const success = await deleteTemplate(templateToDelete)
      if (success) {
        await loadTemplates()
      }
    }
    setDeleteDialogOpen(false)
    setTemplateToDelete(null)
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      APPOINTMENT_REMINDER: 'Recordatorio',
      APPOINTMENT_CONFIRMATION: 'Confirmación',
      APPOINTMENT_CANCELLATION: 'Cancelación',
      APPOINTMENT_RESCHEDULED: 'Reprogramada',
      PAYMENT_REMINDER: 'Pago Recordatorio',
      PAYMENT_CONFIRMATION: 'Pago Confirmación',
      PROMOTION: 'Promoción',
      BIRTHDAY: 'Cumpleaños',
      CUSTOM: 'Personalizado'
    }
    return labels[type] || type
  }

  const getChannelLabel = (channel: string) => {
    const labels: Record<string, string> = {
      EMAIL: 'Email',
      SMS: 'SMS',
      WHATSAPP: 'WhatsApp',
      PUSH: 'Push'
    }
    return labels[channel] || channel
  }

  const getChannelColor = (channel: string) => {
    const colors: Record<string, string> = {
      EMAIL: 'bg-blue-100 text-blue-800',
      SMS: 'bg-green-100 text-green-800',
      WHATSAPP: 'bg-emerald-100 text-emerald-800',
      PUSH: 'bg-purple-100 text-purple-800'
    }
    return colors[channel] || 'bg-gray-100 text-gray-800'
  }

  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plantillas de Notificaciones</CardTitle>
              <CardDescription>
                Gestiona las plantillas de mensajes para diferentes tipos de notificaciones
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Plantilla
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value={NotificationType.APPOINTMENT_REMINDER}>Recordatorio</SelectItem>
                <SelectItem value={NotificationType.APPOINTMENT_CONFIRMATION}>Confirmación</SelectItem>
                <SelectItem value={NotificationType.APPOINTMENT_CANCELLATION}>Cancelación</SelectItem>
                <SelectItem value={NotificationType.PROMOTION}>Promoción</SelectItem>
                <SelectItem value={NotificationType.CUSTOM}>Personalizado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.channel} onValueChange={(value) => setFilters({ ...filters, channel: value })}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los canales</SelectItem>
                <SelectItem value={NotificationChannel.EMAIL}>Email</SelectItem>
                <SelectItem value={NotificationChannel.SMS}>SMS</SelectItem>
                <SelectItem value={NotificationChannel.WHATSAPP}>WhatsApp</SelectItem>
                <SelectItem value={NotificationChannel.PUSH}>Push</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.active} onValueChange={(value) => setFilters({ ...filters, active: value })}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Activas</SelectItem>
                <SelectItem value="false">Inactivas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Por Defecto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No se encontraron plantillas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{getTypeLabel(template.type)}</TableCell>
                      <TableCell>
                        <Badge className={getChannelColor(template.channel)}>
                          {getChannelLabel(template.channel)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={template.isActive ? 'default' : 'secondary'}>
                          {template.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {template.isDefault && (
                          <Badge variant="outline">Por defecto</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(template)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(template.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <TemplateEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        template={selectedTemplate}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La plantilla será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
