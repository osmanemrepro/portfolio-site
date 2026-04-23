'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Code2, Bug, BookOpen, Coffee, Users, Search, Monitor,
  Play, Pause, RotateCcw, Loader2, Eye, EyeOff, Save,
  Music, Link2, Unplug, ExternalLink, Check,
} from 'lucide-react';

interface ActivityData {
  id?: string;
  status: string;
  title: string;
  description: string;
  language: string;
  isLive: boolean;
  startedAt: string | null;
  visible: boolean;
}

interface SpotifyNowPlaying {
  playing: boolean;
  type?: string;
  track?: string;
  title?: string;
  artist?: string;
  show?: string;
  albumArt?: string;
  cover?: string;
}

const statuses = [
  { value: 'coding', label: 'Kodlama', icon: Code2, color: 'text-emerald-400' },
  { value: 'debugging', label: 'Hata Ayıklama', icon: Bug, color: 'text-red-400' },
  { value: 'learning', label: 'Öğrenme', icon: BookOpen, color: 'text-blue-400' },
  { value: 'break', label: 'Mola', icon: Coffee, color: 'text-amber-400' },
  { value: 'meeting', label: 'Toplantı', icon: Users, color: 'text-purple-400' },
  { value: 'researching', label: 'Araştırma', icon: Search, color: 'text-cyan-400' },
  { value: 'idle', label: 'Çevrimdışı', icon: Monitor, color: 'text-zinc-400' },
];

const languages = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C#', 'PHP', 'Go',
  'Rust', 'Swift', 'Kotlin', 'C++', 'Ruby', 'Dart', 'Lua', 'SQL',
  'HTML/CSS', 'Shell/Bash', 'Diğer',
];

const emptyActivity: ActivityData = {
  status: 'coding', title: '', description: '', language: '',
  isLive: false, startedAt: null, visible: true,
};

