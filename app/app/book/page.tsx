
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Calendar, 
  Clock, 
  User, 
  Scissors, 
  ChevronLeft, 
  ChevronRight,
  Check,
  ArrowRight
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

// Mock data - En producción vendría de la API
const mockCompany = {
  name: 'Bella Estética',
  address: 'Av. Reforma 123, CDMX',
  phone: '+52 55 1234 5678',
  primaryColor: '#3B82F6',
  secondaryColor: '#EF4444',
  logo: null
}

const mockServices = [
  {
    id: '1',
    name: 'Corte de Cabello',
    duration: 60,
    price: 350,
    category: 'Cabello',
    description: 'Corte profesional con lavado incluido'
  },
  {
    id: '2',
    name: 'Peinado',
    duration: 45,
    price: 250,
    category: 'Cabello',
    description: 'Peinado para evento especial'
  },
  {
    id: '3',
    name: 'Manicure',
    duration: 90,
    price: 200,
    category: 'Uñas',
    description: 'Manicure completo con esmaltado'
  },
  {
    id: '4',
    name: 'Facial Hidratante',
    duration: 75,
    price: 450,
    category: 'Facial',
    description: 'Tratamiento facial profundo'
  }
]

const mockProfessionals = [
  { id: '1', name: 'Ana López', services: ['1', '2', '4'] },
  { id: '2', name: 'Juan Pérez', services: ['1', '2'] },
  { id: '3', name: 'Laura García', services: ['3', '4'] }
]

const mockTimeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
]

