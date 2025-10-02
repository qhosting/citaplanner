
'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Clock, Users, DollarSign } from 'lucide-react'

const benefits = [
  {
    icon: TrendingUp,
    title: 'Aumenta tus Ingresos',
    description: 'Incrementa tus ventas hasta un 40% con reservas online 24/7 y recordatorios automáticos que reducen las ausencias.',
    stat: '+40%',
    statLabel: 'Aumento promedio en ventas',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: Clock,
    title: 'Ahorra Tiempo',
    description: 'Automatiza tareas administrativas y ahorra hasta 15 horas semanales que puedes dedicar a hacer crecer tu negocio.',
    stat: '15h',
    statLabel: 'Ahorradas por semana',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: Users,
    title: 'Mejora la Experiencia',
    description: 'Ofrece una experiencia premium a tus clientes con reservas fáciles, recordatorios y un servicio más personalizado.',
    stat: '95%',
    statLabel: 'Satisfacción del cliente',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: DollarSign,
    title: 'Reduce Costos',
    description: 'Elimina gastos en múltiples herramientas y reduce costos operativos con una solución todo-en-uno eficiente.',
    stat: '-60%',
    statLabel: 'Reducción en costos',
    color: 'from-orange-500 to-red-600',
  },
]

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Beneficios que{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              transforman tu negocio
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre cómo CitaPlanner puede ayudarte a alcanzar tus objetivos de negocio 
            y llevar tu empresa al siguiente nivel.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 p-4 rounded-xl bg-gradient-to-br ${benefit.color}`}>
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {benefit.description}
                  </p>
                  
                  <div className={`inline-flex items-baseline space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r ${benefit.color} bg-opacity-10`}>
                    <span className={`text-3xl font-bold bg-gradient-to-r ${benefit.color} bg-clip-text text-transparent`}>
                      {benefit.stat}
                    </span>
                    <span className="text-sm text-gray-600">{benefit.statLabel}</span>
                  </div>
                </div>
              </div>

              {/* Decorative gradient border on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`} />
            </motion.div>
          ))}
        </div>

        {/* Additional Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: '10,000+', label: 'Negocios Activos' },
            { value: '500K+', label: 'Citas Gestionadas' },
            { value: '4.9/5', label: 'Calificación' },
            { value: '24/7', label: 'Soporte' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