export default function AdminActivityPage() {
  const { token } = useAdmin();
  const searchParams = useSearchParams();
  const [activity, setActivity] = useState<ActivityData>(emptyActivity);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [elapsed, setElapsed] = useState('');
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [spotifyClientIdConfigured, setSpotifyClientIdConfigured] = useState(false);
  const [spotifyNowPlaying, setSpotifyNowPlaying] = useState<SpotifyNowPlaying | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [spotifyClientId, setSpotifyClientId] = useState('');
  const [spotifyClientSecret, setSpotifyClientSecret] = useState('');
  const [savingCreds, setSavingCreds] = useState(false);

  const headers = useCallback(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token]);

  useEffect(() => {
    const p = searchParams.get('spotify');
    const e = searchParams.get('spotify_error');
    if (p === 'connected') { toast.success('Spotify başarıyla bağlandı! 🎵'); setSpotifyConnected(true); window.history.replaceState({}, '', '/admin/activity'); }
    if (e) { toast.error(`Spotify bağlantı hatası: ${e}`); window.history.replaceState({}, '', '/admin/activity'); }
  }, [searchParams]);

  useEffect(() => {
    if (!activity.isLive || !activity.startedAt) { setElapsed(''); return; }
    const update = () => {
      const diff = Date.now() - new Date(activity.startedAt!).getTime();
      const ts = Math.floor(diff / 1000);
      const h = Math.floor(ts / 3600); const m = Math.floor((ts % 3600) / 60); const s = ts % 60;
      const pad = (n: number) => n.toString().padStart(2, '0');
      setElapsed(h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`);
    };
    update(); const i = setInterval(update, 1000); return () => clearInterval(i);
  }, [activity.isLive, activity.startedAt]);

  const fetchActivity = useCallback(async () => {
    if (!token) return;
    try { const r = await fetch('/api/activity', { headers: headers() }); const d = await r.json(); if (d && !d.error && d.id) setActivity(d); } catch {} finally { setLoading(false); }
  }, [token, headers]);

  useEffect(() => {
    fetch('/api/spotify?action=status').then(r => r.json()).then(d => { setSpotifyConnected(d.connected); setSpotifyClientIdConfigured(d.clientIdConfigured); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!spotifyConnected) return;
    const f = () => fetch('/api/spotify?action=now-playing').then(r => r.json()).then(d => setSpotifyNowPlaying(d)).catch(() => {});
    f(); const i = setInterval(f, 5000); return () => clearInterval(i);
  }, [spotifyConnected]);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  const handleSave = async () => {
    setSaving(true);
    try { const r = await fetch('/api/activity', { method: 'PUT', headers: headers(), body: JSON.stringify(activity) }); if (r.ok) { toast.success('Aktivite güncellendi'); setActivity(await r.json()); } else toast.error('Güncelleme başarısız'); } catch { toast.error('Hata'); } finally { setSaving(false); }
  };
  const handleStartStop = () => setActivity({ ...activity, isLive: !activity.isLive, startedAt: activity.isLive ? activity.startedAt : (activity.startedAt || new Date().toISOString()) });
  const handleResetTimer = () => { setActivity({ ...activity, startedAt: activity.isLive ? new Date().toISOString() : null }); toast.success('Sıfırlandı'); };
  const handleSaveSpotifyCreds = async () => {
    if (!spotifyClientId.trim()) { toast.error('Client ID gerekli'); return; }
    setSavingCreds(true);
    try { const r = await fetch('/api/spotify?action=save-credentials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: spotifyClientId.trim(), clientSecret: spotifyClientSecret.trim() }) }); if (r.ok) { toast.success('Spotify API bilgileri kaydedildi'); setSpotifyClientIdConfigured(true); } else toast.error('Kaydetme başarısız'); } catch { toast.error('Hata'); } finally { setSavingCreds(false); }
  };
  const handleSpotifyConnect = () => { window.location.href = '/api/spotify?action=connect'; };
  const handleSpotifyDisconnect = async () => {
    setDisconnecting(true);
    try { const r = await fetch('/api/spotify/disconnect', { method: 'DELETE', headers: headers() }); if (r.ok) { setSpotifyConnected(false); setSpotifyNowPlaying(null); toast.success('Spotify bağlantısı kesildi'); } } catch { toast.error('Bağlantı kesilemedi'); } finally { setDisconnecting(false); }
  };

  if (loading) return <div className="space-y-6"><div className="h-8 bg-zinc-800 rounded w-48 animate-pulse" /></div>;

  const currentStatus = statuses.find(s => s.value === activity.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Ne Yapıyorum?</h1>
          <p className="text-zinc-400 mt-1">Canlı aktivite widget&apos;ını yönet</p>
        </div>
        <div className="flex items-center gap-2">
          {elapsed && <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-sm">{elapsed}</Badge>}
          <Button onClick={handleSave} disabled={saving} className="bg-white text-black hover:bg-zinc-200">
            {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />} Kaydet
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Form */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-zinc-300">Durum</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {statuses.map(s => {
                  const Icon = s.icon; const active = activity.status === s.value;
                  return (
                    <button key={s.value} onClick={() => setActivity({ ...activity, status: s.value })}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all cursor-pointer ${active ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                      <Icon className={`size-4 ${active ? s.color : ''}`} /><span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Başlık / Dosya Adı</Label>
              <Input value={activity.title} onChange={e => setActivity({ ...activity, title: e.target.value })} placeholder="listener.py" className="bg-black/50 border-zinc-700 text-white placeholder:text-zinc-500 font-mono" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Açıklama</Label>
              <Textarea value={activity.description} onChange={e => setActivity({ ...activity, description: e.target.value })} placeholder="Discord bot için audio listener modülü yazıyorum..." rows={3} className="bg-black/50 border-zinc-700 text-white placeholder:text-zinc-500 resize-none" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Programlama Dili</Label>
              <Select value={activity.language} onValueChange={v => setActivity({ ...activity, language: v })}>
                <SelectTrigger className="bg-black/50 border-zinc-700 text-white"><SelectValue placeholder="Dil seçin..." /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">{languages.map(l => <SelectItem key={l} value={l} className="text-zinc-300">{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {/* Spotify Integration */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="size-9 rounded-lg bg-[#1DB954]/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="size-5 fill-[#1DB954]"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Spotify Entegrasyonu</h3>
                <p className="text-xs text-zinc-500">🎧 Müzik & 🎙️ Podcast desteği</p>
              </div>
              {spotifyConnected && <Badge className="ml-auto bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs"><Check className="size-3 mr-1" /> Bağlı</Badge>}
            </div>

            {spotifyConnected ? (
              <div className="space-y-4">
                {spotifyNowPlaying && 'type' in spotifyNowPlaying && spotifyNowPlaying.title ? (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/40 border border-[#1DB954]/10">
                    {(spotifyNowPlaying.cover || spotifyNowPlaying.albumArt) ? (
                      <img src={spotifyNowPlaying.cover || spotifyNowPlaying.albumArt} alt="" className="size-10 rounded-lg object-cover" />
                    ) : (
                      <div className="size-10 rounded-lg bg-[#1DB954]/10 flex items-center justify-center"><Music className="size-4 text-[#1DB954]/50" /></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white/80 truncate">{spotifyNowPlaying.title}</p>
                      <p className="text-[10px] text-white/40 truncate">{spotifyNowPlaying.artist || spotifyNowPlaying.show}</p>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40">{spotifyNowPlaying.type === 'podcast' ? '🎙️ Podcast' : '🎧 Müzik'}</span>
                  </div>
                ) : (
                  <div className="px-4 py-3 rounded-xl bg-black/40 border border-zinc-800 text-center">
                    <p className="text-xs text-zinc-500">Şu anda bir şey çalmıyor</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button onClick={handleSpotifyDisconnect} disabled={disconnecting} variant="ghost" className="text-zinc-400 hover:text-red-400 border border-zinc-800">
                    {disconnecting ? <Loader2 className="size-4 animate-spin mr-2" /> : <Unplug className="size-4 mr-2" />} Bağlantıyı Kes
                  </Button>
                  <Button onClick={() => window.open('https://open.spotify.com', '_blank')} variant="ghost" className="text-zinc-400 hover:text-white border border-zinc-800">
                    <ExternalLink className="size-4 mr-2" /> Spotify&apos;yi Aç
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {spotifyClientIdConfigured ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <Check className="size-4 text-emerald-400" />
                      <p className="text-xs text-emerald-400/80">Spotify API bilgileri yapılandırılmış. Hesabını bağlamak için aşağıdaki butona tıkla.</p>
                    </div>
                    <Button onClick={handleSpotifyConnect} className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-medium w-full">
                      <Link2 className="size-4 mr-2" /> Spotify&apos;yu Bağla
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-3">
                      <p className="text-xs text-zinc-300 font-medium flex items-center gap-2">
                        <span className="size-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">1</span>
                        Spotify Developer API Bilgileri
                      </p>
                      <p className="text-xs text-zinc-500 leading-relaxed ml-7">
                        <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[#1DB954] hover:underline">Spotify Developer Dashboard</a>&apos;dan uygulama oluştur.
                      </p>
                      <div className="ml-7 space-y-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-zinc-400">Client ID</Label>
                          <Input value={spotifyClientId} onChange={e => setSpotifyClientId(e.target.value)} placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className="bg-black/50 border-zinc-700 text-white placeholder:text-zinc-600 font-mono text-xs" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-zinc-400">Client Secret</Label>
                          <Input value={spotifyClientSecret} onChange={e => setSpotifyClientSecret(e.target.value)} placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" type="password" className="bg-black/50 border-zinc-700 text-white placeholder:text-zinc-600 font-mono text-xs" />
                        </div>
                        <Button onClick={handleSaveSpotifyCreds} disabled={savingCreds || !spotifyClientId.trim()} variant="ghost" size="sm" className="text-zinc-300 hover:text-white border border-zinc-700">
                          {savingCreds ? <Loader2 className="size-3.5 animate-spin mr-2" /> : <Check className="size-3.5 mr-2" />} Kaydet
                        </Button>
                      </div>
                    </div>
                    <div className="border-t border-zinc-800/50" />
                    <div className="space-y-3">
                      <p className="text-xs text-zinc-300 font-medium flex items-center gap-2">
                        <span className="size-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">2</span>
                        Spotify Hesabını Bağla
                      </p>
                      <p className="text-xs text-zinc-500 leading-relaxed ml-7">
                        Redirect URI:{' '}
                        <code className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300 font-mono text-[10px] break-all">
                          {typeof window !== 'undefined' ? `${window.location.origin}/api/spotify/callback` : '/api/spotify/callback'}
                        </code>
                      </p>
                      <div className="ml-7">
                        <Button onClick={handleSpotifyConnect} disabled className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-medium w-full disabled:opacity-40 disabled:cursor-not-allowed">
                          <Link2 className="size-4 mr-2" /> Önce API bilgilerini kaydet
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Canlı Kontrol</h3>
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-black/50 border border-zinc-800">
                {activity.isLive ? <span className="relative flex size-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full size-2.5 bg-emerald-400" /></span> : <span className="size-2.5 rounded-full bg-zinc-600" />}
                <span className="text-xl font-mono font-bold text-white tabular-nums">{elapsed || '00:00'}</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">{activity.isLive ? 'Canlı' : 'Duraklatıldı'}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleStartStop} variant={activity.isLive ? 'destructive' : 'default'} className={`flex-1 ${!activity.isLive ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}>
                {activity.isLive ? <><Pause className="size-4 mr-2" />Durdur</> : <><Play className="size-4 mr-2" />Başlat</>}
              </Button>
              <Button onClick={handleResetTimer} variant="ghost" className="text-zinc-400 hover:text-white"><RotateCcw className="size-4" /></Button>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Görünürlük</h3>
            <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-4">
              <div className="flex items-center gap-3">
                {activity.visible ? <Eye className="size-4 text-emerald-400" /> : <EyeOff className="size-4 text-zinc-500" />}
                <div><p className="text-sm text-white font-medium">{activity.visible ? 'Görünür' : 'Gizli'}</p><p className="text-xs text-zinc-500">{activity.visible ? 'Portföyde gösterilecek' : 'Gizlenmiş'}</p></div>
              </div>
              <Switch checked={activity.visible} onCheckedChange={c => setActivity({ ...activity, visible: c })} />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Önizleme</h3>
            <div className="rounded-xl bg-black/50 border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                {currentStatus && <div className="size-6 rounded-md bg-white/5 flex items-center justify-center"><currentStatus.icon className={`size-3 ${currentStatus.color}`} /></div>}
                <span className={`text-xs font-medium ${currentStatus?.color || 'text-zinc-400'}`}>{currentStatus?.label || activity.status}</span>
                {activity.isLive && <span className="ml-auto flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /><span className="text-[9px] font-bold tracking-wider text-white/40">LIVE</span></span>}
              </div>
              {activity.title && <p className="text-xs font-mono text-white/60 truncate">{activity.title}</p>}
              {activity.description && <p className="text-[10px] text-white/30 mt-1 line-clamp-2">{activity.description}</p>}
              {spotifyConnected && spotifyNowPlaying && 'title' in spotifyNowPlaying && (
                <div className="mt-3 pt-3 border-t border-zinc-800/50 flex items-center gap-2">
                  <span className="text-sm">{spotifyNowPlaying.type === 'podcast' ? '🎙️' : '🎧'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-white/50 truncate">{spotifyNowPlaying.title}</p>
                    <p className="text-[8px] text-white/30 truncate">{spotifyNowPlaying.artist || spotifyNowPlaying.show}</p>
                  </div>
                </div>
              )}
              {(activity.language || elapsed) && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-800/50">
                  {activity.language && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40">{activity.language}</span>}
                  {elapsed && <span className="text-[9px] text-white/30 ml-auto font-mono">{elapsed}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
