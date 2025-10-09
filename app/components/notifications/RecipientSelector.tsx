
'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

interface Client {
  id: string
  firstName: string
  lastName: string
  phone: string
  email?: string
}

interface RecipientSelectorProps {
  value: string[]
  onChange: (value: string[]) => void
  channel: 'WHATSAPP' | 'PUSH' | 'EMAIL' | 'SMS'
}

export function RecipientSelector({ value, onChange, channel }: RecipientSelectorProps) {
  const [open, setOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [selectAll, setSelectAll] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      const data = await response.json()
      if (response.ok && data.data) {
        setClients(data.data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectAll) {
      onChange([])
      setSelectAll(false)
    } else {
      const allRecipients = clients.map(c => getRecipientValue(c))
      onChange(allRecipients)
      setSelectAll(true)
    }
  }

  const getRecipientValue = (client: Client) => {
    switch (channel) {
      case 'WHATSAPP':
      case 'SMS':
        return client.phone
      case 'EMAIL':
        return client.email || ''
      case 'PUSH':
        return client.id
      default:
        return client.phone
    }
  }

  const getRecipientDisplay = (client: Client) => {
    const name = `${client.firstName} ${client.lastName}`
    switch (channel) {
      case 'WHATSAPP':
      case 'SMS':
        return `${name} (${client.phone})`
      case 'EMAIL':
        return `${name} (${client.email || 'Sin email'})`
      case 'PUSH':
        return name
      default:
        return name
    }
  }

  const isClientSelectable = (client: Client) => {
    switch (channel) {
      case 'EMAIL':
        return !!client.email
      case 'WHATSAPP':
      case 'SMS':
        return !!client.phone
      case 'PUSH':
        return true
      default:
        return true
    }
  }

  const selectedClients = clients.filter(c => value.includes(getRecipientValue(c)))

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value.length === 0 ? (
              'Seleccionar destinatarios...'
            ) : (
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {value.length} destinatario{value.length !== 1 ? 's' : ''} seleccionado{value.length !== 1 ? 's' : ''}
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar cliente..." />
            <CommandEmpty>No se encontraron clientes.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={handleSelectAll}>
                <Checkbox
                  checked={selectAll}
                  className="mr-2"
                />
                <span className="font-medium">Seleccionar todos</span>
              </CommandItem>
              {clients.map((client) => {
                const recipientValue = getRecipientValue(client)
                const isSelected = value.includes(recipientValue)
                const isSelectable = isClientSelectable(client)

                return (
                  <CommandItem
                    key={client.id}
                    value={`${client.firstName} ${client.lastName} ${client.phone}`}
                    onSelect={() => {
                      if (!isSelectable) return

                      if (isSelected) {
                        onChange(value.filter(v => v !== recipientValue))
                      } else {
                        onChange([...value, recipientValue])
                      }
                    }}
                    disabled={!isSelectable}
                    className={cn(!isSelectable && 'opacity-50 cursor-not-allowed')}
                  >
                    <Checkbox
                      checked={isSelected}
                      className="mr-2"
                    />
                    <span className={cn(!isSelectable && 'line-through')}>
                      {getRecipientDisplay(client)}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedClients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedClients.map((client) => (
            <Badge
              key={client.id}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => {
                const recipientValue = getRecipientValue(client)
                onChange(value.filter(v => v !== recipientValue))
              }}
            >
              {client.firstName} {client.lastName}
              <span className="ml-1">×</span>
            </Badge>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500">
        {value.length} destinatario{value.length !== 1 ? 's' : ''} seleccionado{value.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
