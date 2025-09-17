
'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from './theme-provider'
import { Toaster } from 'sonner'
import { useState, useEffect } from 'react'

interface ProvidersProps {
  children: React.ReactNode
  session?: any
}

export function Providers({ children, session }: ProvidersProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </SessionProvider>
  )
}
