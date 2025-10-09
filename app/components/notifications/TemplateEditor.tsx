
'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'
import { NotificationType, NotificationChannel } from '@/types/notifications'
import type { NotificationTemplate } from '@/types/notifications'

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  type: z.nativeEnum(NotificationType),
  channel: z.nativeEnum(NotificationChannel),
  subject: z.string().optional(),
  message: z.string().min(1, 'El mensaje es requerido'),
  isActive: z.boolean(),
  isDefault: z.boolean()
})

type FormValues = z.infer<typeof formSchema>

interface TemplateEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: NotificationTemplate
  onSave: (template: Partial<NotificationTemplate>) => Promise<boolean>
}

export function TemplateEditor({ open, onOpenChange, template, onSave }: TemplateEditorProps) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState('')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: NotificationType.CUSTOM,
      channel: NotificationChannel.WHATSAPP,
      subject: '',
      message: '',
      isActive: true,
      isDefault: false
    }
  })

  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        type: template.type as NotificationType,
        channel: template.channel as NotificationChannel,
        subject: template.subject || '',
        message: template.message,
        isActive: template.isActive,
        isDefault: template.isDefault
      })
    } else {
      form.reset({
        name: '',
        type: NotificationType.CUSTOM,
        channel: NotificationChannel.WHATSAPP,
        subject: '',
        message: '',
        isActive: true,
        isDefault: false
      })
    }
  }, [template, form])

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.message) {
        // Generar preview con datos de ejemplo
        let previewText = value.message
        previewText = previewText.replace(/\{\{clientName\}\}/g, 'Juan Pérez')
        previewText = previewText.replace(/\{\{clientFirstName\}\}/g, 'Juan')
        previewText = previewText.replace(/\{\{appointmentDate\}\}/g, '15/01/2024')
        previewText = previewText.replace(/\{\{appointmentTime\}\}/g, '10:00 AM')
        previewText = previewText.replace(/\{\{serviceName\}\}/g, 'Corte de cabello')
        previewText = previewText.replace(/\{\{businessName\}\}/g, 'Salón de Belleza XYZ')
        setPreview(previewText)
      } else {
        setPreview('')
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    const success = await onSave(values)
    setLoading(false)
    if (success) {
      onOpenChange(false)
      form.reset()
    }
  }

  const notificationTypes = [
    { value: NotificationType.APPOINTMENT_REMINDER, label: 'Recordatorio de Cita' },
    { value: NotificationType.APPOINTMENT_CONFIRMATION, label: 'Confirmación de Cita' },
    { value: NotificationType.APPOINTMENT_CANCELLATION, label: 'Cancelación de Cita' },
    { value: NotificationType.APPOINTMENT_RESCHEDULED, label: 'Cita Reprogramada' },
    { value: NotificationType.PAYMENT_REMINDER, label: 'Recordatorio de Pago' },
    { value: NotificationType.PAYMENT_CONFIRMATION, label: 'Confirmación de Pago' },
    { value: NotificationType.PROMOTION, label: 'Promoción' },
    { value: NotificationType.BIRTHDAY, label: 'Cumpleaños' },
    { value: NotificationType.CUSTOM, label: 'Personalizado' }
  ]

  const notificationChannels = [
    { value: NotificationChannel.EMAIL, label: 'Email' },
    { value: NotificationChannel.SMS, label: 'SMS' },
    { value: NotificationChannel.WHATSAPP, label: 'WhatsApp' },
    { value: NotificationChannel.PUSH, label: 'Push' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Editar Plantilla' : 'Nueva Plantilla'}
          </DialogTitle>
          <DialogDescription>
            Crea o edita una plantilla de notificación. Usa variables para personalizar el mensaje.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Plantilla</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Recordatorio 24h antes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Canal</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un canal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {notificationChannels.map((channel) => (
                          <SelectItem key={channel.value} value={channel.value}>
                            {channel.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asunto (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Solo para Email" {...field} />
                    </FormControl>
                    <FormDescription>
                      Solo se usa para notificaciones por email
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensaje</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe tu mensaje aquí. Usa variables como {{clientName}}, {{appointmentDate}}, etc."
                      className="min-h-[150px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Usa variables entre dobles llaves para personalizar el mensaje
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {preview && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Vista Previa</CardTitle>
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

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Plantilla Activa</FormLabel>
                        <FormDescription>
                          Solo las plantillas activas pueden ser usadas
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Plantilla por Defecto</FormLabel>
                        <FormDescription>
                          Se usará automáticamente para este tipo de notificación
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {template ? 'Actualizar' : 'Crear'} Plantilla
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
