
/**
 * API Route: Trigger manual iCloud sync
 * POST /api/calendar/icloud/sync
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { performInitialSync } from '@/lib/icloudService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { connectionId } = body;

    if (!connectionId) {
      return NextResponse.json(
        { error: 'Connection ID is required' },
        { status: 400 }
      );
    }

    // Verify connection belongs to user
    const connection = await prisma.externalCalendarConnection.findFirst({
      where: {
        id: connectionId,
        userId: session.user.id,
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }

    // Check if sync is already in progress
    if (connection.syncStatus === 'ACTIVE') {
      const lastSync = connection.lastSyncAt;
      if (lastSync && Date.now() - lastSync.getTime() < 60000) {
        return NextResponse.json(
          {
            error: 'Sync already in progress',
            message: 'Please wait at least 1 minute between syncs',
          },
          { status: 429 }
        );
      }
    }

    // Perform sync
    const result = await performInitialSync(connectionId);

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? 'Sync completed successfully'
        : 'Sync completed with errors',
      result: {
        eventsImported: result.eventsImported,
        eventsExported: result.eventsExported,
        eventsUpdated: result.eventsUpdated,
        eventsDeleted: result.eventsDeleted,
        conflictsResolved: result.conflictsResolved,
        errors: result.errors,
      },
    });
  } catch (error) {
    console.error('iCloud sync error:', error);
    return NextResponse.json(
      {
        error: 'Sync failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
