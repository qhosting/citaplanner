
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Variable {
  name: string
  description: string
  example: string
}

interface VariableCategory {
  category: string
  variables: Variable[]
}

const variableCategories: VariableCategory[] = [
  {
    category: 'Cliente',
    variables: [
      { name: '{{clientName}}', description: 'Nombre completo del cliente', example: 'Juan Pérez' },
      { name: '{{clientFirstName}}', description: 'Nombre del cliente', example: 'Juan' },
      { name: '{{clientLastName}}', description: 'Apellido del cliente', example: 'Pérez' },
      { name: '{{clientPhone}}', description: 'Teléfono del cliente', example: '+52 123 456 7890' },
      { name: '{{clientEmail}}', description: 'Email del cliente', example: 'juan@example.com' }
    ]
  },
  {
    category: 'Cita',
    variables: [
      { name: '{{appointmentDate}}', description: 'Fecha de la cita', example: '15/01/2024' },
      { name: '{{appointmentTime}}', description: 'Hora de la cita', example: '10:00 AM' },
      { name: '{{appointmentDateTime}}', description: 'Fecha y hora completa', example: '15/01/2024 a las 10:00 AM' },
      { name: '{{serviceName}}', description: 'Nombre del servicio', example: 'Corte de cabello' },
      { name: '{{serviceDuration}}', description: 'Duración del servicio', example: '30 minutos' },
      { name: '{{servicePrice}}', description: 'Precio del servicio', example: '$250.00' }
    ]
  },
  {
    category: 'Profesional',
    variables: [
      { name: '{{professionalName}}', description: 'Nombre del profesional', example: 'María García' },
      { name: '{{professionalPhone}}', description: 'Teléfono del profesional', example: '+52 987 654 3210' }
    ]
  },
  {
    category: 'Negocio',
    variables: [
      { name: '{{businessName}}', description: 'Nombre del negocio', example: 'Salón de Belleza XYZ' },
      { name: '{{businessPhone}}', description: 'Teléfono del negocio', example: '+52 555 123 4567' },
      { name: '{{businessAddress}}', description: 'Dirección del negocio', example: 'Av. Principal 123' },
      { name: '{{branchName}}', description: 'Nombre de la sucursal', example: 'Sucursal Centro' }
    ]
  },
  {
    category: 'Pago',
    variables: [
      { name: '{{paymentAmount}}', description: 'Monto del pago', example: '$500.00' },
      { name: '{{paymentMethod}}', description: 'Método de pago', example: 'Tarjeta de crédito' },
      { name: '{{paymentDate}}', description: 'Fecha del pago', example: '15/01/2024' }
    ]
  }
]

export function VariableHelper() {
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null)

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable)
    setCopiedVariable(variable)
    toast.success('Variable copiada al portapapeles')
    setTimeout(() => setCopiedVariable(null), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variables Disponibles</CardTitle>
        <CardDescription>
          Usa estas variables en tus plantillas. Serán reemplazadas automáticamente con los datos reales.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {variableCategories.map((category, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-sm font-medium">
                {category.category}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {category.variables.map((variable, varIndex) => (
                    <div
                      key={varIndex}
                      className="flex items-start justify-between p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <code className="text-sm font-mono text-blue-600 break-all">
                          {variable.name}
                        </code>
                        <p className="text-xs text-gray-600 mt-1">
                          {variable.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Ejemplo: <span className="font-medium">{variable.example}</span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 flex-shrink-0"
                        onClick={() => copyVariable(variable.name)}
                      >
                        {copiedVariable === variable.name ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Consejos de Uso</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Las variables deben estar entre dobles llaves: {'{{'} y {'}}'}</li>
            <li>• Respeta mayúsculas y minúsculas exactamente como se muestran</li>
            <li>• Puedes combinar múltiples variables en un mismo mensaje</li>
            <li>• Si una variable no tiene valor, se mostrará vacía en el mensaje</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
