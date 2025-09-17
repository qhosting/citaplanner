
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Building2, 
  Palette,
  Bell,
  CreditCard,
  Users,
  Calendar,
  Save,
  Upload,
  Settings as SettingsIcon
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

export default function SettingsPage() {
  const [companySettings, setCompanySettings] = useState({
    name: 'Bella Estética',
    email: 'contacto@bellaestética.com',
    phone: '+52 55 1234 5678',
    address: 'Av. Reforma 123, CDMX',
    website: 'www.bellaestética.com',
    description: 'Centro de belleza y bienestar especializado en tratamientos faciales, corporales y servicios de spa.'
  })

  const [bookingSettings, setBookingSettings] = useState({
    allowOnlineBooking: true,
    requireClientPhone: true,
    requireClientEmail: false,
    bookingAdvanceDays: 30,
    minAdvanceHours: 2,
    allowCancellation: true,
    cancellationHours: 24
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailReminders: true,
    smsReminders: true,
    whatsappReminders: false,
    reminderHours: 24,
    confirmationEmails: true,
    marketingEmails: false
  })

  const [appearanceSettings, setAppearanceSettings] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#EF4444',
    logo: null,
    theme: 'light'
  })

  const handleSave = (section: string) => {
    // Aquí iría la lógica para guardar la configuración
    alert(`Configuración de ${section} guardada exitosamente`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona la configuración de tu empresa y servicios
        </p>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="booking">Reservas</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Información de la Empresa
              </CardTitle>
              <CardDescription>
                Configura los datos básicos de tu negocio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nombre de la empresa</Label>
                  <Input
                    id="companyName"
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email principal</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Teléfono</Label>
                  <Input
                    id="companyPhone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Sitio web</Label>
                  <Input
                    id="companyWebsite"
                    value={companySettings.website}
                    onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Dirección</Label>
                <Input
                  id="companyAddress"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyDescription">Descripción</Label>
                <Textarea
                  id="companyDescription"
                  value={companySettings.description}
                  onChange={(e) => setCompanySettings({...companySettings, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <Button onClick={() => handleSave('empresa')}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Configuración de Reservas
              </CardTitle>
              <CardDescription>
                Personaliza cómo funcionan las reservas en línea
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Permitir reservas en línea</Label>
                  <p className="text-sm text-muted-foreground">
                    Los clientes pueden agendar citas desde el portal web
                  </p>
                </div>
                <Switch
                  checked={bookingSettings.allowOnlineBooking}
                  onCheckedChange={(checked) => setBookingSettings({...bookingSettings, allowOnlineBooking: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Requerir teléfono</Label>
                  <p className="text-sm text-muted-foreground">
                    Campo obligatorio para completar la reserva
                  </p>
                </div>
                <Switch
                  checked={bookingSettings.requireClientPhone}
                  onCheckedChange={(checked) => setBookingSettings({...bookingSettings, requireClientPhone: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Requerir email</Label>
                  <p className="text-sm text-muted-foreground">
                    Campo obligatorio para completar la reserva
                  </p>
                </div>
                <Switch
                  checked={bookingSettings.requireClientEmail}
                  onCheckedChange={(checked) => setBookingSettings({...bookingSettings, requireClientEmail: checked})}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="advanceDays">Días de anticipación máxima</Label>
                  <Select value={bookingSettings.bookingAdvanceDays.toString()} onValueChange={(value) => setBookingSettings({...bookingSettings, bookingAdvanceDays: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 días</SelectItem>
                      <SelectItem value="15">15 días</SelectItem>
                      <SelectItem value="30">30 días</SelectItem>
                      <SelectItem value="60">60 días</SelectItem>
                      <SelectItem value="90">90 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minAdvance">Horas mínimas de anticipación</Label>
                  <Select value={bookingSettings.minAdvanceHours.toString()} onValueChange={(value) => setBookingSettings({...bookingSettings, minAdvanceHours: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hora</SelectItem>
                      <SelectItem value="2">2 horas</SelectItem>
                      <SelectItem value="4">4 horas</SelectItem>
                      <SelectItem value="24">24 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Permitir cancelaciones</Label>
                  <p className="text-sm text-muted-foreground">
                    Los clientes pueden cancelar sus citas
                  </p>
                </div>
                <Switch
                  checked={bookingSettings.allowCancellation}
                  onCheckedChange={(checked) => setBookingSettings({...bookingSettings, allowCancellation: checked})}
                />
              </div>
              
              {bookingSettings.allowCancellation && (
                <div className="space-y-2">
                  <Label htmlFor="cancellationHours">Horas mínimas para cancelación</Label>
                  <Select value={bookingSettings.cancellationHours.toString()} onValueChange={(value) => setBookingSettings({...bookingSettings, cancellationHours: parseInt(value)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 horas</SelectItem>
                      <SelectItem value="4">4 horas</SelectItem>
                      <SelectItem value="12">12 horas</SelectItem>
                      <SelectItem value="24">24 horas</SelectItem>
                      <SelectItem value="48">48 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <Button onClick={() => handleSave('reservas')}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Configuración de Notificaciones
              </CardTitle>
              <CardDescription>
                Configura cómo y cuándo se envían las notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Recordatorios por email</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar recordatorios de citas por correo electrónico
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.emailReminders}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailReminders: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Recordatorios por SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar recordatorios de citas por mensaje de texto
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.smsReminders}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, smsReminders: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Recordatorios por WhatsApp</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar recordatorios de citas por WhatsApp
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.whatsappReminders}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, whatsappReminders: checked})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reminderHours">Horas antes de enviar recordatorio</Label>
                <Select value={notificationSettings.reminderHours.toString()} onValueChange={(value) => setNotificationSettings({...notificationSettings, reminderHours: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 horas</SelectItem>
                    <SelectItem value="4">4 horas</SelectItem>
                    <SelectItem value="12">12 horas</SelectItem>
                    <SelectItem value="24">24 horas</SelectItem>
                    <SelectItem value="48">48 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Emails de confirmación</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar confirmación automática al agendar cita
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.confirmationEmails}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, confirmationEmails: checked})}
                />
              </div>
              
              <Button onClick={() => handleSave('notificaciones')}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Personalización de Apariencia
              </CardTitle>
              <CardDescription>
                Personaliza los colores y la apariencia de tu portal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Logo de la empresa</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600">
                    Arrastra tu logo aquí o <button className="text-blue-600 underline">selecciona un archivo</button>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    PNG, JPG hasta 5MB. Tamaño recomendado: 200x80px
                  </p>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Color primario</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={appearanceSettings.primaryColor}
                      onChange={(e) => setAppearanceSettings({...appearanceSettings, primaryColor: e.target.value})}
                      className="w-12 h-10 p-1 border-0"
                    />
                    <Input
                      value={appearanceSettings.primaryColor}
                      onChange={(e) => setAppearanceSettings({...appearanceSettings, primaryColor: e.target.value})}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Color secundario</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={appearanceSettings.secondaryColor}
                      onChange={(e) => setAppearanceSettings({...appearanceSettings, secondaryColor: e.target.value})}
                      className="w-12 h-10 p-1 border-0"
                    />
                    <Input
                      value={appearanceSettings.secondaryColor}
                      onChange={(e) => setAppearanceSettings({...appearanceSettings, secondaryColor: e.target.value})}
                      placeholder="#EF4444"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select value={appearanceSettings.theme} onValueChange={(value) => setAppearanceSettings({...appearanceSettings, theme: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Oscuro</SelectItem>
                    <SelectItem value="auto">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={() => handleSave('apariencia')}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="h-5 w-5 mr-2" />
                Integraciones
              </CardTitle>
              <CardDescription>
                Configura las integraciones con servicios externos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">OpenPay</h4>
                          <p className="text-sm text-muted-foreground">Procesamiento de pagos</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Procesa pagos con tarjetas de crédito y débito de forma segura
                    </p>
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Bell className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">LabsMobile</h4>
                          <p className="text-sm text-muted-foreground">Envío de SMS</p>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Envía recordatorios y notificaciones por mensaje de texto
                    </p>
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">EvolutionAPI</h4>
                          <p className="text-sm text-muted-foreground">WhatsApp Business</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Envía mensajes y recordatorios por WhatsApp
                    </p>
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
