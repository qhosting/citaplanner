/**
 * Chatwoot Server Utilities
 * Funciones del lado del servidor para obtener configuración de Chatwoot
 */

import { prisma } from '@/lib/db';
import { ChatwootConfig } from './types';
import { getDefaultChatwootConfig } from './config';

/**
 * Obtiene la configuración de Chatwoot para un tenant
 * Intenta obtener la configuración desde la base de datos
 * Si no existe, usa la configuración por defecto de las variables de entorno
 */
export async function getChatwootConfigForTenant(
  tenantId: string
): Promise<ChatwootConfig | null> {
  try {
    // Buscar configuración activa del tenant en la base de datos
    const dbConfig = await prisma.chatwootConfig.findFirst({
      where: {
        tenantId,
        isActive: true,
        branchId: null, // Configuración global del tenant
      },
      orderBy: {
        isDefault: 'desc', // Priorizar configuración por defecto
      },
    });

    if (dbConfig) {
      return {
        websiteToken: dbConfig.websiteToken,
        baseUrl: dbConfig.baseUrl,
        enabled: dbConfig.isActive,
      };
    }

    // Si no hay configuración en la base de datos, usar la global
    return getDefaultChatwootConfig();
  } catch (error) {
    console.error('Error obteniendo configuración de Chatwoot:', error);
    // En caso de error, intentar usar la configuración por defecto
    return getDefaultChatwootConfig();
  }
}

/**
 * Obtiene la configuración de Chatwoot para un tenant y branch específicos
 */
export async function getChatwootConfigForBranch(
  tenantId: string,
  branchId: string
): Promise<ChatwootConfig | null> {
  try {
    // Buscar configuración activa del branch
    const branchConfig = await prisma.chatwootConfig.findFirst({
      where: {
        tenantId,
        branchId,
        isActive: true,
      },
    });

    if (branchConfig) {
      return {
        websiteToken: branchConfig.websiteToken,
        baseUrl: branchConfig.baseUrl,
        enabled: branchConfig.isActive,
      };
    }

    // Si no hay configuración específica del branch, usar la del tenant
    return getChatwootConfigForTenant(tenantId);
  } catch (error) {
    console.error('Error obteniendo configuración de Chatwoot para branch:', error);
    return getChatwootConfigForTenant(tenantId);
  }
}
