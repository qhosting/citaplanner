
'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import { StaffSidebar } from '@/components/staff/staff-sidebar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface StaffLayoutProps {
  children: ReactNode
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!session || !['PROFESSIONAL', 'MANAGER', 'RECEPTIONIST'].includes((session.user as any)?.role)) {
    redirect('/auth/signin')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <StaffSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
