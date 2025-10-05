
'use client'

import { useState } from 'react'

/**
 * 🌱 SEED DATABASE UI
 * 
 * Interfaz simple para ejecutar el script de seed desde el navegador.
 * 
 * ⚠️ ADVERTENCIA: Este proceso ELIMINARÁ todos los usuarios existentes.
 * 
 * Para eliminar esta página después de usarla:
 * 1. Eliminar este archivo: /app/admin/seed/page.tsx
 * 2. Eliminar el endpoint API: /app/api/seed/route.ts
 * 3. Commit y push los cambios
 * 4. Redesplegar la aplicación
 */

export default function SeedPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const executeSeed = async () => {
    if (!confirm('⚠️ ADVERTENCIA: Este proceso ELIMINARÁ todos los usuarios existentes y creará datos de prueba.\n\n¿Estás seguro de que deseas continuar?')) {
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Si tienes un token configurado, agrégalo aquí:
          // 'x-seed-token': 'tu-token-secreto'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error ejecutando seed')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌱 Seed Database
          </h1>
          <p className="text-lg text-gray-600">
            Poblar la base de datos con datos de prueba
          </p>
        </div>

        {/* Warning Card */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">
                ⚠️ Advertencia Importante
              </h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>• Este proceso <strong>ELIMINARÁ todos los usuarios existentes</strong></p>
                <p>• Solo debe usarse en entornos de desarrollo o staging</p>
                <p>• Los datos creados son solo para pruebas</p>
                <p>• Asegúrate de tener un respaldo si es necesario</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            📋 Datos que se crearán:
          </h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start">
              <span className="text-2xl mr-3">🏢</span>
              <div>
                <strong>1 Empresa:</strong> Bella Vita Spa & Wellness
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">🏪</span>
              <div>
                <strong>1 Sucursal:</strong> Sucursal Centro
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">👥</span>
              <div>
                <strong>5 Usuarios:</strong>
                <ul className="mt-2 space-y-1 ml-4 text-sm">
                  <li>• Admin: admin@citaplanner.com / admin123</li>
                  <li>• Manager: manager@citaplanner.com / manager123</li>
                  <li>• Profesional 1: pro1@citaplanner.com / prof123</li>
                  <li>• Profesional 2: pro2@citaplanner.com / prof123</li>
                  <li>• Recepcionista: recepcionista@citaplanner.com / prof123</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">💆</span>
              <div>
                <strong>6 Servicios:</strong> Masajes, faciales, manicure, cortes, etc.
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">👤</span>
              <div>
                <strong>6 Clientes:</strong> Clientes de prueba con datos realistas
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">📅</span>
              <div>
                <strong>6 Citas:</strong> Algunas completadas, algunas pendientes
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-2xl mr-3">💰</span>
              <div>
                <strong>3 Pagos:</strong> Para las citas completadas
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center mb-8">
          <button
            onClick={executeSeed}
            disabled={loading}
            className={`
              px-8 py-4 rounded-lg text-lg font-semibold text-white
              transition-all duration-200 transform hover:scale-105
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }
            `}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Ejecutando Seed...
              </span>
            ) : (
              '🚀 Ejecutar Seed'
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800 mb-2">
                  ❌ Error
                </h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Display */}
        {result && result.success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3 w-full">
                <h3 className="text-lg font-medium text-green-800 mb-4">
                  ✅ Seed Completado Exitosamente
                </h3>
                
                {/* Summary */}
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">📊 Resumen:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <div>• Servicios: {result.data.counts.services}</div>
                    <div>• Clientes: {result.data.counts.clients}</div>
                    <div>• Citas: {result.data.counts.appointments}</div>
                    <div>• Pagos: {result.data.counts.payments}</div>
                  </div>
                </div>

                {/* Credentials */}
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">🔑 Credenciales de Acceso:</h4>
                  <div className="space-y-2">
                    {result.data.users.map((user: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded p-3 text-sm">
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-gray-600 mt-1">
                          <span className="font-mono">{user.email}</span>
                          {' / '}
                          <span className="font-mono">{user.password}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Rol: {user.role}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">🎯 Próximos Pasos:</h4>
                  <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                    <li>Inicia sesión con cualquiera de las credenciales anteriores</li>
                    <li>Explora el sistema con los datos de prueba</li>
                    <li>Cuando termines, elimina este endpoint por seguridad</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Removal Instructions */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🗑️ Cómo eliminar este endpoint después de usarlo:
          </h3>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
            <li>Eliminar el archivo: <code className="bg-gray-200 px-2 py-1 rounded">/app/api/seed/route.ts</code></li>
            <li>Eliminar esta página: <code className="bg-gray-200 px-2 py-1 rounded">/app/admin/seed/page.tsx</code></li>
            <li>Hacer commit y push de los cambios</li>
            <li>Redesplegar la aplicación en Easypanel</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
