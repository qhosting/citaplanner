
'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import { SuperAdminSidebar } from '@/components/superadmin/super-admin-sidebar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface SuperAdminLayoutProps {
  children: ReactNode
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!session || (session.user as any)?.role !== 'SUPERADMIN') {
    redirect('/auth/signin')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <SuperAdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
