
/**
 * Chatwoot Configuration
 * Configuración y utilidades para Chatwoot
 */

import { ChatwootConfig, ChatwootSettings } from './types';

/**
 * Configuración por defecto del widget de Chatwoot
 */
export const defaultChatwootSettings: ChatwootSettings = {
  hideMessageBubble: false,
  position: 'right',
  locale: 'es',
  type: 'standard',
  darkMode: 'auto',
};

/**
 * Obtiene la configuración de Chatwoot desde variables de entorno
 * Esta es la configuración global, pero cada tenant puede tener la suya propia
 */
export function getDefaultChatwootConfig(): ChatwootConfig | null {
  const websiteToken = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL;

  if (!websiteToken || !baseUrl) {
    return null;
  }

  return {
    websiteToken,
    baseUrl,
    enabled: true,
  };
}

/**
 * Valida la configuración de Chatwoot
 */
export function validateChatwootConfig(
  config: Partial<ChatwootConfig>
): config is ChatwootConfig {
  return Boolean(
    config.websiteToken &&
    config.baseUrl &&
    typeof config.enabled === 'boolean'
  );
}

/**
 * Sanitiza la URL base de Chatwoot
 */
export function sanitizeBaseUrl(url: string): string {
  // Eliminar trailing slash
  return url.replace(/\/$/, '');
}

/**
 * Verifica si Chatwoot está habilitado
 */
export function isChatwootEnabled(config: ChatwootConfig | null): boolean {
  return config !== null && config.enabled && Boolean(config.websiteToken);
}
