'use client'

import { useEffect, useState } from 'react'

interface SystemVersion {
  version: string
  gitCommitSha: string
  buildDate: string
  environment: string
}

interface UseSystemVersionReturn {
  version: string | null
  fullInfo: SystemVersion | null
  isLoading: boolean
  error: Error | null
}

/**
 * Hook personalizado para obtener la versión del sistema
 * 
 * @returns {UseSystemVersionReturn} - Estado de la versión del sistema
 */
export function useSystemVersion(): UseSystemVersionReturn {
  const [version, setVersion] = useState<string | null>(null)
  const [fullInfo, setFullInfo] = useState<SystemVersion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchVersion() {
      try {
        const response = await fetch('/api/system/version')
        const data = await response.json()

        if (data.success && data.data) {
          setVersion(data.data.version)
          setFullInfo(data.data)
        } else {
          throw new Error('Error obteniendo versión del sistema')
        }
      } catch (err) {
        console.error('Error fetching system version:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
        // Fallback a una versión por defecto
        setVersion('1.9.0')
      } finally {
        setIsLoading(false)
      }
    }

    fetchVersion()
  }, [])

  return { version, fullInfo, isLoading, error }
}
