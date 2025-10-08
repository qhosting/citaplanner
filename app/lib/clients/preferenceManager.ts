
import { prisma } from '@/lib/prisma';
import { CommunicationPreference, ReminderTime } from '@prisma/client';

export interface CreateClientPreferencesInput {
  clientProfileId: string;
  preferredServices?: string[]; // Array of service IDs
  preferredStaff?: string[]; // Array of user IDs
  communicationPreference?: CommunicationPreference;
  reminderTime?: ReminderTime;
  specialRequests?: string;
}

export interface UpdateClientPreferencesInput extends Partial<CreateClientPreferencesInput> {
  id: string;
}

/**
 * Create client preferences
 */
export async function createClientPreferences(data: CreateClientPreferencesInput) {
  try {
    // Verify client profile exists
    const profile = await prisma.clientProfile.findUnique({
      where: { id: data.clientProfileId },
    });

    if (!profile) {
      throw new Error('Client profile not found');
    }

    // Check if preferences already exist
    const existingPreferences = await prisma.clientPreferences.findUnique({
      where: { clientProfileId: data.clientProfileId },
    });

    if (existingPreferences) {
      throw new Error('Client preferences already exist for this profile');
    }

    const preferences = await prisma.clientPreferences.create({
      data: {
        clientProfileId: data.clientProfileId,
        preferredServices: data.preferredServices ? JSON.stringify(data.preferredServices) : null,
        preferredStaff: data.preferredStaff ? JSON.stringify(data.preferredStaff) : null,
        communicationPreference: data.communicationPreference || 'EMAIL',
        reminderTime: data.reminderTime || 'HOURS_24',
        specialRequests: data.specialRequests,
      },
      include: {
        clientProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return { success: true, preferences: formatPreferences(preferences) };
  } catch (error) {
    console.error('Error creating client preferences:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create client preferences',
    };
  }
}

/**
 * Get client preferences by ID
 */
export async function getClientPreferences(id: string) {
  try {
    const preferences = await prisma.clientPreferences.findUnique({
      where: { id },
      include: {
        clientProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!preferences) {
      return { success: false, error: 'Client preferences not found' };
    }

    return { success: true, preferences: formatPreferences(preferences) };
  } catch (error) {
    console.error('Error fetching client preferences:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch client preferences',
    };
  }
}

/**
 * Get client preferences by client profile ID
 */
export async function getClientPreferencesByProfileId(clientProfileId: string) {
  try {
    const preferences = await prisma.clientPreferences.findUnique({
      where: { clientProfileId },
      include: {
        clientProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Non-breaking: Return null if no preferences exist
    return { success: true, preferences: preferences ? formatPreferences(preferences) : null };
  } catch (error) {
    console.error('Error fetching client preferences by profile ID:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch client preferences',
    };
  }
}

/**
 * Update client preferences
 */
export async function updateClientPreferences(data: UpdateClientPreferencesInput) {
  try {
    const { id, preferredServices, preferredStaff, ...otherData } = data;

    const updateData: any = { ...otherData };

    if (preferredServices !== undefined) {
      updateData.preferredServices = preferredServices ? JSON.stringify(preferredServices) : null;
    }

    if (preferredStaff !== undefined) {
      updateData.preferredStaff = preferredStaff ? JSON.stringify(preferredStaff) : null;
    }

    const preferences = await prisma.clientPreferences.update({
      where: { id },
      data: updateData,
      include: {
        clientProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return { success: true, preferences: formatPreferences(preferences) };
  } catch (error) {
    console.error('Error updating client preferences:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update client preferences',
    };
  }
}

/**
 * Delete client preferences
 */
export async function deleteClientPreferences(id: string) {
  try {
    await prisma.clientPreferences.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting client preferences:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete client preferences',
    };
  }
}

/**
 * Format preferences by parsing JSON strings
 */
function formatPreferences(preferences: any) {
  return {
    ...preferences,
    preferredServices: preferences.preferredServices
      ? JSON.parse(preferences.preferredServices)
      : [],
    preferredStaff: preferences.preferredStaff ? JSON.parse(preferences.preferredStaff) : [],
  };
}
