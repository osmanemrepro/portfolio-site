import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromToken } from '@/lib/admin';

// GET /api/social-links
export async function GET() {
  try {
    const links = await db.socialLink.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(links);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch social links' }, { status: 500 });
  }
}

// POST /api/social-links - Create new social link
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { platform, url, icon, visible, order } = body;

    if (!platform || !url) {
      return NextResponse.json({ error: 'Platform and URL are required' }, { status: 400 });
    }

    const link = await db.socialLink.create({
      data: {
        platform,
        url,
        icon: icon || '',
        visible: visible !== undefined ? visible : true,
        order: order || 0,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create social link' }, { status: 500 });
  }
}

// PUT /api/social-links - Update social link
export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Social link ID is required' }, { status: 400 });
    }

    const link = await db.socialLink.update({
      where: { id },
      data,
    });

    return NextResponse.json(link);
  } catch {
    return NextResponse.json({ error: 'Failed to update social link' }, { status: 500 });
  }
}

// DELETE /api/social-links - Delete social link
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Social link ID is required' }, { status: 400 });
    }

    await db.socialLink.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete social link' }, { status: 500 });
  }
}
