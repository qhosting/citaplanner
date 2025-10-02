
'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'María González',
    role: 'Dueña de Salón de Belleza',
    business: 'Belleza Total',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    content: 'CitaPlanner transformó completamente mi negocio. Ahora puedo gestionar 3 sucursales desde mi teléfono y mis ingresos aumentaron un 45% en solo 6 meses.',
    rating: 5,
  },
  {
    name: 'Carlos Ramírez',
    role: 'Director de Spa',
    business: 'Zen Wellness Spa',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    content: 'La mejor inversión que hice para mi spa. Los recordatorios automáticos redujeron las ausencias en un 70% y el sistema POS integrado simplificó todo.',
    rating: 5,
  },
  {
    name: 'Ana Martínez',
    role: 'Estilista Independiente',
    business: 'Studio Ana',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    content: 'Como profesional independiente, necesitaba algo simple pero poderoso. CitaPlanner es perfecto: fácil de usar y mis clientes aman poder reservar online.',
    rating: 5,
  },
  {
    name: 'Roberto Silva',
    role: 'Gerente de Clínica',
    business: 'Clínica Estética Premium',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto',
    content: 'El nivel de detalle en los reportes es impresionante. Ahora tomo decisiones basadas en datos reales y puedo identificar oportunidades de crecimiento fácilmente.',
    rating: 5,
  },
  {
    name: 'Laura Fernández',
    role: 'Propietaria de Barbería',
    business: 'Barber House',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
    content: 'Mis clientes están encantados con la facilidad de reservar citas. El sistema es intuitivo y el soporte técnico es excepcional, siempre disponibles.',
    rating: 5,
  },
  {
    name: 'Diego Torres',
    role: 'Masajista Profesional',
    business: 'Terapias Holísticas',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego',
    content: 'Llevo usando CitaPlanner 2 años y no puedo imaginar trabajar sin él. La gestión de clientes y el historial de sesiones es invaluable para mi práctica.',
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Lo que dicen{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              nuestros clientes
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Miles de profesionales confían en CitaPlanner para gestionar sus negocios. 
            Descubre por qué somos la opción #1 en el mercado.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="h-12 w-12 text-blue-600" />
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 leading-relaxed mb-6 relative z-10">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full ring-2 ring-blue-100"
                  />
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-xs text-blue-600">{testimonial.business}</div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600 mb-6">Confiado por profesionales en toda Latinoamérica</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            {['México', 'Colombia', 'Argentina', 'Chile', 'Perú', 'España'].map((country, index) => (
              <div key={index} className="text-lg font-semibold text-gray-400">
                {country}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
