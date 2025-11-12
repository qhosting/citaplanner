'use client';

/**
 * Chatwoot Provider Component
 * Proveedor de Chatwoot que maneja la configuración y el widget
 * Este componente se debe usar en el nivel de providers para toda la aplicación
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ChatwootWidget from './ChatwootWidget';
import { ChatwootConfig } from '@/lib/chatwoot/types';

interface ChatwootProviderProps {
  children: React.ReactNode;
}

export default function ChatwootProvider({ children }: ChatwootProviderProps) {
  const { data: session } = useSession();
  const [config, setConfig] = useState<ChatwootConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        // Solo cargar la configuración si hay un usuario autenticado
        if (!session?.user) {
          setLoading(false);
          return;
        }

        // Obtener la configuración de Chatwoot para el tenant del usuario
        const response = await fetch('/api/chatwoot/config');
        
        if (response.ok) {
          const data = await response.json();
          setConfig(data.config);
        } else {
          console.warn('No se pudo obtener la configuración de Chatwoot');
          setConfig(null);
        }
      } catch (error) {
        console.error('Error cargando configuración de Chatwoot:', error);
        setConfig(null);
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, [session]);

  return (
    <>
      {children}
      {!loading && config && <ChatwootWidget config={config} />}
    </>
  );
}
