
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Plus, 
  Search,
  Phone,
  Mail,
  Users,
  Clock,
  Edit,
  Settings,
  TrendingUp
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'

const mockBranches = [
  {
    id: 1,
    name: 'Sucursal Centro',
    address: 'Av. Reforma 123, Centro Histórico, CDMX',
    phone: '+52 55 1234 5678',
    email: 'centro@bellaestetic.com',
    isActive: true,
    staff: 8,
    services: 15,
    monthlyAppointments: 324,
    monthlyRevenue: 45600,
    manager: 'María González',
    workingHours: 'Lun-Sáb: 9:00-19:00'
  },
  {
    id: 2,
    name: 'Sucursal Polanco',
    address: 'Av. Presidente Masaryk 456, Polanco, CDMX',
    phone: '+52 55 9876 5432',
    email: 'polanco@bellaestetic.com',
    isActive: true,
    staff: 12,
    services: 18,
    monthlyAppointments: 567,
    monthlyRevenue: 78900,
    manager: 'Ana López',
    workingHours: 'Lun-Dom: 8:00-20:00'
  },
  {
    id: 3,
    name: 'Sucursal Santa Fe',
    address: 'Centro Comercial Santa Fe 789, Santa Fe, CDMX',
    phone: '+52 55 5555 1111',
    email: 'santafe@bellaestetic.com',
    isActive: true,
    staff: 6,
    services: 12,
    monthlyAppointments: 189,
    monthlyRevenue: 28400,
    manager: 'Carlos Ruiz',
    workingHours: 'Lun-Dom: 10:00-22:00'
  },
  {
    id: 4,
    name: 'Sucursal Roma Norte',
    address: 'Av. Álvaro Obregón 321, Roma Norte, CDMX',
    phone: '+52 55 3333 7777',
    email: 'roma@bellaestetic.com',
    isActive: false,
    staff: 4,
    services: 8,
    monthlyAppointments: 0,
    monthlyRevenue: 0,
    manager: 'Sofia Martínez',
    workingHours: 'Temporalmente cerrada'
  }
]

export default function BranchesPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  const filteredBranches = mockBranches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.manager.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleNewBranch = () => {
    toast('Función nueva sucursal en desarrollo')
  }

  const handleEditBranch = (branchId: number) => {
    toast('Función editar sucursal en desarrollo')
  }

  const handleConfigureBranch = (branchId: number) => {
    toast('Función configurar sucursal en desarrollo')
  }

  const handleManageStaff = (branchId: number) => {
    toast('Función gestionar personal en desarrollo')
  }

  const handleGlobalStaff = () => {
    toast('Función gestión global de personal en desarrollo')
  }

  const handleGlobalHours = () => {
    toast('Función horarios globales en desarrollo')
  }

  const totalActiveBranches = mockBranches.filter(b => b.isActive).length
  const totalStaff = mockBranches.reduce((sum, b) => sum + b.staff, 0)
  const totalRevenue = mockBranches.reduce((sum, b) => sum + b.monthlyRevenue, 0)
  const totalAppointments = mockBranches.reduce((sum, b) => sum + b.monthlyAppointments, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Sucursales</h1>
          <p className="text-muted-foreground">
            Administra todas las ubicaciones de tu negocio
          </p>
        </div>
        <Button onClick={handleNewBranch}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Sucursal
        </Button>
      </div>

      {/* Estadísticas generales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sucursales Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveBranches}</div>
            <p className="text-xs text-muted-foreground">
              de {mockBranches.length} totales
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Personal Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
            <p className="text-xs text-muted-foreground">
              empleados activos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% vs mes anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Citas del Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              todas las sucursales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, dirección o encargado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Lista de sucursales */}
      <div className="grid gap-6">
        {filteredBranches.map((branch) => (
          <Card key={branch.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold">{branch.name}</h3>
                      <Badge className={branch.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {branch.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{branch.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{branch.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{branch.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{branch.workingHours}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Encargado:</span>
                          <span className="font-medium">{branch.manager}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Personal:</span>
                          <span className="font-medium">{branch.staff} empleados</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Servicios:</span>
                          <span className="font-medium">{branch.services} disponibles</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Citas/mes:</span>
                          <span className="font-medium">{branch.monthlyAppointments}</span>
                        </div>
                      </div>
                    </div>
                    
                    {branch.isActive && (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-green-800">Ingresos del mes</p>
                          <p className="text-lg font-bold text-green-700">
                            {formatCurrency(branch.monthlyRevenue)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-green-600">
                            Promedio por cita
                          </p>
                          <p className="font-medium text-green-700">
                            {branch.monthlyAppointments > 0 
                              ? formatCurrency(branch.monthlyRevenue / branch.monthlyAppointments)
                              : formatCurrency(0)
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditBranch(branch.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleConfigureBranch(branch.id)}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Configurar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleManageStaff(branch.id)}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Personal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Gestiona aspectos globales de todas tus sucursales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => toast('Función configuración global en desarrollo')}
            >
              <Settings className="h-6 w-6 mb-2" />
              <span className="text-sm">Configuración Global</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={handleGlobalStaff}
            >
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">Gestión de Personal</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={handleGlobalHours}
            >
              <Clock className="h-6 w-6 mb-2" />
              <span className="text-sm">Horarios Globales</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
