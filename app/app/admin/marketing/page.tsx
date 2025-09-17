
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  MessageSquare, 
  Plus,
  Send,
  Users,
  TrendingUp,
  Gift,
  Star,
  Phone,
  Eye,
  Edit
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'react-hot-toast'

const mockCampaigns = [
  {
    id: 1,
    name: 'Promoción Septiembre',
    type: 'email',
    status: 'sent',
    recipients: 1247,
    opened: 623,
    clicked: 89,
    sentDate: '2024-09-15',
    description: '20% descuento en servicios faciales'
  },
  {
    id: 2,
    name: 'Recordatorio Citas',
    type: 'sms',
    status: 'active',
    recipients: 342,
    opened: 342,
    clicked: 0,
    sentDate: '2024-09-17',
    description: 'Recordatorio automático 24h antes'
  },
  {
    id: 3,
    name: 'WhatsApp Promocional',
    type: 'whatsapp',
    status: 'draft',
    recipients: 856,
    opened: 0,
    clicked: 0,
    sentDate: null,
    description: 'Nuevos tratamientos de temporada'
  }
]

const mockGiftCards = [
  {
    id: 1,
    code: 'GC001',
    amount: 500,
    balance: 500,
    status: 'active',
    client: 'María González',
    issuedDate: '2024-09-10',
    expiryDate: '2025-09-10'
  },
  {
    id: 2,
    code: 'GC002',
    amount: 750,
    balance: 250,
    status: 'active',
    client: 'Carlos Ruiz',
    issuedDate: '2024-08-15',
    expiryDate: '2025-08-15'
  },
  {
    id: 3,
    code: 'GC003',
    amount: 300,
    balance: 0,
    status: 'used',
    client: 'Sofia Martínez',
    issuedDate: '2024-07-20',
    expiryDate: '2025-07-20'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'sent':
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'used':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'sent':
      return 'Enviada'
    case 'active':
      return 'Activa'
    case 'draft':
      return 'Borrador'
    case 'used':
      return 'Utilizada'
    default:
      return status
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'email':
      return Mail
    case 'sms':
      return Phone
    case 'whatsapp':
      return MessageSquare
    default:
      return Mail
  }
}

export default function MarketingPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  const handleNewCampaign = () => {
    toast('Función nueva campaña en desarrollo')
  }

  const handleViewCampaign = (campaignId: number) => {
    toast('Función ver campaña en desarrollo')
  }

  const handleEditCampaign = (campaignId: number) => {
    toast('Función editar campaña en desarrollo')
  }

  const handleSendCampaign = (campaignId: number) => {
    toast('Función enviar campaña en desarrollo')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPercentage = (value: number, total: number) => {
    return total > 0 ? `${Math.round((value / total) * 100)}%` : '0%'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing y Comunicación</h1>
          <p className="text-muted-foreground">
            Gestiona campañas, recordatorios y programas de fidelización
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Campañas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCampaigns.filter(c => c.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              En curso
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alcance Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCampaigns.reduce((sum, c) => sum + c.recipients, 0)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Este mes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gift Cards Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockGiftCards.filter(g => g.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(mockGiftCards.filter(g => g.status === 'active').reduce((sum, g) => sum + g.balance, 0))} en créditos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasa de Apertura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(
                mockCampaigns.reduce((sum, c) => sum + c.opened, 0),
                mockCampaigns.reduce((sum, c) => sum + c.recipients, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Promedio campañas
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campañas</TabsTrigger>
          <TabsTrigger value="reminders">Recordatorios</TabsTrigger>
          <TabsTrigger value="loyalty">Fidelización</TabsTrigger>
          <TabsTrigger value="giftcards">Gift Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Campañas de Marketing</h2>
            <Button onClick={handleNewCampaign}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Campaña
            </Button>
          </div>

          <div className="grid gap-4">
            {mockCampaigns.map((campaign) => {
              const Icon = getTypeIcon(campaign.type)
              return (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold">{campaign.name}</h3>
                            <Badge className={getStatusColor(campaign.status)}>
                              {getStatusText(campaign.status)}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {campaign.description}
                          </p>
                          
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Destinatarios</p>
                              <p className="font-medium">{campaign.recipients}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Aperturas</p>
                              <p className="font-medium">
                                {campaign.opened} ({formatPercentage(campaign.opened, campaign.recipients)})
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Clics</p>
                              <p className="font-medium">
                                {campaign.clicked} ({formatPercentage(campaign.clicked, campaign.recipients)})
                              </p>
                            </div>
                          </div>
                          
                          {campaign.sentDate && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              Enviada: {formatDate(campaign.sentDate)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewCampaign(campaign.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditCampaign(campaign.id)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        {campaign.status === 'draft' && (
                          <Button 
                            size="sm"
                            onClick={() => handleSendCampaign(campaign.id)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Enviar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recordatorios Automáticos</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Recordatorio
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  SMS Recordatorios
                </CardTitle>
                <CardDescription>
                  Recordatorios de citas por mensaje de texto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Estado</span>
                  <Badge className="bg-green-100 text-green-800">Activo</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tiempo de envío</span>
                  <span className="text-sm font-medium">24 horas antes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Enviados hoy</span>
                  <span className="text-sm font-medium">18</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Configurar
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Email Recordatorios
                </CardTitle>
                <CardDescription>
                  Recordatorios de citas por correo electrónico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Estado</span>
                  <Badge className="bg-green-100 text-green-800">Activo</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tiempo de envío</span>
                  <span className="text-sm font-medium">2 horas antes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Enviados hoy</span>
                  <span className="text-sm font-medium">23</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Configurar
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Programa de Fidelización</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Recompensa
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Puntos por Visita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">100</div>
                <p className="text-sm text-muted-foreground">
                  Puntos por cada $10 gastados
                </p>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Modificar
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="h-5 w-5 mr-2" />
                  Clientes VIP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">12</div>
                <p className="text-sm text-muted-foreground">
                  Clientes con +1000 puntos
                </p>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Ver Lista
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Referidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">8</div>
                <p className="text-sm text-muted-foreground">
                  Nuevos clientes este mes
                </p>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Ver Programa
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="giftcards" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gift Cards</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Gift Card
            </Button>
          </div>

          <div className="grid gap-4">
            {mockGiftCards.map((giftCard) => (
              <Card key={giftCard.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Gift className="h-6 w-6 text-purple-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{giftCard.code}</h3>
                          <Badge className={getStatusColor(giftCard.status)}>
                            {getStatusText(giftCard.status)}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Cliente</p>
                            <p className="font-medium">{giftCard.client}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Valor</p>
                            <p className="font-medium">{formatCurrency(giftCard.amount)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Saldo</p>
                            <p className="font-medium">{formatCurrency(giftCard.balance)}</p>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-sm text-muted-foreground">
                          Emitida: {formatDate(giftCard.issuedDate)} | 
                          Vence: {formatDate(giftCard.expiryDate)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      {giftCard.status === 'active' && (
                        <Button size="sm">
                          Usar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
