
export interface WhatsAppOptions {
  to: string;
  message: string;
  delay?: number;
  linkPreview?: boolean;
}

export class WhatsAppService {
  private apiUrl: string | null = null;
  private apiKey: string | null = null;
  private instance: string | null = null;

  constructor() {
    this.initializeConfig();
  }

  private initializeConfig() {
    this.apiUrl = process.env.EVOLUTION_API_URL || null;
    this.apiKey = process.env.EVOLUTION_API_KEY || null;
    this.instance = process.env.EVOLUTION_INSTANCE || null;

    if (!this.apiUrl || !this.apiKey || !this.instance) {
      console.warn('WhatsApp service not configured. Evolution API credentials missing.');
    }
  }

  async sendWhatsApp(options: WhatsAppOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.apiUrl || !this.apiKey || !this.instance) {
      return {
        success: false,
        error: 'WhatsApp service not configured',
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/message/sendText/${this.instance}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
        },
        body: JSON.stringify({
          number: options.to,
          text: options.message,
          delay: options.delay || 0,
          linkPreview: options.linkPreview !== false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        messageId: data.key?.id || data.messageId,
      };
    } catch (error: any) {
      console.error('WhatsApp sending error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.apiUrl || !this.apiKey || !this.instance) {
      return false;
    }

    try {
      const response = await fetch(`${this.apiUrl}/instance/connectionState/${this.instance}`, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('WhatsApp connection test failed:', error);
      return false;
    }
  }
}

export const whatsAppService = new WhatsAppService();
