
import twilio from 'twilio';

export interface SMSOptions {
  to: string;
  message: string;
}

export class SMSService {
  private client: any = null;
  private fromNumber: string | null = null;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.warn('SMS service not configured. Twilio credentials missing.');
      return;
    }

    this.client = twilio(accountSid, authToken);
    this.fromNumber = fromNumber;
  }

  async sendSMS(options: SMSOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.client || !this.fromNumber) {
      return {
        success: false,
        error: 'SMS service not configured',
      };
    }

    try {
      const message = await this.client.messages.create({
        body: options.message,
        from: this.fromNumber,
        to: options.to,
      });

      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error: any) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      await this.client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      return true;
    } catch (error) {
      console.error('SMS connection test failed:', error);
      return false;
    }
  }
}

export const smsService = new SMSService();
