
'use client'

import { Button } from '@/components/ui/button'
import { Plus, Search, Save } from 'lucide-react'
import { toast } from 'sonner'

interface ModuleButtonsProps {
  searchLabel?: string
  addLabel?: string
  onSearch?: () => void
  onAdd?: () => void
}

export function ModuleButtons({ 
  searchLabel = "Buscar", 
  addLabel = "Nuevo",
  onSearch,
  onAdd 
}: ModuleButtonsProps) {
  
  const handleSearch = () => {
    if (onSearch) {
      onSearch()
    } else {
      toast.info("Funcionalidad de búsqueda próximamente disponible")
    }
  }
  
  const handleAdd = () => {
    if (onAdd) {
      onAdd()
    } else {
      toast.info("Formulario de creación próximamente disponible")
    }
  }

  return (
    <div className="flex gap-3">
      <Button variant="outline" onClick={handleSearch}>
        <Search className="h-4 w-4 mr-2" />
        {searchLabel}
      </Button>
      <Button onClick={handleAdd}>
        <Plus className="h-4 w-4 mr-2" />
        {addLabel}
      </Button>
    </div>
  )
}

export function SaveButton({ label = "Guardar Cambios", onClick }: { label?: string, onClick?: () => void }) {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      toast.info("Funcionalidad de guardado próximamente disponible")
    }
  }

  return (
    <Button onClick={handleClick}>
      <Save className="h-4 w-4 mr-2" />
      {label}
    </Button>
  )
}
