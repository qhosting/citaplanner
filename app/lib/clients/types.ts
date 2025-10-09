/**
 * Client Module Types
 * TypeScript interfaces for API responses and component props
 */

import { Gender, CommunicationPreference, NoteType, AppointmentStatus, PaymentStatus } from '@prisma/client';

// ============================================================================
// Client Types (Simple Model - Primary)
// ============================================================================

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  address: string | null;
  birthday: string | null;
  notes: string | null;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address?: string;
  birthday?: Date | string;
  notes?: string;
  tenantId: string;
}

// ============================================================================
// Client Profile Types (Legacy - For Backward Compatibility)
// ============================================================================

export interface ClientProfile {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  phone: string | null;
  alternatePhone: string | null;
  email: string | null;
  alternateEmail: string | null;
  occupation: string | null;
  company: string | null;
  profilePhotoUrl: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
}

export interface ClientProfileFormData {
  userId: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date | string;
  gender?: Gender;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  alternateEmail?: string;
  occupation?: string;
  company?: string;
  profilePhotoUrl?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
}

// ============================================================================
// Client Notes Types
// ============================================================================

export interface ClientNote {
  id: string;
  clientId: string;
  userId: string;
  type: NoteType;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export interface ClientNoteFormData {
  clientId: string;
  userId: string;
  type: NoteType;
  content: string;
  isPrivate?: boolean;
}

// ============================================================================
// Client Preferences Types
// ============================================================================

export interface ClientPreference {
  id: string;
  clientId: string;
  preferredDays: string[];
  preferredTimes: string[];
  communicationPreference: CommunicationPreference;
  reminderTime: number;
  language: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientPreferenceFormData {
  clientId: string;
  preferredDays?: string[];
  preferredTimes?: string[];
  communicationPreference?: CommunicationPreference;
  reminderTime?: number;
  language?: string;
  timezone?: string;
}

// ============================================================================
// Client History Types
// ============================================================================

export interface AppointmentHistoryItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  service?: {
    id: string;
    name: string;
    price: number;
  };
  professional?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  payments?: {
    id: string;
    amount: number;
    status: PaymentStatus;
    method: string;
  }[];
}

export interface ServiceHistoryItem {
  serviceId: string;
  serviceName: string;
  count: number;
  lastDate: string;
  totalSpent: number;
}

export interface ClientHistory {
  appointments: AppointmentHistoryItem[];
  services: ServiceHistoryItem[];
  totalAppointments: number;
  totalSpent: number;
  lastVisit: string | null;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  pagination?: {
    total: number;
    skip: number;
    take: number;
  };
  error?: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface ClientFormProps {
  initialData?: Partial<ClientFormData>;
  onSubmit: (data: ClientFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface ClientViewProps {
  clientData: Client;
}

// Legacy props for backward compatibility
export interface ClientProfileFormProps {
  initialData?: Partial<ClientProfileFormData>;
  onSubmit: (data: ClientProfileFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface ClientProfileViewProps {
  clientData: ClientProfile;
}

export interface ClientHistoryProps {
  clientId: string;
}

export interface ClientNotesListProps {
  clientId: string;
  userId: string;
}

export interface ClientPreferencesProps {
  clientId: string;
}

export interface PhotoUploadProps {
  currentPhotoUrl?: string | null;
  onUpload: (photoUrl: string) => Promise<void>;
  isLoading?: boolean;
}

// ============================================================================
// Filter and Sort Types
// ============================================================================

export type ClientSortBy = 'name' | 'recent' | 'appointments' | 'spent';

export interface ClientFilters {
  search?: string;
  city?: string;
  state?: string;
  skip?: number;
  take?: number;
}
