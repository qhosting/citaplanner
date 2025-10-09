
import { prisma } from '@/lib/prisma';
import { NoteType, Prisma } from '@prisma/client';

export interface CreateClientNoteInput {
  clientProfileId: string;
  createdByUserId: string;
  noteType?: NoteType;
  content: string;
  isPrivate?: boolean;
}

export interface UpdateClientNoteInput {
  id: string;
  noteType?: NoteType;
  content?: string;
  isPrivate?: boolean;
}

export interface ClientNoteFilters {
  clientProfileId?: string;
  createdByUserId?: string;
  noteType?: NoteType;
  isPrivate?: boolean;
  skip?: number;
  take?: number;
}

/**
 * Create a new client note
 */
export async function createClientNote(data: CreateClientNoteInput) {
  try {
    // Verify client profile exists
    const profile = await prisma.clientProfile.findUnique({
      where: { id: data.clientProfileId },
    });

    if (!profile) {
      throw new Error('Client profile not found');
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.createdByUserId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const note = await prisma.clientNote.create({
      data: {
        clientProfileId: data.clientProfileId,
        createdByUserId: data.createdByUserId,
        noteType: data.noteType || 'GENERAL',
        content: data.content,
        isPrivate: data.isPrivate || false,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        clientProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return { success: true, note };
  } catch (error) {
    console.error('Error creating client note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create client note',
    };
  }
}

/**
 * Get client note by ID
 */
export async function getClientNote(id: string) {
  try {
    const note = await prisma.clientNote.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        clientProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!note) {
      return { success: false, error: 'Client note not found' };
    }

    return { success: true, note };
  } catch (error) {
    console.error('Error fetching client note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch client note',
    };
  }
}

/**
 * Update client note
 */
export async function updateClientNote(data: UpdateClientNoteInput) {
  try {
    const { id, ...updateData } = data;

    const note = await prisma.clientNote.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return { success: true, note };
  } catch (error) {
    console.error('Error updating client note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update client note',
    };
  }
}

/**
 * Delete client note
 */
export async function deleteClientNote(id: string) {
  try {
    await prisma.clientNote.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting client note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete client note',
    };
  }
}

/**
 * List client notes with filters
 */
export async function listClientNotes(filters: ClientNoteFilters = {}) {
  try {
    const {
      clientProfileId,
      createdByUserId,
      noteType,
      isPrivate,
      skip = 0,
      take = 50,
    } = filters;

    const where: Prisma.ClientNoteWhereInput = {};

    if (clientProfileId) {
      where.clientProfileId = clientProfileId;
    }

    if (createdByUserId) {
      where.createdByUserId = createdByUserId;
    }

    if (noteType) {
      where.noteType = noteType;
    }

    if (isPrivate !== undefined) {
      where.isPrivate = isPrivate;
    }

    const [notes, total] = await Promise.all([
      prisma.clientNote.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          clientProfile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.clientNote.count({ where }),
    ]);

    return {
      success: true,
      notes,
      pagination: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    };
  } catch (error) {
    console.error('Error listing client notes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list client notes',
    };
  }
}
