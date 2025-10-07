
/**
 * API Route: Export appointments as .ics file
 * GET /api/calendar/export?userId=xxx&startDate=xxx&endDate=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';
import { generateICalFeed } from '@/lib/icalExport';

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
    const userId = searchParams.get('userId') || session.user.id;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query filters
    const where: any = {
      userId,
    };

    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Fetch appointments
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: true,
        client: true,
        user: true,
        branch: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate iCalendar feed
    const icalData = generateICalFeed(
      appointments as any,
      `${user.firstName} ${user.lastName}`
    );

    // Return as downloadable .ics file
    return new NextResponse(icalData, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="citaplanner-${userId}-${Date.now()}.ics"`,
      },
    });
  } catch (error) {
    console.error('Export calendar error:', error);
    return NextResponse.json(
      { error: 'Failed to export calendar' },
      { status: 500 }
    );
  }
}
