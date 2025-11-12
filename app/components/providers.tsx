
'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from './theme-provider'
import { Toaster } from 'sonner'
import { Toaster as HotToaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { NotificationProvider, NotificationToast } from './realtime-notifications'
import { ChatwootProvider } from './chatwoot'

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
        <NotificationProvider>
          <ChatwootProvider>
            {children}
            <NotificationToast />
            <Toaster position="top-right" richColors />
            <HotToaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#363636',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </ChatwootProvider>
        </NotificationProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
