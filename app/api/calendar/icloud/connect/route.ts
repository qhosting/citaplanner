
/**
 * API Route: Connect iCloud Calendar
 * POST /api/calendar/icloud/connect
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import {
  createICloudClient,
  fetchICloudCalendars,
  storeICloudConnection,
  ICloudCredentials,
} from '@/lib/icloudService';

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
    const { appleId, appSpecificPassword, calendarUrl, calendarName } = body;

    // Validate required fields
    if (!appleId || !appSpecificPassword) {
      return NextResponse.json(
        { error: 'Apple ID and app-specific password are required' },
        { status: 400 }
      );
    }

    const credentials: ICloudCredentials = {
      appleId,
      appSpecificPassword,
    };

    // Test connection
    let client;
    try {
      client = await createICloudClient(credentials);
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Failed to connect to iCloud',
          message: 'Please verify your Apple ID and app-specific password',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 401 }
      );
    }

    // If no calendar URL provided, fetch available calendars
    if (!calendarUrl) {
      try {
        const calendars = await fetchICloudCalendars(client);
        return NextResponse.json({
          success: true,
          message: 'Connection successful',
          calendars: calendars.map((cal) => ({
            url: cal.url,
            displayName: cal.displayName,
            description: cal.description,
            ctag: cal.ctag,
          })),
        });
      } catch (error) {
        return NextResponse.json(
          {
            error: 'Failed to fetch calendars',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 500 }
        );
      }
    }

    // Store connection in database
    try {
      const connectionId = await storeICloudConnection(
        session.user.id,
        credentials,
        calendarUrl,
        calendarName
      );

      return NextResponse.json({
        success: true,
        message: 'iCloud calendar connected successfully',
        connectionId,
      });
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Failed to save connection',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('iCloud connect error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
