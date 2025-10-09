
/**
 * API Route: Get iCloud sync status
 * GET /api/calendar/icloud/status?connectionId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const connectionId = searchParams.get('connectionId');

    if (!connectionId) {
      // Return all connections for user
      const connections = await prisma.externalCalendarConnection.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          syncLogs: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 5,
          },
        },
      });

      return NextResponse.json({
        success: true,
        connections: connections.map((conn) => ({
          id: conn.id,
          provider: conn.provider,
          calendarName: conn.calendarName,
          syncStatus: conn.syncStatus,
          lastSyncAt: conn.lastSyncAt,
          lastSyncError: conn.lastSyncError,
          syncInterval: conn.syncInterval,
          bidirectionalSync: conn.bidirectionalSync,
          autoExport: conn.autoExport,
          recentLogs: conn.syncLogs,
        })),
      });
    }

    // Get specific connection
    const connection = await prisma.externalCalendarConnection.findFirst({
      where: {
        id: connectionId,
        userId: session.user.id,
      },
      include: {
        syncLogs: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      );
    }

    // Calculate sync statistics
    const totalLogs = await prisma.calendarSyncLog.count({
      where: { connectionId },
    });

    const successfulSyncs = await prisma.calendarSyncLog.count({
      where: {
        connectionId,
        status: 'SUCCESS',
      },
    });

    const failedSyncs = await prisma.calendarSyncLog.count({
      where: {
        connectionId,
        status: 'FAILED',
      },
    });

    return NextResponse.json({
      success: true,
      connection: {
        id: connection.id,
        provider: connection.provider,
        calendarName: connection.calendarName,
        calendarUrl: connection.calendarUrl,
        syncStatus: connection.syncStatus,
        lastSyncAt: connection.lastSyncAt,
        lastSyncError: connection.lastSyncError,
        syncInterval: connection.syncInterval,
        bidirectionalSync: connection.bidirectionalSync,
        autoExport: connection.autoExport,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
      },
      statistics: {
        totalSyncs: totalLogs,
        successfulSyncs,
        failedSyncs,
        successRate:
          totalLogs > 0 ? ((successfulSyncs / totalLogs) * 100).toFixed(2) : 0,
      },
      recentLogs: connection.syncLogs,
    });
  } catch (error) {
    console.error('Get sync status error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get sync status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
