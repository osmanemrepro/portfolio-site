import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromToken } from '@/lib/admin';

// GET /api/activity — public, returns current activity
export async function GET() {
  try {
    const activity = await db.activityStatus.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (!activity) {
      return NextResponse.json({
        status: 'idle',
        title: '',
        description: '',
        language: '',
        isLive: false,
        startedAt: null,
        visible: true,
      });
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error('GET /api/activity error:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}

// PUT /api/activity — admin only, update activity
export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, title, description, language, isLive, startedAt, visible } = body;

    // Get existing or create
    const existing = await db.activityStatus.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    let activity;
    if (existing) {
      activity = await db.activityStatus.update({
        where: { id: existing.id },
        data: {
          status: status || 'idle',
          title: title || '',
          description: description || '',
          language: language || '',
          isLive: !!isLive,
          startedAt: startedAt ? new Date(startedAt) : (isLive ? new Date() : null),
          visible: visible !== false,
        },
      });
    } else {
      activity = await db.activityStatus.create({
        data: {
          status: status || 'idle',
          title: title || '',
          description: description || '',
          language: language || '',
          isLive: !!isLive,
          startedAt: startedAt ? new Date(startedAt) : (isLive ? new Date() : null),
          visible: visible !== false,
        },
      });
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error('PUT /api/activity error:', error);
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 });
  }
}
