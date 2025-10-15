
import { UserRole, AppointmentStatus, PaymentMethod, PaymentStatus, CommissionStatus } from '@prisma/client'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  role: UserRole
  isActive: boolean
  tenantId: string
  branchId?: string
  emailVerified?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Tenant {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country: string
  timezone: string
  currency: string
  logo?: string
  createdAt: Date
  updatedAt: Date
}

export interface Branch {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  isActive: boolean
  tenantId: string
  createdAt: Date
  updatedAt: Date
}

export interface Service {
  id: string
  name: string
  description?: string
  duration: number
  price: number
  isActive: boolean
  color: string
  tenantId: string
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  address?: string
  birthday?: Date
  notes?: string
  isActive: boolean
  tenantId: string
  createdAt: Date
  updatedAt: Date
}

export interface Appointment {
  id: string
  startTime: Date
  endTime: Date
  status: AppointmentStatus
  notes?: string
  isOnline: boolean
  tenantId: string
  branchId: string
  clientId: string
  serviceId: string
  userId: string
  createdAt: Date
  updatedAt: Date
  client?: Client
  service?: Service
  user?: User
}

export interface Payment {
  id: string
  amount: number
  paymentMethod: PaymentMethod
  status: PaymentStatus
  notes?: string
  tenantId: string
  branchId: string
  clientId: string
  appointmentId?: string
  userId: string
  createdAt: Date
  updatedAt: Date
  client?: Client
  appointment?: Appointment
  user?: User
}

export interface DashboardMetrics {
  todayAppointments: number
  weeklyRevenue: number
  monthlyRevenue: number
  newClients: number
  completedAppointments: number
  pendingAppointments: number
  totalClients: number
  averageServicePrice: number
}

// Commission Types
export interface Commission {
  id: string
  period: string
  totalSales: number
  totalCommissions: number
  status: CommissionStatus
  paidDate?: Date
  notes?: string
  tenantId: string
  professionalId: string
  professional?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface CommissionSummary {
  totalPending: number
  totalPaid: number
  totalSales: number
  byPeriod: Commission[]
}

export interface CommissionStats {
  totalPending: number
  totalPaid: number
  totalSales: number
  count: number
}
