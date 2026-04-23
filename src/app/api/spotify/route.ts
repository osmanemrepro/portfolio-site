import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ── Helpers ──────────────────────────────────────────────

async function getSpotifyTokens() {
  const settings = await db.siteSetting.findMany({
    where: { key: { in: ['spotify_access_token', 'spotify_refresh_token', 'spotify_token_expires_at'] } },
  });
  const map: Record<string, string> = {};
  settings.forEach(s => { map[s.key] = s.value; });
  return {
    accessToken: map['spotify_access_token'] || null,
    refreshToken: map['spotify_refresh_token'] || null,
    expiresAt: map['spotify_token_expires_at'] ? parseInt(map['spotify_token_expires_at']) : null,
  };
}

async function getSpotifyCredentials() {
  const envId = process.env.SPOTIFY_CLIENT_ID;
  const envSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (envId && envSecret) return { clientId: envId, clientSecret: envSecret };

  const settings = await db.siteSetting.findMany({
    where: { key: { in: ['spotify_client_id', 'spotify_client_secret'] } },
  });
  const map: Record<string, string> = {};
  settings.forEach(s => { map[s.key] = s.value; });
  return { clientId: map['spotify_client_id'] || null, clientSecret: map['spotify_client_secret'] || null };
}

async function refreshAccessToken(refreshToken: string, clientId: string, clientSecret: string): Promise<string | null> {
  if (!clientId || !clientSecret || !refreshToken) return null;
  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();

    await db.siteSetting.upsert({ where: { key: 'spotify_access_token' }, update: { value: data.access_token }, create: { key: 'spotify_access_token', value: data.access_token } });
    if (data.refresh_token) {
      await db.siteSetting.upsert({ where: { key: 'spotify_refresh_token' }, update: { value: data.refresh_token }, create: { key: 'spotify_refresh_token', value: data.refresh_token } });
    }
    const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;
    await db.siteSetting.upsert({ where: { key: 'spotify_token_expires_at' }, update: { value: expiresAt.toString() }, create: { key: 'spotify_token_expires_at', value: expiresAt.toString() } });

    return data.access_token;
  } catch {
    return null;
  }
}

async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getSpotifyTokens();
  const creds = await getSpotifyCredentials();
  if (!tokens.accessToken || !creds.clientId || !creds.clientSecret) return null;

  const now = Math.floor(Date.now() / 1000);
  if (tokens.expiresAt && tokens.expiresAt > now + 60) return tokens.accessToken;

  if (tokens.refreshToken) {
    return await refreshAccessToken(tokens.refreshToken, creds.clientId, creds.clientSecret);
  }
  return null;
}

// ── Response Builders ────────────────────────────────────

interface MusicResponse {
  type: 'music';
  playing: boolean;
  title: string;
  artist: string;
  album: string;
  cover: string;
  durationMs: number;
  progressMs: number;
  isPlaying: boolean;
  shuffleState: string;
  repeatState: string;
  deviceName: string;
  externalUrl: string;
}

interface PodcastResponse {
  type: 'podcast';
  playing: boolean;
  title: string;
  show: string;
  cover: string;
  description: string;
  durationMs: number;
  progressMs: number;
  isPlaying: boolean;
  releaseDate: string;
  deviceName: string;
  externalUrl: string;
}

interface RecentlyPlayedResponse {
  type: 'music' | 'podcast';
  playing: false;
  title: string;
  artist?: string;
  show?: string;
  cover: string;
  externalUrl: string;
  durationMs: number;
  progressMs: number;
}

type SpotifyResponse = MusicResponse | PodcastResponse | RecentlyPlayedResponse | { playing: false };

function buildMusicResponse(data: Record<string, any>): MusicResponse {
  const item = data.item;
  return {
    type: 'music',
    playing: true,
    title: item?.name || '',
    artist: (item?.artists || []).map((a: any) => a.name).join(', '),
    album: item?.album?.name || '',
    cover: item?.album?.images?.[0]?.url || '',
    durationMs: item?.duration_ms || 0,
    progressMs: data.progress_ms || 0,
    isPlaying: !!data.is_playing,
    shuffleState: data.shuffle_state || 'off',
    repeatState: data.repeat_state || 'off',
    deviceName: data.device?.name || '',
    externalUrl: item?.external_urls?.spotify || '',
  };
}

