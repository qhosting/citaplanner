
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { createClientNote, listClientNotes } from '@/lib/clients/noteManager';

/**
 * GET /api/clients/notes
 * List client notes with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      clientProfileId: searchParams.get('clientProfileId') || undefined,
      createdByUserId: searchParams.get('createdByUserId') || undefined,
      noteType: searchParams.get('noteType') as any,
      isPrivate: searchParams.get('isPrivate') === 'true' ? true : undefined,
      skip: parseInt(searchParams.get('skip') || '0'),
      take: parseInt(searchParams.get('take') || '50'),
    };

    const result = await listClientNotes(filters);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/clients/notes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients/notes
 * Create a new client note
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.clientProfileId || !body.createdByUserId || !body.content) {
      return NextResponse.json(
        { error: 'clientProfileId, createdByUserId, and content are required' },
        { status: 400 }
      );
    }

    const result = await createClientNote(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/clients/notes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
