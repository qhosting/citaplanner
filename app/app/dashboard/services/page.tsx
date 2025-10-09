
'use client'

import { useState, useEffect } from 'react'
import { UserCheck, Plus, Search, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { ServiceModal } from '@/components/modals/service-modal'

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [filteredServices, setFilteredServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadServices()
  }, [])

  useEffect(() => {
    filterServices()
  }, [services, searchTerm])

  const loadServices = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/services')
      const result = await response.json()

      if (result.success) {
        setServices(result.data)
      } else {
        throw new Error(result.error || 'Error al cargar servicios')
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar servicios')
    } finally {
      setIsLoading(false)
    }
  }

  const filterServices = () => {
    let filtered = [...services]

    if (searchTerm) {
      filtered = filtered.filter(service => {
        const name = service.name.toLowerCase()
        const description = (service.description || '').toLowerCase()
        const search = searchTerm.toLowerCase()

        return name.includes(search) || description.includes(search)
      })
    }

    setFilteredServices(filtered)
  }

  const handleCreateService = () => {
    setSelectedService(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEditService = (service: any) => {
    setSelectedService(service)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este servicio?')) {
      return
    }

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Servicio eliminado exitosamente')
        loadServices()
      } else {
        throw new Error(result.error || 'Error al eliminar servicio')
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar servicio')
    }
  }

  const handleToggleActive = async (service: any) => {
    try {
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !service.isActive,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(
          service.isActive 
            ? 'Servicio desactivado exitosamente' 
            : 'Servicio activado exitosamente'
        )
        loadServices()
      } else {
        throw new Error(result.error || 'Error al actualizar servicio')
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar servicio')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="h-6 w-6" />
            Catálogo de Servicios
          </h1>
          <p className="text-gray-600 mt-1">
            Administra los servicios que ofrece tu negocio
          </p>
        </div>
        <Button onClick={handleCreateService}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Servicio
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar servicios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Cargando servicios...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay servicios
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? 'No se encontraron servicios con los filtros aplicados'
                  : 'Comienza creando tu primer servicio'}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreateService}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Servicio
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: service.color }}
                          />
                          <div>
                            <p className="font-medium">{service.name}</p>
                            {service.description && (
                              <p className="text-sm text-gray-600">{service.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{service.duration} min</TableCell>
                      <TableCell>${service.price.toFixed(2)}</TableCell>
                      <TableCell>
                        {service.category ? service.category.name : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            service.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {service.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditService(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(service)}
                          >
                            {service.isActive ? 'Desactivar' : 'Activar'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={selectedService}
        mode={modalMode}
        onSuccess={loadServices}
      />
    </div>
  )
}
