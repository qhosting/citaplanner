
'use client'

import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const plans = [
  {
    name: 'Starter',
    description: 'Perfecto para emprendedores y profesionales independientes',
    price: '$29',
    period: '/mes',
    features: [
      'Hasta 100 citas por mes',
      '1 usuario',
      'Agenda online',
      'Recordatorios automáticos',
      'CRM básico',
      'Reportes básicos',
      'Soporte por email',
    ],
    cta: 'Comenzar Gratis',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'Ideal para pequeños negocios y equipos en crecimiento',
    price: '$79',
    period: '/mes',
    features: [
      'Citas ilimitadas',
      'Hasta 5 usuarios',
      'Todo en Starter, más:',
      'Sistema POS integrado',
      'Gestión de inventario',
      'Reportes avanzados',
      'Multi-sucursal (hasta 2)',
      'Integraciones avanzadas',
      'Soporte prioritario',
    ],
    cta: 'Comenzar Prueba',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'Para negocios establecidos que buscan escalar',
    price: '$199',
    period: '/mes',
    features: [
      'Todo ilimitado',
      'Usuarios ilimitados',
      'Todo en Professional, más:',
      'Multi-sucursal ilimitado',
      'API personalizada',
      'Marca blanca',
      'Gerente de cuenta dedicado',
      'Capacitación personalizada',
      'Soporte 24/7',
      'SLA garantizado',
    ],
    cta: 'Contactar Ventas',
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Planes diseñados para{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              cada etapa de tu negocio
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades. Todos incluyen 14 días de prueba gratuita.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 ${
                plan.popular
                  ? 'border-blue-500 shadow-2xl scale-105 md:scale-110'
                  : 'border-gray-200 hover:border-blue-200 hover:shadow-xl'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Sparkles className="h-4 w-4" />
                    <span>Más Popular</span>
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link href="/auth/signup" className="block">
                <Button
                  className={`w-full py-6 text-lg font-semibold ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>

              {/* Gradient Border Effect */}
              {plan.popular && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl pointer-events-none" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600 mb-4">
            ✨ Todos los planes incluyen 14 días de prueba gratuita • Sin tarjeta de crédito requerida
          </p>
          <p className="text-sm text-gray-500">
            ¿Necesitas un plan personalizado?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
              Contáctanos
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
