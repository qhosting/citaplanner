
'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useNotifications } from '@/hooks/useNotifications'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  whatsappEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  evolutionApiUrl: z.string().optional(),
  evolutionApiKey: z.string().optional(),
  evolutionInstanceName: z.string().optional(),
  autoRemindersEnabled: z.boolean(),
  reminderTimes: z.string(),
  autoConfirmationEnabled: z.boolean()
})

type FormValues = z.infer<typeof formSchema>

export function ConfigurationTab() {
  const { fetchSettings, updateSettings, loading } = useNotifications()
  const [initialLoading, setInitialLoading] = useState(true)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailEnabled: false,
      smsEnabled: false,
      whatsappEnabled: false,
      pushEnabled: false,
      evolutionApiUrl: '',
      evolutionApiKey: '',
      evolutionInstanceName: '',
      autoRemindersEnabled: false,
      reminderTimes: '60,1440',
      autoConfirmationEnabled: false
    }
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const settings = await fetchSettings()
    if (settings) {
      form.reset({
        emailEnabled: settings.emailEnabled,
        smsEnabled: settings.smsEnabled,
        whatsappEnabled: settings.whatsappEnabled,
        pushEnabled: settings.pushEnabled,
        evolutionApiUrl: settings.evolutionApiUrl || '',
        evolutionApiKey: settings.evolutionApiKey || '',
        evolutionInstanceName: settings.evolutionInstanceName || '',
        autoRemindersEnabled: settings.autoRemindersEnabled,
        reminderTimes: settings.reminderTimes.join(','),
        autoConfirmationEnabled: settings.autoConfirmationEnabled
      })
    }
    setInitialLoading(false)
  }

  const onSubmit = async (values: FormValues) => {
    const reminderTimesArray = values.reminderTimes
      .split(',')
      .map(t => parseInt(t.trim()))
      .filter(t => !isNaN(t))

    await updateSettings({
      ...values,
      reminderTimes: reminderTimesArray
    })
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Canales de Notificación</CardTitle>
            <CardDescription>
              Habilita o deshabilita los diferentes canales de comunicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="emailEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Email</FormLabel>
                    <FormDescription>
                      Enviar notificaciones por correo electrónico
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="smsEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">SMS</FormLabel>
                    <FormDescription>
                      Enviar notificaciones por mensaje de texto
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsappEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">WhatsApp</FormLabel>
                    <FormDescription>
                      Enviar notificaciones por WhatsApp
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pushEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Notificaciones Push</FormLabel>
                    <FormDescription>
                      Enviar notificaciones push al navegador
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración de Evolution API</CardTitle>
            <CardDescription>
              Configura la conexión con Evolution API para WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="evolutionApiUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la API</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.evolution.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL base de tu instancia de Evolution API
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="evolutionApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Tu API Key" {...field} />
                  </FormControl>
                  <FormDescription>
                    Clave de autenticación de Evolution API
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="evolutionInstanceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de Instancia</FormLabel>
                  <FormControl>
                    <Input placeholder="mi-instancia" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nombre de tu instancia de WhatsApp en Evolution API
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recordatorios Automáticos</CardTitle>
            <CardDescription>
              Configura el envío automático de recordatorios de citas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="autoRemindersEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Habilitar Recordatorios</FormLabel>
                    <FormDescription>
                      Enviar recordatorios automáticos antes de las citas
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reminderTimes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiempos de Recordatorio (minutos)</FormLabel>
                  <FormControl>
                    <Input placeholder="60,1440" {...field} />
                  </FormControl>
                  <FormDescription>
                    Minutos antes de la cita para enviar recordatorios (separados por comas).
                    Ejemplo: 60,1440 = 1 hora y 1 día antes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autoConfirmationEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Auto-confirmación</FormLabel>
                    <FormDescription>
                      Enviar confirmación automática al crear una cita
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Configuración
          </Button>
        </div>
      </form>
    </Form>
  )
}
