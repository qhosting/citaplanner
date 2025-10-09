
// Tipos para el sistema de notificaciones

export enum NotificationType {
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  APPOINTMENT_CONFIRMATION = 'APPOINTMENT_CONFIRMATION',
  APPOINTMENT_CANCELLATION = 'APPOINTMENT_CANCELLATION',
  APPOINTMENT_RESCHEDULED = 'APPOINTMENT_RESCHEDULED',
  PAYMENT_REMINDER = 'PAYMENT_REMINDER',
  PAYMENT_CONFIRMATION = 'PAYMENT_CONFIRMATION',
  PROMOTION = 'PROMOTION',
  BIRTHDAY = 'BIRTHDAY',
  CUSTOM = 'CUSTOM'
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  PUSH = 'PUSH'
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED'
}

export interface NotificationSettings {
  id: string
  tenantId: string
  emailEnabled: boolean
  smsEnabled: boolean
  whatsappEnabled: boolean
  pushEnabled: boolean
  evolutionApiUrl?: string
  evolutionApiKey?: string
  evolutionInstanceName?: string
  autoRemindersEnabled: boolean
  reminderTimes: number[]
  autoConfirmationEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface NotificationTemplate {
  id: string
  tenantId: string
  name: string
  type: NotificationType
  channel: NotificationChannel
  subject?: string
  message: string
  isActive: boolean
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface NotificationLog {
  id: string
  tenantId: string
  type: NotificationType
  channel: NotificationChannel
  recipient: string
  subject?: string
  message: string
  status: NotificationStatus
  sentAt?: Date
  deliveredAt?: Date
  readAt?: Date
  errorMessage?: string
  metadata?: any
  appointmentId?: string
  clientId?: string
  createdAt: Date
  updatedAt: Date
}

export interface PushSubscription {
  id: string
  tenantId: string
  userId?: string
  clientId?: string
  endpoint: string
  p256dh: string
  auth: string
  userAgent?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface NotificationStats {
  total: number
  sent: number
  delivered: number
  failed: number
  read: number
  deliveryRate: number
}

export interface SendNotificationRequest {
  channel: NotificationChannel
  recipients: string[]
  templateId?: string
  customMessage?: string
  customSubject?: string
  type: NotificationType
}

export interface BulkSendRequest {
  channel: NotificationChannel
  recipients: string[]
  message: string
  subject?: string
}
