
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import {
  createClientPreferences,
  getClientPreferencesByProfileId,
} from '@/lib/clients/preferenceManager';

/**
 * GET /api/clients/preferences
 * Get client preferences by profile ID
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const clientProfileId = searchParams.get('clientProfileId');

    if (!clientProfileId) {
      return NextResponse.json(
        { error: 'clientProfileId is required' },
        { status: 400 }
      );
    }

    const result = await getClientPreferencesByProfileId(clientProfileId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/clients/preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients/preferences
 * Create client preferences
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.clientProfileId) {
      return NextResponse.json(
        { error: 'clientProfileId is required' },
        { status: 400 }
      );
    }

    const result = await createClientPreferences(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/clients/preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
