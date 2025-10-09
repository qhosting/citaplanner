
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Loader2, Send } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { RecipientSelector } from './RecipientSelector'
import { NotificationChannel, NotificationType } from '@/types/notifications'
import type { NotificationTemplate } from '@/types/notifications'

const formSchema = z.object({
  channel: z.nativeEnum(NotificationChannel),
  recipients: z.array(z.string()).min(1, 'Selecciona al menos un destinatario'),
  type: z.nativeEnum(NotificationType),
  templateId: z.string().optional(),
  customSubject: z.string().optional(),
  customMessage: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

export function SendTab() {
  const { fetchTemplates, sendNotification, loading } = useNotifications()
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<NotificationTemplate[]>([])
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [preview, setPreview] = useState('')
  const [useCustomMessage, setUseCustomMessage] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      channel: NotificationChannel.WHATSAPP,
      recipients: [],
      type: NotificationType.CUSTOM,
      templateId: '',
      customSubject: '',
      customMessage: ''
    }
  })

  const watchChannel = form.watch('channel')
  const watchType = form.watch('type')
  const watchTemplateId = form.watch('templateId')
  const watchCustomMessage = form.watch('customMessage')

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    // Filtrar plantillas por canal y tipo
    const filtered = templates.filter(
      t => t.channel === watchChannel && t.type === watchType && t.isActive
    )
    setFilteredTemplates(filtered)

    // Si hay una plantilla por defecto, seleccionarla
    const defaultTemplate = filtered.find(t => t.isDefault)
    if (defaultTemplate && !useCustomMessage) {
      form.setValue('templateId', defaultTemplate.id)
    }
  }, [watchChannel, watchType, templates, useCustomMessage])

  useEffect(() => {
    // Generar preview
    if (useCustomMessage && watchCustomMessage) {
      generatePreview(watchCustomMessage)
    } else if (watchTemplateId) {
      const template = templates.find(t => t.id === watchTemplateId)
      if (template) {
        generatePreview(template.message)
      }
    }
  }, [watchTemplateId, watchCustomMessage, useCustomMessage, templates])

  const loadTemplates = async () => {
    const data = await fetchTemplates()
    setTemplates(data)
  }

  const generatePreview = (message: string) => {
    let previewText = message
    previewText = previewText.replace(/\{\{clientName\}\}/g, 'Juan Pérez')
    previewText = previewText.replace(/\{\{clientFirstName\}\}/g, 'Juan')
    previewText = previewText.replace(/\{\{appointmentDate\}\}/g, '15/01/2024')
    previewText = previewText.replace(/\{\{appointmentTime\}\}/g, '10:00 AM')
    previewText = previewText.replace(/\{\{serviceName\}\}/g, 'Corte de cabello')
    previewText = previewText.replace(/\{\{businessName\}\}/g, 'Salón de Belleza XYZ')
    setPreview(previewText)
  }

  const onSubmit = async (values: FormValues) => {
    setConfirmDialogOpen(true)
  }

  const handleConfirmSend = async () => {
    const values = form.getValues()
    const success = await sendNotification(values)
    setConfirmDialogOpen(false)
    if (success) {
      form.reset()
      setUseCustomMessage(false)
    }
  }

  const notificationTypes = [
    { value: NotificationType.APPOINTMENT_REMINDER, label: 'Recordatorio de Cita' },
    { value: NotificationType.APPOINTMENT_CONFIRMATION, label: 'Confirmación de Cita' },
    { value: NotificationType.PROMOTION, label: 'Promoción' },
    { value: NotificationType.BIRTHDAY, label: 'Cumpleaños' },
    { value: NotificationType.CUSTOM, label: 'Personalizado' }
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Paso 1: Seleccionar Canal</CardTitle>
            <CardDescription>
              Elige el canal por el que deseas enviar la notificación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canal de Notificación</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un canal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NotificationChannel.WHATSAPP}>WhatsApp</SelectItem>
                      <SelectItem value={NotificationChannel.PUSH}>Notificación Push</SelectItem>
                      <SelectItem value={NotificationChannel.EMAIL}>Email</SelectItem>
                      <SelectItem value={NotificationChannel.SMS}>SMS</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paso 2: Seleccionar Destinatarios</CardTitle>
            <CardDescription>
              Elige los clientes que recibirán la notificación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="recipients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destinatarios</FormLabel>
                  <FormControl>
                    <RecipientSelector
                      value={field.value}
                      onChange={field.onChange}
                      channel={watchChannel}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paso 3: Configurar Mensaje</CardTitle>
            <CardDescription>
              Selecciona una plantilla o escribe un mensaje personalizado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Notificación</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {notificationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useCustomMessage"
                checked={useCustomMessage}
                onChange={(e) => setUseCustomMessage(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="useCustomMessage" className="text-sm font-medium">
                Usar mensaje personalizado
              </label>
            </div>

            {!useCustomMessage ? (
              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plantilla</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una plantilla" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredTemplates.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500">
                            No hay plantillas disponibles para este canal y tipo
                          </div>
                        ) : (
                          filteredTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                              {template.isDefault && ' (Por defecto)'}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <>
                {watchChannel === NotificationChannel.EMAIL && (
                  <FormField
                    control={form.control}
                    name="customSubject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asunto</FormLabel>
                        <FormControl>
                          <Input placeholder="Asunto del email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="customMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensaje</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Escribe tu mensaje aquí..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Puedes usar variables como {'{{'} clientName {'}}'}, {'{{'} appointmentDate {'}}'}, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>

        {preview && (
          <Card>
            <CardHeader>
              <CardTitle>Paso 4: Vista Previa</CardTitle>
              <CardDescription>
                Así se verá el mensaje con datos de ejemplo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm whitespace-pre-wrap">{preview}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={loading || form.watch('recipients').length === 0}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Send className="mr-2 h-4 w-4" />
            Enviar Notificación
          </Button>
        </div>
      </form>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Envío</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas enviar esta notificación a {form.watch('recipients').length} destinatario{form.watch('recipients').length !== 1 ? 's' : ''}?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSend}>
              Enviar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  )
}
