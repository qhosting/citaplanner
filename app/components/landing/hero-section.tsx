
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar, ArrowRight, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
              <Calendar className="h-4 w-4" />
              <span>Plataforma #1 en Gestión de Citas</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Gestiona tu negocio de{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                belleza y bienestar
              </span>{' '}
              con facilidad
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              CitaPlanner es la solución integral que necesitas para administrar citas, 
              clientes, servicios y ventas. Todo en un solo lugar, simple y poderoso.
            </p>

            <div className="space-y-3">
              {[
                'Agenda inteligente con recordatorios automáticos',
                'CRM completo para gestión de clientes',
                'Sistema POS integrado para ventas',
                'Reportes y análisis en tiempo real',
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 group"
                >
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-2"
                >
                  Ver Demo
                </Button>
              </Link>
            </div>

            <p className="text-sm text-gray-500">
              ✨ Prueba gratuita de 14 días • No requiere tarjeta de crédito
            </p>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 shadow-2xl">
              <div className="bg-white rounded-xl p-6 space-y-4">
                {/* Mock Calendar Interface */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <h3 className="font-semibold text-lg">Agenda de Hoy</h3>
                  <div className="text-sm text-gray-500">15 Oct 2025</div>
                </div>
                
                {[
                  { time: '09:00', client: 'María García', service: 'Corte de Cabello', color: 'bg-blue-100 text-blue-700' },
                  { time: '10:30', client: 'Juan Pérez', service: 'Manicure', color: 'bg-purple-100 text-purple-700' },
                  { time: '12:00', client: 'Ana López', service: 'Masaje Relajante', color: 'bg-green-100 text-green-700' },
                ].map((appointment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className={`${appointment.color} rounded-lg p-4 space-y-1`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{appointment.time}</span>
                      <span className="text-xs px-2 py-1 bg-white/50 rounded">Confirmada</span>
                    </div>
                    <div className="font-medium">{appointment.client}</div>
                    <div className="text-sm opacity-80">{appointment.service}</div>
                  </motion.div>
                ))}
              </div>

              {/* Floating Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4"
              >
                <div className="text-sm text-gray-500">Ingresos del Mes</div>
                <div className="text-2xl font-bold text-green-600">$45,230</div>
                <div className="text-xs text-green-600">↑ 23% vs mes anterior</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-4"
              >
                <div className="text-sm text-gray-500">Clientes Activos</div>
                <div className="text-2xl font-bold text-blue-600">1,247</div>
                <div className="text-xs text-blue-600">↑ 156 este mes</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
