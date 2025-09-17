
interface OpenPayConfig {
  merchantId: string
  publicKey: string
  privateKey: string
  baseUrl: string
}

interface PaymentData {
  amount: number
  currency: string
  description: string
  orderId: string
  customer: {
    name: string
    email: string
    phone?: string
  }
}

interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
  data?: any
}

class OpenPayService {
  private config: OpenPayConfig

  constructor() {
    this.config = {
      merchantId: process.env.OPENPAY_MERCHANT_ID || '',
      publicKey: process.env.OPENPAY_PUBLIC_KEY || '',
      privateKey: process.env.OPENPAY_PRIVATE_KEY || '',
      baseUrl: process.env.OPENPAY_BASE_URL || 'https://sandbox-api.openpay.mx/v1'
    }
  }

  async createPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      const requestData = {
        method: 'card',
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        order_id: paymentData.orderId,
        customer: {
          name: paymentData.customer.name,
          email: paymentData.customer.email,
          phone_number: paymentData.customer.phone
        }
      }

      const response = await fetch(`${this.config.baseUrl}/${this.config.merchantId}/charges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.config.privateKey}:`).toString('base64')}`
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()

      if (response.ok) {
        return {
          success: true,
          transactionId: result.id,
          data: result
        }
      } else {
        return {
          success: false,
          error: result.description || 'Error procesando el pago'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error de conexión con OpenPay'
      }
    }
  }

  async createCustomer(customerData: {
    name: string
    email: string
    phone?: string
    address?: string
  }) {
    try {
      const response = await fetch(`${this.config.baseUrl}/${this.config.merchantId}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.config.privateKey}:`).toString('base64')}`
        },
        body: JSON.stringify({
          name: customerData.name,
          email: customerData.email,
          phone_number: customerData.phone,
          address: customerData.address
        })
      })

      const result = await response.json()

      if (response.ok) {
        return {
          success: true,
          customerId: result.id,
          data: result
        }
      } else {
        return {
          success: false,
          error: result.description || 'Error creando cliente'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error de conexión con OpenPay'
      }
    }
  }

  generatePaymentToken(amount: number, description: string) {
    // Generar token para frontend
    return {
      merchantId: this.config.merchantId,
      publicKey: this.config.publicKey,
      amount,
      description,
      currency: 'MXN'
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResult> {
    try {
      const requestData = amount ? { amount } : {}

      const response = await fetch(
        `${this.config.baseUrl}/${this.config.merchantId}/charges/${transactionId}/refund`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${this.config.privateKey}:`).toString('base64')}`
          },
          body: JSON.stringify(requestData)
        }
      )

      const result = await response.json()

      if (response.ok) {
        return {
          success: true,
          data: result
        }
      } else {
        return {
          success: false,
          error: result.description || 'Error procesando el reembolso'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error de conexión con OpenPay'
      }
    }
  }
}

export const openPayService = new OpenPayService()
export type { PaymentData, PaymentResult }
