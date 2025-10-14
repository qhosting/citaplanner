
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Plus, Search, Edit, Trash2, Building, Mail, Phone } from 'lucide-react'
import { ProfessionalModal } from '@/components/modals/professional-modal'
import { toast } from 'react-hot-toast'

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<any[]>([])
  const [filteredProfessionals, setFilteredProfessionals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  useEffect(() => {
    loadProfessionals()
  }, [])

  useEffect(() => {
    filterProfessionals()
  }, [searchTerm, professionals])

  const loadProfessionals = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/professionals?includeInactive=true')
      const result = await response.json()

      if (result.success) {
        setProfessionals(result.data || [])
      } else {
        toast.error('Error al cargar profesionales')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar profesionales')
    } finally {
      setIsLoading(false)
    }
  }

  const filterProfessionals = () => {
    if (!searchTerm.trim()) {
      setFilteredProfessionals(professionals)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = professionals.filter(prof => 
      prof.firstName.toLowerCase().includes(term) ||
      prof.lastName.toLowerCase().includes(term) ||
      prof.email.toLowerCase().includes(term) ||
      (prof.phone && prof.phone.toLowerCase().includes(term))
    )
    setFilteredProfessionals(filtered)
  }

  const handleCreate = () => {
    setSelectedProfessional(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEdit = (professional: any) => {
    setSelectedProfessional(professional)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = async (professional: any) => {
    if (!confirm(`¿Estás seguro de desactivar al profesional ${professional.firstName} ${professional.lastName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/professionals/${professional.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('✅ Profesional desactivado exitosamente')
        loadProfessionals()
      } else {
        toast.error(result.error || 'Error al desactivar profesional')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al desactivar profesional')
    }
  }

  const handleModalSuccess = () => {
    loadProfessionals()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-6 w-6" />
            Gestión de Profesionales
          </h1>
          <p className="text-gray-600 mt-1">
            Administra el equipo de profesionales de tu negocio
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Profesional
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Profesionales Registrados</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar profesional..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando profesionales...</p>
            </div>
          ) : filteredProfessionals.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron profesionales' : 'No hay profesionales registrados'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Comienza agregando tu primer profesional'}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Profesional
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProfessionals.map((professional) => (
                <Card key={professional.id} className={!professional.isActive ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {professional.avatar ? (
                          <img
                            src={professional.avatar}
                            alt={`${professional.firstName} ${professional.lastName}`}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {professional.firstName} {professional.lastName}
                          </h3>
                          {!professional.isActive && (
                            <span className="text-xs text-red-600 font-medium">Inactivo</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{professional.email}</span>
                      </div>
                      {professional.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{professional.phone}</span>
                        </div>
                      )}
                      {professional.branch && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span>{professional.branch.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(professional)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(professional)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ProfessionalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        professional={selectedProfessional}
        mode={modalMode}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
