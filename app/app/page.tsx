
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session?.user) {
    // Redirección basada en el rol del usuario
    const userRole = (session.user as any)?.role
    
    switch (userRole) {
      case 'SUPERADMIN':
        redirect('/superadmin')
      case 'ADMIN':
        redirect('/admin')
      case 'CLIENT':
        redirect('/client')
      case 'PROFESSIONAL':
      case 'MANAGER':
      case 'RECEPTIONIST':
        redirect('/staff')
      default:
        redirect('/dashboard')
    }
  } else {
    redirect('/auth/signin')
  }
}
