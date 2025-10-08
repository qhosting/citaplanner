
import { prisma } from '@/lib/prisma';
import { Gender, Prisma } from '@prisma/client';

export interface CreateClientProfileInput {
  userId: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
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

export interface UpdateClientProfileInput extends Partial<CreateClientProfileInput> {
  id: string;
}

export interface ClientProfileFilters {
  userId?: string;
  search?: string;
  city?: string;
  state?: string;
  skip?: number;
  take?: number;
}

/**
 * Create a new client profile
 * Non-breaking: Creates profile on-demand, not required for existing users
 */
export async function createClientProfile(data: CreateClientProfileInput) {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if profile already exists
    const existingProfile = await prisma.clientProfile.findUnique({
      where: { userId: data.userId },
    });

    if (existingProfile) {
      throw new Error('Client profile already exists for this user');
    }

    const profile = await prisma.clientProfile.create({
      data: {
        userId: data.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country || 'México',
        phone: data.phone,
        alternatePhone: data.alternatePhone,
        email: data.email,
        alternateEmail: data.alternateEmail,
        occupation: data.occupation,
        company: data.company,
        profilePhotoUrl: data.profilePhotoUrl,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        notes: data.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return { success: true, profile };
  } catch (error) {
    console.error('Error creating client profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create client profile',
    };
  }
}

/**
 * Get client profile by ID
 */
export async function getClientProfile(id: string) {
  try {
    const profile = await prisma.clientProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            tenantId: true,
          },
        },
        clientNotes: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        clientPreferences: true,
      },
    });

    if (!profile) {
      return { success: false, error: 'Client profile not found' };
    }

    return { success: true, profile };
  } catch (error) {
    console.error('Error fetching client profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch client profile',
    };
  }
}

/**
 * Get client profile by user ID
 */
export async function getClientProfileByUserId(userId: string) {
  try {
    const profile = await prisma.clientProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            tenantId: true,
          },
        },
        clientNotes: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        clientPreferences: true,
      },
    });

    // Non-breaking: Return null if no profile exists (user can still function)
    return { success: true, profile };
  } catch (error) {
    console.error('Error fetching client profile by user ID:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch client profile',
    };
  }
}

/**
 * Update client profile
 */
export async function updateClientProfile(data: UpdateClientProfileInput) {
  try {
    const { id, ...updateData } = data;

    const profile = await prisma.clientProfile.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return { success: true, profile };
  } catch (error) {
    console.error('Error updating client profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update client profile',
    };
  }
}

/**
 * Delete client profile
 */
export async function deleteClientProfile(id: string) {
  try {
    await prisma.clientProfile.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting client profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete client profile',
    };
  }
}

/**
 * List client profiles with filters
 */
export async function listClientProfiles(filters: ClientProfileFilters = {}) {
  try {
    const { userId, search, city, state, skip = 0, take = 50 } = filters;

    const where: Prisma.ClientProfileWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (state) {
      where.state = { contains: state, mode: 'insensitive' };
    }

    const [profiles, total] = await Promise.all([
      prisma.clientProfile.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      }),
      prisma.clientProfile.count({ where }),
    ]);

    return {
      success: true,
      profiles,
      pagination: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    };
  } catch (error) {
    console.error('Error listing client profiles:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list client profiles',
    };
  }
}