type BookingStep = 'service' | 'professional' | 'datetime' | 'details' | 'confirmation'

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState<BookingStep>('service')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [bookingData, setBookingData] = useState({
    serviceId: '',
    professionalId: '',
    date: '',
    time: '',
    clientData: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      notes: ''
    }
  })
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const selectedService = mockServices.find(s => s.id === bookingData.serviceId)
  const selectedProfessional = mockProfessionals.find(p => p.id === bookingData.professionalId)
  const availableProfessionals = mockProfessionals.filter(p => 
    p.services.includes(bookingData.serviceId)
  )

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    })
  }

  const handleServiceSelect = (serviceId: string) => {
    setBookingData(prev => ({ ...prev, serviceId, professionalId: '' }))
    setCurrentStep('professional')
  }

  const handleProfessionalSelect = (professionalId: string) => {
    setBookingData(prev => ({ ...prev, professionalId }))
    setCurrentStep('datetime')
  }

  const handleDateTimeSelect = (date: string, time: string) => {
    setBookingData(prev => ({ ...prev, date, time }))
    setCurrentStep('details')
  }

  const handleClientDetailsSubmit = (data: any) => {
    setBookingData(prev => ({ 
      ...prev, 
      clientData: data 
    }))
    setCurrentStep('confirmation')
  }

  const handleFinalConfirmation = async () => {
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('¡Cita agendada exitosamente!')
      
      // Reset form
      setBookingData({
        serviceId: '',
        professionalId: '',
        date: '',
        time: '',
        clientData: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          notes: ''
        }
      })
      reset()
      setCurrentStep('service')
      
    } catch (error) {
      toast.error('Error al agendar la cita. Inténtelo nuevamente.')
    }
  }

  const getStepNumber = (step: BookingStep) => {
    const steps = ['service', 'professional', 'datetime', 'details', 'confirmation']
    return steps.indexOf(step) + 1
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{mockCompany.name}</h1>
              <p className="text-gray-600">Reserva tu cita online</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>{mockCompany.address}</p>
              <p>{mockCompany.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {(['service', 'professional', 'datetime', 'details', 'confirmation'] as BookingStep[]).map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${getStepNumber(currentStep) > index + 1 
                    ? 'bg-green-500 text-white' 
                    : getStepNumber(currentStep) === index + 1 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                  {getStepNumber(currentStep) > index + 1 ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                {index < 4 && (
                  <div className={`w-12 h-1 mx-2
                    ${getStepNumber(currentStep) > index + 1 ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Step 1: Service Selection */}
          {currentStep === 'service' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scissors className="h-6 w-6 mr-2" />
                  Selecciona un Servicio
                </CardTitle>
                <CardDescription>
                  Elige el servicio que deseas agendar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {mockServices.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => handleServiceSelect(service.id)}
                      className="p-4 border rounded-lg cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <span className="text-blue-600 font-bold">${service.price}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{service.category}</span>
                        <span>{service.duration} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Professional Selection */}
          {currentStep === 'professional' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-6 w-6 mr-2" />
                  Selecciona un Profesional
                </CardTitle>
                <CardDescription>
                  Profesionales disponibles para: {selectedService?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {availableProfessionals.map((professional) => (
                    <div
                      key={professional.id}
                      onClick={() => handleProfessionalSelect(professional.id)}
                      className="p-6 border rounded-lg cursor-pointer hover:border-blue-500 hover:shadow-md transition-all text-center"
                    >
                      <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <User className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="font-semibold">{professional.name}</h3>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep('service')}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Cambiar Servicio
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Date & Time Selection */}
          {currentStep === 'datetime' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-6 w-6 mr-2" />
                  Selecciona Fecha y Hora
                </CardTitle>
                <CardDescription>
                  {selectedService?.name} con {selectedProfessional?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Calendar */}
                  <div>
                    <h4 className="font-medium mb-3">Fecha</h4>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">
                          {selectedDate.toLocaleDateString('es-ES', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </h3>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newDate = new Date(selectedDate)
                              newDate.setMonth(newDate.getMonth() - 1)
                              setSelectedDate(newDate)
                            }}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newDate = new Date(selectedDate)
                              newDate.setMonth(newDate.getMonth() + 1)
                              setSelectedDate(newDate)
                            }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Simple date picker */}
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 31 }, (_, i) => {
                          const day = i + 1
                          const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
                          const isDisabled = date < new Date() || date.getDay() === 0 // Disable past dates and Sundays
                          
                          return (
                            <Button
                              key={day}
                              variant={bookingData.date === date.toISOString().split('T')[0] ? "default" : "outline"}
                              size="sm"
                              disabled={isDisabled}
                              onClick={() => handleDateTimeSelect(date.toISOString().split('T')[0], bookingData.time)}
                              className="p-2"
                            >
                              {day}
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <h4 className="font-medium mb-3">Hora disponible</h4>
                    {bookingData.date ? (
                      <div className="grid grid-cols-3 gap-2">
                        {mockTimeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={bookingData.time === time ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleDateTimeSelect(bookingData.date, time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        Selecciona una fecha primero
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep('professional')}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Cambiar Profesional
                  </Button>
                  
                  {bookingData.date && bookingData.time && (
                    <Button onClick={() => setCurrentStep('details')}>
                      Continuar
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Client Details */}
          {currentStep === 'details' && (
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
                <CardDescription>
                  Por favor, proporciona tus datos para confirmar la cita
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(handleClientDetailsSubmit)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        {...register('firstName', { required: 'Nombre es requerido' })}
                        placeholder="Tu nombre"
                      />
                      {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message as string}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        {...register('lastName', { required: 'Apellido es requerido' })}
                        placeholder="Tu apellido"
                      />
                      {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message as string}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email', { 
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email inválido'
                          }
                        })}
                        placeholder="tu@email.com"
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email.message as string}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        {...register('phone', { required: 'Teléfono es requerido' })}
                        placeholder="+52 55 1234 5678"
                      />
                      {errors.phone && <p className="text-sm text-red-500">{errors.phone.message as string}</p>}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                    <Textarea
                      id="notes"
                      {...register('notes')}
                      placeholder="¿Alguna preferencia o información adicional?"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep('datetime')}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Cambiar Fecha/Hora
                    </Button>
                    <Button type="submit">
                      Revisar Cita
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 'confirmation' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-2xl">Confirmar Reserva</CardTitle>
                <CardDescription className="text-center">
                  Revisa los detalles de tu cita antes de confirmar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Booking Summary */}
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4 text-blue-900">Resumen de tu Cita</h3>
                    <div className="grid gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Servicio:</span>
                        <span className="font-medium">{selectedService?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Profesional:</span>
                        <span className="font-medium">{selectedProfessional?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Fecha:</span>
                        <span className="font-medium">{formatDate(new Date(bookingData.date))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Hora:</span>
                        <span className="font-medium">{bookingData.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Duración:</span>
                        <span className="font-medium">{selectedService?.duration} minutos</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-blue-700 font-medium">Precio:</span>
                        <span className="font-bold text-lg">${selectedService?.price}</span>
                      </div>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4">Información de Contacto</h3>
                    <div className="grid gap-2 text-sm">
                      <p><strong>Nombre:</strong> {bookingData.clientData.firstName} {bookingData.clientData.lastName}</p>
                      <p><strong>Email:</strong> {bookingData.clientData.email}</p>
                      <p><strong>Teléfono:</strong> {bookingData.clientData.phone}</p>
                      {bookingData.clientData.notes && (
                        <p><strong>Notas:</strong> {bookingData.clientData.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Important Notice */}
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Política de Cancelación</h4>
                    <p className="text-sm text-yellow-700">
                      Las cancelaciones deben realizarse con al menos 24 horas de anticipación. 
                      Recibirás un email de confirmación con todos los detalles.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep('details')}
                      className="flex-1"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Modificar Información
                    </Button>
                    <Button
                      onClick={handleFinalConfirmation}
                      className="flex-1 text-lg py-3"
                      size="lg"
                    >
                      <Check className="h-5 w-5 mr-2" />
                      Confirmar Cita
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
        </div>
      </div>
    </div>
  )
}
