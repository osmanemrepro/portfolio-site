import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromToken } from '@/lib/admin';
import { NextRequest } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await db.siteSetting.deleteMany({
      where: { key: { in: ['spotify_access_token', 'spotify_refresh_token', 'spotify_token_expires_at'] } },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }
}
