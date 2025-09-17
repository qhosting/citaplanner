
interface SMSConfig {
  username: string
  password: string
  apiUrl: string
}

interface SMSMessage {
  to: string
  message: string
  sender?: string
}

interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
  data?: any
}

class SMSService {
  private config: SMSConfig

  constructor() {
    this.config = {
      username: process.env.LABSMOBILE_USERNAME || '',
      password: process.env.LABSMOBILE_PASSWORD || '',
      apiUrl: 'https://api.labsmobile.com/json/send'
    }
  }

  async sendSMS(message: SMSMessage): Promise<SMSResult> {
    try {
      const requestData = {
        username: this.config.username,
        password: this.config.password,
        msisdn: message.to,
        message: message.message,
        sender: message.sender || 'CitaPlanner'
      }

      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()

      if (response.ok && result.code === '0') {
        return {
          success: true,
          messageId: result.message_id,
          data: result
        }
      } else {
        return {
          success: false,
          error: result.message || 'Error enviando SMS'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error de conexión con LabsMobile'
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
  ): Promise<SMSResult> {
    const message = `Hola ${customerName}! Te recordamos tu cita de ${serviceName} programada para ${appointmentDate} a las ${appointmentTime}. Gracias por elegirnos. - ${companyName}`

    return this.sendSMS({
      to: phoneNumber,
      message,
      sender: companyName.substring(0, 11) // LabsMobile limit
    })
  }

  async sendAppointmentConfirmation(
    phoneNumber: string,
    customerName: string,
    serviceName: string,
    appointmentDate: string,
    appointmentTime: string,
    companyName: string
  ): Promise<SMSResult> {
    const message = `¡Cita confirmada! Hola ${customerName}, tu cita de ${serviceName} está confirmada para ${appointmentDate} a las ${appointmentTime}. ¡Te esperamos! - ${companyName}`

    return this.sendSMS({
      to: phoneNumber,
      message,
      sender: companyName.substring(0, 11)
    })
  }

  async sendAppointmentCancellation(
    phoneNumber: string,
    customerName: string,
    serviceName: string,
    appointmentDate: string,
    appointmentTime: string,
    companyName: string
  ): Promise<SMSResult> {
    const message = `Hola ${customerName}, tu cita de ${serviceName} programada para ${appointmentDate} a las ${appointmentTime} ha sido cancelada. Para reprogramar, contáctanos. - ${companyName}`

    return this.sendSMS({
      to: phoneNumber,
      message,
      sender: companyName.substring(0, 11)
    })
  }

  async sendPromotionalMessage(
    phoneNumber: string,
    customerName: string,
    promotionDetails: string,
    companyName: string
  ): Promise<SMSResult> {
    const message = `¡Oferta especial para ${customerName}! ${promotionDetails} Agenda ahora y aprovecha esta promoción limitada. - ${companyName}`

    return this.sendSMS({
      to: phoneNumber,
      message,
      sender: companyName.substring(0, 11)
    })
  }

  // Verificar balance de SMS
  async getBalance(): Promise<{ success: boolean; balance?: number; error?: string }> {
    try {
      const response = await fetch('https://api.labsmobile.com/json/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.config.username,
          password: this.config.password
        })
      })

      const result = await response.json()

      if (response.ok && result.code === '0') {
        return {
          success: true,
          balance: result.balance
        }
      } else {
        return {
          success: false,
          error: result.message || 'Error obteniendo balance'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error de conexión con LabsMobile'
      }
    }
  }
}

export const smsService = new SMSService()
export type { SMSMessage, SMSResult }
