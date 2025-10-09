
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { VersionDisplay } from '@/components/version-display'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CitaPlanner - Gestión de Citas Profesional',
  description: 'Plataforma integral SaaS para la gestión de negocios basados en citas. Agenda, CRM, POS y más.',
  keywords: ['citas', 'agenda', 'CRM', 'POS', 'belleza', 'salud', 'bienestar'],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="es">
      <body className={inter.className} suppressHydrationWarning>
        <Providers session={session}>
          {children}
          <VersionDisplay />
        </Providers>
      </body>
    </html>
  )
}
