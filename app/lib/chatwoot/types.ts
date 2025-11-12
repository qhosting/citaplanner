
/**
 * Chatwoot Integration Types
 * Tipos TypeScript para la integración de Chatwoot en CitaPlanner
 */

/**
 * Configuración de Chatwoot
 */
export interface ChatwootConfig {
  websiteToken: string;
  baseUrl: string;
  enabled: boolean;
}

/**
 * Configuración del widget de Chatwoot
 */
export interface ChatwootSettings {
  hideMessageBubble?: boolean;
  position?: 'left' | 'right';
  locale?: string;
  type?: 'standard' | 'expanded_bubble';
  launcherTitle?: string;
  darkMode?: 'auto' | 'light';
}

/**
 * Información del usuario para Chatwoot
 */
export interface ChatwootUser {
  identifier: string;
  name: string;
  email?: string;
  avatar_url?: string;
  phone_number?: string;
}

/**
 * Atributos personalizados para Chatwoot
 */
export interface ChatwootCustomAttributes {
  tenantId: string;
  tenantName: string;
  role: string;
  branchId?: string;
  branchName?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * SDK de Chatwoot en el objeto window
 */
declare global {
  interface Window {
    chatwootSettings?: ChatwootSettings;
    chatwootSDK?: {
      run: (config: { websiteToken: string; baseUrl: string }) => void;
    };
    $chatwoot?: {
      toggle: (state?: 'open' | 'close') => void;
      setUser: (identifier: string, user: ChatwootUser) => void;
      setCustomAttributes: (attributes: ChatwootCustomAttributes) => void;
      deleteUser: () => void;
      setLabel: (label: string) => void;
      removeLabel: (label: string) => void;
      reset: () => void;
    };
  }
}

export {};
