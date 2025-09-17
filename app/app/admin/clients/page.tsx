
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ClientModal } from '@/components/modals/client-modal'
import { toast } from 'react-hot-toast'

const mockClients = [
  {
    id: 1,
    firstName: 'María',
    lastName: 'González',
    email: 'maria.gonzalez@email.com',
    phone: '+52 55 1234 5678',
    address: 'Av. Reforma 123, CDMX',
    birthday: '1990-05-15',
    totalAppointments: 15,
    lastAppointment: '2024-09-10',
    totalSpent: 4500,
    notes: 'Prefiere horarios matutinos. Alérgica al tinte negro.',
    status: 'active',
    tags: ['VIP', 'Frecuente']
  },
  {
    id: 2,
    firstName: 'Carlos',
    lastName: 'Ruiz',
    email: 'carlos.ruiz@email.com',
    phone: '+52 55 9876 5432',
    address: 'Colonia Roma Norte 456',
    birthday: '1985-03-22',
    totalAppointments: 8,
    lastAppointment: '2024-09-15',
    totalSpent: 2800,
    notes: 'Cliente regular desde 2022.',
    status: 'active',
    tags: ['Regular']
  },
  {
    id: 3,
    firstName: 'Sofia',
    lastName: 'Martínez',
    email: 'sofia.martinez@email.com',
    phone: '+52 55 5555 1111',
    address: 'Polanco 789',
    birthday: '1992-08-10',
    totalAppointments: 3,
    lastAppointment: '2024-08-20',
    totalSpent: 950,
    notes: 'Nueva cliente. Interesada en tratamientos faciales.',
    status: 'new',
    tags: ['Nuevo']
  },
  {
    id: 4,
    firstName: 'Diego',
    lastName: 'Hernández',
    email: 'diego.hernandez@email.com',
    phone: '+52 55 3333 7777',
    address: 'Condesa 321',
    birthday: '1988-12-05',
    totalAppointments: 12,
    lastAppointment: '2024-07-15',
    totalSpent: 3200,
    notes: 'No ha venido en 2 meses.',
    status: 'inactive',
    tags: ['Inactivo']
  },
  {
    id: 5,
    firstName: 'Patricia',
    lastName: 'Vega',
    email: 'patricia.vega@email.com',
    phone: '+52 55 8888 2222',
    address: 'Santa Fe 654',
    birthday: '1995-01-18',
    totalAppointments: 25,
    lastAppointment: '2024-09-12',
    totalSpent: 7500,
    notes: 'Cliente VIP desde 2020. Muy recomendadora.',
    status: 'vip',
    tags: ['VIP', 'Embajadora']
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'new':
      return 'bg-blue-100 text-blue-800'
    case 'inactive':
      return 'bg-gray-100 text-gray-800'
    case 'vip':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Activo'
    case 'new':
      return 'Nuevo'
    case 'inactive':
      return 'Inactivo'
    case 'vip':
      return 'VIP'
    default:
      return status
  }
}

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [clientModal, setClientModal] = useState<{
    isOpen: boolean
    mode: 'create' | 'edit'
    client?: any
  }>({
    isOpen: false,
    mode: 'create',
    client: null
  })

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = 
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      case 'appointments':
        return b.totalAppointments - a.totalAppointments
      case 'spent':
        return b.totalSpent - a.totalSpent
      case 'recent':
        return new Date(b.lastAppointment).getTime() - new Date(a.lastAppointment).getTime()
      default:
        return 0
    }
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const openClientModal = (mode: 'create' | 'edit', client?: any) => {
    setClientModal({
      isOpen: true,
      mode,
      client
    })
  }

  const closeClientModal = () => {
    setClientModal({
      isOpen: false,
      mode: 'create',
      client: null
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h1>
          <p className="text-muted-foreground">
            Administra tu base de clientes y su información
          </p>
        </div>
        <Button onClick={() => openClientModal('create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockClients.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 este mes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clientes Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockClients.filter(c => c.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clientes VIP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {mockClients.filter(c => c.status === 'vip').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mockClients.reduce((sum, c) => sum + c.totalSpent, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="new">Nuevos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nombre</SelectItem>
            <SelectItem value="appointments">Más citas</SelectItem>
            <SelectItem value="spent">Mayor gasto</SelectItem>
            <SelectItem value="recent">Más reciente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de clientes */}
      <div className="grid gap-4">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay clientes</h3>
              <p className="text-muted-foreground text-center">
                No se encontraron clientes que coincidan con los filtros aplicados.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-blue-100 text-blue-800">
                        {getInitials(client.firstName, client.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold">
                          {client.firstName} {client.lastName}
                        </h3>
                        <Badge className={getStatusColor(client.status)}>
                          {getStatusText(client.status)}
                        </Badge>
                        {client.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{client.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{client.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{client.address}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Cumpleaños: {formatDate(client.birthday)}</span>
                          </div>
                          <div>
                            <strong>{client.totalAppointments}</strong> citas realizadas
                          </div>
                          <div>
                            Total gastado: <strong>{formatCurrency(client.totalSpent)}</strong>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <strong>Última cita:</strong> {formatDate(client.lastAppointment)}
                      </div>
                      
                      {client.notes && (
                        <div className="bg-gray-50 p-3 rounded-lg text-sm">
                          <strong>Notas:</strong> {client.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver perfil completo
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openClientModal('edit', client)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar información
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="h-4 w-4 mr-2" />
                        Nueva cita
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Phone className="h-4 w-4 mr-2" />
                        Llamar cliente
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Cliente */}
      <ClientModal
        isOpen={clientModal.isOpen}
        onClose={closeClientModal}
        mode={clientModal.mode}
        client={clientModal.client}
      />
    </div>
  )
}
