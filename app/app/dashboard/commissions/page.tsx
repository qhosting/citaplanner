
'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Plus, Search, Filter, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const statusColors: any = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const statusLabels: any = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
  CANCELLED: 'Cancelada',
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<any[]>([])
  const [filteredCommissions, setFilteredCommissions] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [professionalFilter, setProfessionalFilter] = useState('ALL')
  const [periodFilter, setPeriodFilter] = useState('ALL')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterCommissions()
  }, [commissions, searchTerm, statusFilter, professionalFilter, periodFilter])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [commissionsRes, professionalsRes] = await Promise.all([
        fetch('/api/commissions'),
        fetch('/api/users?role=PROFESSIONAL'),
      ])

      const [commissionsData, professionalsData] = await Promise.all([
        commissionsRes.json(),
        professionalsRes.json(),
      ])

      setCommissions(commissionsData.success ? commissionsData.data : commissionsData)
      setProfessionals(professionalsData.success ? professionalsData.data : [])
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar comisiones')
    } finally {
      setIsLoading(false)
    }
  }

  const filterCommissions = () => {
    let filtered = [...commissions]

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(commission => {
        const professionalName = `${commission.professional?.firstName} ${commission.professional?.lastName}`.toLowerCase()
        const search = searchTerm.toLowerCase()
        return professionalName.includes(search)
      })
    }

    // Filtrar por estado
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(commission => commission.status === statusFilter)
    }

    // Filtrar por profesional
    if (professionalFilter !== 'ALL') {
      filtered = filtered.filter(commission => commission.professionalId === professionalFilter)
    }

    // Filtrar por período
    if (periodFilter !== 'ALL') {
      filtered = filtered.filter(commission => commission.period === periodFilter)
    }

    setFilteredCommissions(filtered)
  }

  const handlePayCommission = async (id: string) => {
    if (!confirm('¿Está seguro de que desea marcar esta comisión como pagada?')) {
      return
    }

    try {
      const response = await fetch(`/api/commissions/${id}/pay`, {
        method: 'POST',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Comisión pagada exitosamente')
        loadData()
      } else {
        throw new Error(result.error || 'Error al pagar comisión')
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al pagar comisión')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Calcular totales
  const totalPending = filteredCommissions
    .filter(c => c.status === 'PENDING')
    .reduce((sum, c) => sum + c.amount, 0)

  const totalPaid = filteredCommissions
    .filter(c => c.status === 'PAID')
    .reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Gestión de Comisiones
          </h1>
          <p className="text-gray-600 mt-1">
            Administra las comisiones de los profesionales
          </p>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totalPending)}
            </div>
            <p className="text-xs text-muted-foreground">
              Comisiones por pagar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              Comisiones pagadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total General</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalPending + totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              Todas las comisiones
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por profesional..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los estados</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="PAID">Pagada</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>

              <Select value={professionalFilter} onValueChange={setProfessionalFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Profesional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los profesionales</SelectItem>
                  {professionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.firstName} {prof.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los períodos</SelectItem>
                  <SelectItem value="2024-01">Enero 2024</SelectItem>
                  <SelectItem value="2024-02">Febrero 2024</SelectItem>
                  <SelectItem value="2024-03">Marzo 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Cargando comisiones...</p>
            </div>
          ) : filteredCommissions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay comisiones
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'ALL' || professionalFilter !== 'ALL'
                  ? 'No se encontraron comisiones con los filtros aplicados'
                  : 'No hay comisiones registradas'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profesional</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de Pago</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {commission.professional?.firstName} {commission.professional?.lastName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{commission.period}</TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {formatCurrency(commission.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[commission.status]}>
                          {statusLabels[commission.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {commission.paidAt ? formatDate(commission.paidAt) : '-'}
                      </TableCell>
                      <TableCell>
                        {commission.status === 'PENDING' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePayCommission(commission.id)}
                          >
                            Marcar como Pagada
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
