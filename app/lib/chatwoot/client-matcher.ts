/**
 * Chatwoot Client Matcher
 * 
 * Servicio para detectar y vincular automáticamente clientes
 * basándose en el número de teléfono del contacto de Chatwoot
 */

import { prisma } from '@/lib/db';
import { chatwootApiService } from './api';
import { Client } from '@prisma/client';

export interface ClientMatchResult {
  matched: boolean;
  client?: Client;
  contact?: any;
  action: 'found' | 'created' | 'none';
  message: string;
}

export class ChatwootClientMatcher {
  /**
   * Normaliza un número de teléfono para comparación
   * Remueve espacios, guiones, paréntesis y otros caracteres especiales
   */
  normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remover todos los caracteres no numéricos excepto el +
    let normalized = phone.replace(/[^\d+]/g, '');
    
    // Si el número comienza con 00, reemplazar por +
    if (normalized.startsWith('00')) {
      normalized = '+' + normalized.substring(2);
    }
    
    // Si el número no tiene código de país y es de México, agregar +52
    if (!normalized.startsWith('+') && normalized.length === 10) {
      normalized = '+52' + normalized;
    }
    
    return normalized;
  }

  /**
   * Busca un cliente en la base de datos por número de teléfono
   */
  async findClientByPhone(
    phoneNumber: string,
    tenantId: string
  ): Promise<Client | null> {
    try {
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      
      // Buscar coincidencia exacta primero
      let client = await prisma.client.findFirst({
        where: {
          phone: normalizedPhone,
          tenantId,
        },
      });

      // Si no se encuentra, intentar con variaciones
      if (!client) {
        // Buscar sin código de país
        const phoneWithoutCountryCode = normalizedPhone.replace(/^\+\d{1,3}/, '');
        
        client = await prisma.client.findFirst({
          where: {
            tenantId,
            OR: [
              { phone: { contains: phoneWithoutCountryCode } },
              { phone: normalizedPhone },
            ],
          },
        });
      }

      return client;
    } catch (error) {
      console.error('[ClientMatcher] Error buscando cliente:', error);
      return null;
    }
  }

  /**
   * Detecta y vincula un cliente desde Chatwoot
   */
  async matchClientFromChatwootContact(
    chatwootContactId: number,
    phoneNumber: string,
    tenantId: string,
    contactName?: string
  ): Promise<ClientMatchResult> {
    try {
      // 1. Buscar cliente existente por teléfono
      const existingClient = await this.findClientByPhone(phoneNumber, tenantId);

      if (existingClient) {
        // Cliente encontrado, actualizar chatwootContactId si es necesario
        if (!existingClient.chatwootContactId) {
          await prisma.client.update({
            where: { id: existingClient.id },
            data: { chatwootContactId: chatwootContactId.toString() },
          });
        }

        // Actualizar atributos personalizados en Chatwoot
        await this.updateChatwootContactAttributes(chatwootContactId, existingClient, tenantId);

        return {
          matched: true,
          client: existingClient,
          action: 'found',
          message: `Cliente existente vinculado: ${existingClient.firstName} ${existingClient.lastName}`,
        };
      }

      // 2. Cliente no encontrado - opcionalmente crear uno nuevo
      // Por ahora solo reportamos que no se encontró
      return {
        matched: false,
        action: 'none',
        message: 'Cliente no encontrado en la base de datos',
      };

      // NOTA: La creación automática de clientes está deshabilitada por seguridad
      // Si se desea habilitar, descomentar el siguiente código:
      /*
      const [firstName, ...lastNameParts] = (contactName || 'Cliente Nuevo').split(' ');
      const lastName = lastNameParts.join(' ') || 'Sin Apellido';

      const newClient = await prisma.client.create({
        data: {
          firstName,
          lastName,
          phone: this.normalizePhoneNumber(phoneNumber),
          tenantId,
          chatwootContactId: chatwootContactId.toString(),
          notes: 'Creado automáticamente desde Chatwoot',
        },
      });

      await this.updateChatwootContactAttributes(chatwootContactId, newClient, tenantId);

      return {
        matched: true,
        client: newClient,
        action: 'created',
        message: `Cliente creado automáticamente: ${newClient.firstName} ${newClient.lastName}`,
      };
      */
    } catch (error: any) {
      console.error('[ClientMatcher] Error en proceso de matching:', error);
      return {
        matched: false,
        action: 'none',
        message: `Error: ${error.message}`,
      };
    }
  }

  /**
   * Actualiza los atributos personalizados del contacto en Chatwoot
   */
  async updateChatwootContactAttributes(
    chatwootContactId: number,
    client: Client,
    tenantId: string
  ): Promise<void> {
    try {
      // Obtener información adicional del cliente
      const clientWithDetails = await prisma.client.findUnique({
        where: { id: client.id },
        include: {
          appointments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              startTime: true,
              service: { select: { name: true } },
            },
          },
          _count: {
            select: {
              appointments: true,
            },
          },
        },
      });

      if (!clientWithDetails) return;

      // Configurar servicio de Chatwoot
      await chatwootApiService.loadConfigForTenant(tenantId);

      // Preparar atributos personalizados
      const customAttributes: Record<string, any> = {
        client_id: client.id,
        tenant_id: tenantId,
        total_appointments: clientWithDetails._count.appointments,
        is_registered: true,
      };

      if (client.email) {
        customAttributes.email = client.email;
      }

      if (client.birthday) {
        customAttributes.birthday = client.birthday.toISOString().split('T')[0];
      }

      if (clientWithDetails.appointments.length > 0) {
        const lastAppointment = clientWithDetails.appointments[0];
        customAttributes.last_appointment = lastAppointment.startTime.toISOString();
        customAttributes.last_service = lastAppointment.service.name;
      }

      // Actualizar contacto en Chatwoot
      await chatwootApiService.updateContact(chatwootContactId, {
        name: `${client.firstName} ${client.lastName}`,
        email: client.email || undefined,
        custom_attributes: customAttributes,
      });

      console.log(`[ClientMatcher] Atributos actualizados para contacto ${chatwootContactId}`);
    } catch (error) {
      console.error('[ClientMatcher] Error actualizando atributos de Chatwoot:', error);
    }
  }

  /**
   * Sincroniza todos los clientes de un tenant con Chatwoot
   * (Función útil para migración inicial)
   */
  async syncAllClientsToChat woot(tenantId: string): Promise<{
    total: number;
    synced: number;
    errors: number;
  }> {
    try {
      // Configurar servicio
      await chatwootApiService.loadConfigForTenant(tenantId);

      const clients = await prisma.client.findMany({
        where: {
          tenantId,
          isActive: true,
        },
      });

      let synced = 0;
      let errors = 0;

      for (const client of clients) {
        try {
          // Buscar o crear contacto en Chatwoot
          const contact = await chatwootApiService.findOrCreateContact({
            name: `${client.firstName} ${client.lastName}`,
            phone_number: client.phone,
            email: client.email || undefined,
            identifier: client.id,
          });

          if (contact) {
            // Actualizar cliente con chatwootContactId
            await prisma.client.update({
              where: { id: client.id },
              data: { chatwootContactId: contact.id.toString() },
            });

            // Actualizar atributos
            await this.updateChatwootContactAttributes(contact.id, client, tenantId);

            synced++;
          } else {
            errors++;
          }
        } catch (error) {
          console.error(`[ClientMatcher] Error sincronizando cliente ${client.id}:`, error);
          errors++;
        }

        // Pequeño delay para evitar rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      return {
        total: clients.length,
        synced,
        errors,
      };
    } catch (error) {
      console.error('[ClientMatcher] Error en sincronización masiva:', error);
      throw error;
    }
  }
}

// Instancia singleton
export const chatwootClientMatcher = new ChatwootClientMatcher();