function buildPodcastResponse(data: Record<string, any>): PodcastResponse {
  const item = data.item;
  const show = item?.show;
  let desc = item?.description || '';
  if (desc.length > 80) desc = desc.substring(0, 80) + '...';
  return {
    type: 'podcast',
    playing: true,
    title: item?.name || '',
    show: show?.name || '',
    cover: item?.images?.[0]?.url || '',
    description: desc,
    durationMs: item?.duration_ms || 0,
    progressMs: data.progress_ms || 0,
    isPlaying: !!data.is_playing,
    releaseDate: item?.release_date || '',
    deviceName: data.device?.name || '',
    externalUrl: item?.external_urls?.spotify || '',
  };
}

async function buildRecentlyPlayedResponse(accessToken: string): Promise<SpotifyResponse> {
  try {
    const res = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return { playing: false };
    const data = await res.json();
    const items = data.items || [];
    if (items.length === 0) return { playing: false };

    const track = items[0].track;
    const isPodcast = !!track?.show;

    if (isPodcast) {
      let desc = track?.description || '';
      if (desc.length > 80) desc = desc.substring(0, 80) + '...';
      return {
        type: 'podcast',
        playing: false,
        title: track?.name || '',
        show: track?.show?.name || '',
        cover: track?.images?.[0]?.url || track?.album?.images?.[0]?.url || '',
        externalUrl: track?.external_urls?.spotify || '',
        durationMs: track?.duration_ms || 0,
        progressMs: 0,
      };
    }

    return {
      type: 'music',
      playing: false,
      title: track?.name || '',
      artist: (track?.artists || []).map((a: any) => a.name).join(', '),
      cover: track?.album?.images?.[0]?.url || '',
      externalUrl: track?.external_urls?.spotify || '',
      durationMs: track?.duration_ms || 0,
      progressMs: 0,
    };
  } catch {
    return { playing: false };
  }
}

// ── GET Handler ──────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'connect') {
    const creds = await getSpotifyCredentials();
    if (!creds.clientId) {
      return NextResponse.json({ error: 'Spotify Client ID not configured' }, { status: 400 });
    }
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'https://osmanemreyaygin.osem.digital';
    const redirectUri = `${baseUrl}/api/spotify/callback`;
    const scopes = 'user-read-currently-playing user-read-playback-state user-read-private user-read-recently-played';
    const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
      response_type: 'code', client_id: creds.clientId, scope: scopes, redirect_uri: redirectUri, show_dialog: 'false',
    })}`;
    return NextResponse.redirect(authUrl);
  }

  if (action === 'now-playing') {
    const accessToken = await getValidAccessToken();
    if (!accessToken) return NextResponse.json({ playing: false });

    try {
      const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.status === 204 || !res.ok) {
        const recent = await buildRecentlyPlayedResponse(accessToken);
        return NextResponse.json(recent);
      }

      const data = await res.json();
      const playingType = data.currently_playing_type;

      if (playingType === 'episode') {
        return NextResponse.json(buildPodcastResponse(data));
      }
      return NextResponse.json(buildMusicResponse(data));
    } catch {
      return NextResponse.json({ playing: false });
    }
  }

  if (action === 'status') {
    const tokens = await getSpotifyTokens();
    const creds = await getSpotifyCredentials();
    return NextResponse.json({
      connected: !!tokens.accessToken,
      clientIdConfigured: !!creds.clientId,
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

// ── POST Handler ─────────────────────────────────────────

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'save-credentials') {
    try {
      const body = await request.json();
      const { clientId, clientSecret } = body;
      if (clientId) {
        await db.siteSetting.upsert({ where: { key: 'spotify_client_id' }, update: { value: clientId }, create: { key: 'spotify_client_id', value: clientId } });
      }
      if (clientSecret) {
        await db.siteSetting.upsert({ where: { key: 'spotify_client_secret' }, update: { value: clientSecret }, create: { key: 'spotify_client_secret', value: clientSecret } });
      }
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
