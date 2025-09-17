
'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const errorMessages: Record<string, string> = {
  'Signin': 'Error al iniciar sesión',
  'OAuthSignin': 'Error al iniciar sesión con proveedor externo',
  'OAuthCallback': 'Error en el callback de autenticación',
  'OAuthCreateAccount': 'Error al crear cuenta con proveedor externo',
  'EmailCreateAccount': 'Error al crear cuenta con email',
  'Callback': 'Error de callback de autenticación',
  'OAuthAccountNotLinked': 'Esta cuenta ya está vinculada a otro método de autenticación',
  'EmailSignin': 'Error al enviar email de autenticación',
  'CredentialsSignin': 'Credenciales inválidas',
  'SessionRequired': 'Se requiere iniciar sesión',
  'default': 'Ha ocurrido un error de autenticación'
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams?.get('error') || 'default'
  const errorMessage = errorMessages[error] || errorMessages.default

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo y título */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-red-600 p-3 rounded-full">
              <CalendarDays className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">CitaPlanner</h1>
        </div>

        {/* Error Card */}
        <Card className="shadow-xl border-red-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <CardTitle className="text-red-900">Error de Autenticación</CardTitle>
            <CardDescription className="text-red-700">
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-gray-600 space-y-2">
              <p>Por favor, intenta de nuevo o contacta al soporte si el problema persiste.</p>
            </div>

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/auth/signin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Inicio de Sesión
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/signup">
                  Crear Nueva Cuenta
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda?{' '}
            <a href="mailto:soporte@citaplanner.com" className="text-blue-600 hover:text-blue-800">
              Contacta Soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
