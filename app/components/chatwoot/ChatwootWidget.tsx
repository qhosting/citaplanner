
'use client';

/**
 * Chatwoot Widget Component
 * Componente de React para integrar el widget de Chatwoot en CitaPlanner
 * Soporta configuración multi-tenant e identificación de usuarios
 */

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  ChatwootConfig,
  ChatwootSettings,
  ChatwootUser,
  ChatwootCustomAttributes,
} from '@/lib/chatwoot/types';
import {
  defaultChatwootSettings,
  sanitizeBaseUrl,
  isChatwootEnabled,
} from '@/lib/chatwoot/config';

interface ChatwootWidgetProps {
  config: ChatwootConfig | null;
  settings?: Partial<ChatwootSettings>;
  customAttributes?: Partial<ChatwootCustomAttributes>;
}

export default function ChatwootWidget({
  config,
  settings = {},
  customAttributes = {},
}: ChatwootWidgetProps) {
  const { data: session } = useSession();
  const scriptLoadedRef = useRef(false);
  const sdkInitializedRef = useRef(false);

  useEffect(() => {
    // No cargar el widget si no hay configuración o no está habilitado
    if (!isChatwootEnabled(config)) {
      return;
    }

    // Evitar cargar el script múltiples veces
    if (scriptLoadedRef.current) {
      return;
    }

    const baseUrl = sanitizeBaseUrl(config.baseUrl);
    const mergedSettings = { ...defaultChatwootSettings, ...settings };

    // Configurar window.chatwootSettings antes de cargar el SDK
    window.chatwootSettings = mergedSettings;

    // Cargar el SDK de Chatwoot
    (function (d, t) {
      const g = d.createElement(t) as HTMLScriptElement;
      const s = d.getElementsByTagName(t)[0];
      g.src = `${baseUrl}/packs/js/sdk.js`;
      g.defer = true;
      g.async = true;

      g.onload = function () {
        scriptLoadedRef.current = true;
        
        if (window.chatwootSDK && !sdkInitializedRef.current) {
          window.chatwootSDK.run({
            websiteToken: config.websiteToken,
            baseUrl: baseUrl,
          });
          sdkInitializedRef.current = true;
          
          // Si hay un usuario autenticado, identificarlo
          if (session?.user && window.$chatwoot) {
            identifyUser();
          }
        }
      };

      g.onerror = function () {
        console.error('Error al cargar el SDK de Chatwoot');
      };

      s.parentNode?.insertBefore(g, s);
    })(document, 'script');

    // Función para identificar al usuario en Chatwoot
    function identifyUser() {
      if (!session?.user || !window.$chatwoot) return;

      const user = session.user as any;
      
      const chatwootUser: ChatwootUser = {
        identifier: user.id,
        name: user.name || user.email || 'Usuario',
        email: user.email,
        avatar_url: user.image,
        phone_number: user.phone,
      };

      // Atributos personalizados
      const attributes: ChatwootCustomAttributes = {
        tenantId: user.tenantId || 'unknown',
        tenantName: user.tenantName || 'N/A',
        role: user.role || 'USER',
        ...customAttributes,
      };

      // Identificar usuario
      window.$chatwoot.setUser(chatwootUser.identifier, chatwootUser);
      
      // Establecer atributos personalizados
      window.$chatwoot.setCustomAttributes(attributes);
    }

    // Cleanup function
    return () => {
      // No eliminamos el script para evitar recargas innecesarias
      // pero podríamos resetear el usuario si es necesario
    };
  }, [config, settings, session, customAttributes]);

  // Efecto separado para actualizar el usuario cuando la sesión cambia
  useEffect(() => {
    if (
      scriptLoadedRef.current &&
      sdkInitializedRef.current &&
      session?.user &&
      window.$chatwoot
    ) {
      const user = session.user as any;
      
      const chatwootUser: ChatwootUser = {
        identifier: user.id,
        name: user.name || user.email || 'Usuario',
        email: user.email,
        avatar_url: user.image,
        phone_number: user.phone,
      };

      const attributes: ChatwootCustomAttributes = {
        tenantId: user.tenantId || 'unknown',
        tenantName: user.tenantName || 'N/A',
        role: user.role || 'USER',
        ...customAttributes,
      };

      window.$chatwoot.setUser(chatwootUser.identifier, chatwootUser);
      window.$chatwoot.setCustomAttributes(attributes);
    }
  }, [session, customAttributes]);

  // Este componente no renderiza nada visible
  return null;
}
