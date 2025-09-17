
interface WhatsAppConfig {
  apiUrl: string
  apiKey: string
  instanceId: string
}

interface WhatsAppMessage {
  to: string
  message: string
  type?: 'text' | 'template'
}

interface WhatsAppResult {
  success: boolean
  messageId?: string
  error?: string
  data?: any
}

class WhatsAppService {
  private config: WhatsAppConfig

  constructor() {
    this.config = {
      apiUrl: process.env.EVOLUTION_API_URL || 'https://api.evolutionapi.com',
      apiKey: process.env.EVOLUTION_API_KEY || '',
      instanceId: process.env.EVOLUTION_INSTANCE_ID || ''
    }
  }

  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppResult> {
    try {
      const requestData = {
        number: message.to,
        text: message.message
      }

      const response = await fetch(`${this.config.apiUrl}/message/sendText/${this.config.instanceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.config.apiKey
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()

      if (response.ok) {
        return {
          success: true,
          messageId: result.key?.id,
          data: result
        }
      } else {
        return {
          success: false,
          error: result.message || 'Error enviando mensaje de WhatsApp'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error de conexión con Evolution API'
      }
    }
  }

  async sendAppointmentReminder(
    phoneNumber: string,
    customerName: string,
    serviceName: string,
    appointmentDate: string,
    appointmentTime: string,
    companyName: string
  ): Promise<WhatsAppResult> {
    const message = `¡Hola ${customerName}! 👋\n\n` +
      `Te recordamos tu cita programada:\n` +
      `📅 **Servicio**: ${serviceName}\n` +
      `🗓️ **Fecha**: ${appointmentDate}\n` +
      `⏰ **Hora**: ${appointmentTime}\n\n` +
      `Gracias por elegirnos ✨\n\n` +
      `*${companyName}*`

    return this.sendMessage({
      to: phoneNumber,
      message
    })
  }

  async sendAppointmentConfirmation(
    phoneNumber: string,
    customerName: string,
    serviceName: string,
    appointmentDate: string,
    appointmentTime: string,
    companyName: string,
    address?: string
  ): Promise<WhatsAppResult> {
    let message = `¡Perfecto ${customerName}! ✅\n\n` +
      `Tu cita ha sido **confirmada**:\n\n` +
      `📋 **Servicio**: ${serviceName}\n` +
      `📅 **Fecha**: ${appointmentDate}\n` +
      `⏰ **Hora**: ${appointmentTime}\n`
    
    if (address) {
      message += `📍 **Ubicación**: ${address}\n`
    }
    
    message += `\n¡Te esperamos! 💫\n\n*${companyName}*`

    return this.sendMessage({
      to: phoneNumber,
      message
    })
  }

  async sendAppointmentCancellation(
    phoneNumber: string,
    customerName: string,
    serviceName: string,
    appointmentDate: string,
    appointmentTime: string,
    companyName: string
  ): Promise<WhatsAppResult> {
    const message = `Hola ${customerName} 😔\n\n` +
      `Lamentamos informarte que tu cita ha sido **cancelada**:\n\n` +
      `📋 **Servicio**: ${serviceName}\n` +
      `📅 **Fecha**: ${appointmentDate}\n` +
      `⏰ **Hora**: ${appointmentTime}\n\n` +
      `Para reagendar, contáctanos cuando gustes 📞\n\n` +
      `*${companyName}*`

    return this.sendMessage({
      to: phoneNumber,
      message
    })
  }

  async sendPromotionalMessage(
    phoneNumber: string,
    customerName: string,
    promotionTitle: string,
    promotionDetails: string,
    validUntil: string,
    companyName: string
  ): Promise<WhatsAppResult> {
    const message = `¡${customerName}! 🎉\n\n` +
      `**${promotionTitle}**\n\n` +
      `${promotionDetails}\n\n` +
      `⏳ Válido hasta: ${validUntil}\n\n` +
      `¡No te pierdas esta oportunidad! Agenda ahora 📱\n\n` +
      `*${companyName}*`

    return this.sendMessage({
      to: phoneNumber,
      message
    })
  }

  async sendWelcomeMessage(
    phoneNumber: string,
    customerName: string,
    companyName: string
  ): Promise<WhatsAppResult> {
    const message = `¡Bienvenido/a ${customerName}! 🌟\n\n` +
      `Gracias por unirte a nuestra familia de clientes.\n\n` +
      `Estamos aquí para brindarte la mejor experiencia ✨\n\n` +
      `¿En qué podemos ayudarte hoy? 💬\n\n` +
      `*${companyName}*`

    return this.sendMessage({
      to: phoneNumber,
      message
    })
  }

  async sendImageMessage(
    phoneNumber: string,
    imageUrl: string,
    caption?: string
  ): Promise<WhatsAppResult> {
    try {
      const requestData = {
        number: phoneNumber,
        mediaMessage: {
          mediatype: 'image',
          media: imageUrl,
          caption: caption || ''
        }
      }

      const response = await fetch(`${this.config.apiUrl}/message/sendMedia/${this.config.instanceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.config.apiKey
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()

      if (response.ok) {
        return {
          success: true,
          messageId: result.key?.id,
          data: result
        }
      } else {
        return {
          success: false,
          error: result.message || 'Error enviando imagen'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error de conexión con Evolution API'
      }
    }
  }

  // Verificar estado de la instancia
  async getInstanceStatus(): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
      const response = await fetch(`${this.config.apiUrl}/instance/connect/${this.config.instanceId}`, {
        method: 'GET',
        headers: {
          'apikey': this.config.apiKey
        }
      })

      const result = await response.json()

      if (response.ok) {
        return {
          success: true,
          status: result.instance?.state
        }
      } else {
        return {
          success: false,
          error: result.message || 'Error verificando estado'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error de conexión con Evolution API'
      }
    }
  }
}

export const whatsappService = new WhatsAppService()
export type { WhatsAppMessage, WhatsAppResult }
