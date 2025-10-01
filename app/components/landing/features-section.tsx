
'use client'

import { motion } from 'framer-motion'
import {
  Calendar,
  Users,
  ShoppingCart,
  BarChart3,
  Bell,
  Smartphone,
  CreditCard,
  MessageSquare,
  Clock,
  Shield,
  Zap,
  Globe,
} from 'lucide-react'

const features = [
  {
    icon: Calendar,
    title: 'Agenda Inteligente',
    description: 'Sistema de reservas online 24/7 con sincronización en tiempo real y gestión de disponibilidad.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Users,
    title: 'CRM Completo',
    description: 'Gestiona toda la información de tus clientes, historial de citas y preferencias en un solo lugar.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: ShoppingCart,
    title: 'Sistema POS',
    description: 'Procesa ventas, gestiona inventario y acepta múltiples métodos de pago de forma integrada.',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: BarChart3,
    title: 'Reportes y Análisis',
    description: 'Dashboards interactivos con métricas clave para tomar decisiones basadas en datos.',
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: Bell,
    title: 'Recordatorios Automáticos',
    description: 'Envía notificaciones por SMS, email y WhatsApp para reducir ausencias y cancelaciones.',
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: Smartphone,
    title: 'App Móvil',
    description: 'Gestiona tu negocio desde cualquier lugar con nuestras apps nativas para iOS y Android.',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    icon: CreditCard,
    title: 'Pagos Online',
    description: 'Acepta pagos anticipados y depósitos con integración de pasarelas de pago seguras.',
    color: 'from-teal-500 to-teal-600',
  },
  {
    icon: MessageSquare,
    title: 'Chat Integrado',
    description: 'Comunícate con tus clientes directamente desde la plataforma con mensajería instantánea.',
    color: 'from-red-500 to-red-600',
  },
  {
    icon: Clock,
    title: 'Gestión de Turnos',
    description: 'Organiza horarios de tu equipo, controla asistencia y optimiza la productividad.',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    icon: Shield,
    title: 'Seguridad Avanzada',
    description: 'Protección de datos con encriptación de nivel empresarial y cumplimiento GDPR.',
    color: 'from-gray-500 to-gray-600',
  },
  {
    icon: Zap,
    title: 'Automatizaciones',
    description: 'Automatiza tareas repetitivas y flujos de trabajo para ahorrar tiempo valioso.',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    icon: Globe,
    title: 'Multi-sucursal',
    description: 'Gestiona múltiples ubicaciones desde una sola cuenta con control centralizado.',
    color: 'from-violet-500 to-violet-600',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Todo lo que necesitas para{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              hacer crecer tu negocio
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Una plataforma completa con todas las herramientas que necesitas para gestionar 
            tu negocio de belleza y bienestar de manera profesional.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300" 
                   style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
              
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>

              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
