import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'https://osmanemreyaygin.osem.digital';

  if (error) return NextResponse.redirect(`${baseUrl}/admin/activity?spotify_error=${error}`);
  if (!code) return NextResponse.redirect(`${baseUrl}/admin/activity?spotify_error=no_code`);

  // Credentials: env first, then DB
  let clientId = process.env.SPOTIFY_CLIENT_ID;
  let clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const settings = await db.siteSetting.findMany({
      where: { key: { in: ['spotify_client_id', 'spotify_client_secret'] } },
    });
    const map: Record<string, string> = {};
    settings.forEach(s => { map[s.key] = s.value; });
    clientId = clientId || map['spotify_client_id'];
    clientSecret = clientSecret || map['spotify_client_secret'];
  }

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/admin/activity?spotify_error=no_credentials`);
  }

  try {
    const redirectUri = `${baseUrl}/api/spotify/callback`;
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      },
      body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri }),
    });

    if (!res.ok) return NextResponse.redirect(`${baseUrl}/admin/activity?spotify_error=token_exchange_failed`);

    const data = await res.json();

    await db.siteSetting.upsert({ where: { key: 'spotify_access_token' }, update: { value: data.access_token }, create: { key: 'spotify_access_token', value: data.access_token } });
    await db.siteSetting.upsert({ where: { key: 'spotify_refresh_token' }, update: { value: data.refresh_token }, create: { key: 'spotify_refresh_token', value: data.refresh_token } });
    const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;
    await db.siteSetting.upsert({ where: { key: 'spotify_token_expires_at' }, update: { value: expiresAt.toString() }, create: { key: 'spotify_token_expires_at', value: expiresAt.toString() } });

    return NextResponse.redirect(`${baseUrl}/admin/activity?spotify=connected`);
  } catch {
    return NextResponse.redirect(`${baseUrl}/admin/activity?spotify_error=unknown`);
  }
}
