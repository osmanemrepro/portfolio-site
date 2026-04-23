"use client";

import { useEffect, useState, useRef, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2, Bug, BookOpen, Coffee, Users, Search,
  Clock, Signal, Monitor, ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

// ── Types ────────────────────────────────────────────────

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

interface MusicData {
  type: 'music';
  playing: true;
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

interface PodcastData {
  type: 'podcast';
  playing: true;
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

interface RecentData {
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

interface NotPlaying {
  playing: false;
}

type SpotifyData = MusicData | PodcastData | RecentData | NotPlaying;

// ── Status Config ────────────────────────────────────────

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; glowColor: string }> = {
  coding:      { icon: Code2,    color: "text-emerald-400", bgColor: "bg-emerald-500/10", glowColor: "rgba(16,185,129,0.3)" },
  debugging:   { icon: Bug,      color: "text-red-400",     bgColor: "bg-red-500/10",     glowColor: "rgba(239,68,68,0.3)" },
  learning:    { icon: BookOpen,  color: "text-blue-400",    bgColor: "bg-blue-500/10",    glowColor: "rgba(59,130,246,0.3)" },
  break:       { icon: Coffee,    color: "text-amber-400",   bgColor: "bg-amber-500/10",   glowColor: "rgba(245,158,11,0.3)" },
  meeting:     { icon: Users,     color: "text-purple-400",  bgColor: "bg-purple-500/10",  glowColor: "rgba(139,92,246,0.3)" },
  researching: { icon: Search,    color: "text-cyan-400",    bgColor: "bg-cyan-500/10",    glowColor: "rgba(6,182,212,0.3)" },
  idle:        { icon: Monitor,   color: "text-zinc-400",    bgColor: "bg-zinc-500/10",    glowColor: "rgba(161,161,170,0.2)" },
};

// ── Helpers ──────────────────────────────────────────────

function formatElapsed(startDate: Date): string {
  const diffMs = Date.now() - startDate.getTime();
  const ts = Math.floor(diffMs / 1000);
  const h = Math.floor(ts / 3600);
  const m = Math.floor((ts % 3600) / 60);
  const s = ts % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function useElapsedTime(startedAt: string | null, isLive: boolean) {
  const [elapsed, setElapsed] = useState("");
  const ref = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!isLive || !startedAt) {
      const timer = requestAnimationFrame(() => setElapsed(""));
      return () => cancelAnimationFrame(timer);
    }
    const timer = requestAnimationFrame(() => setElapsed(formatElapsed(new Date(startedAt))));
    ref.current = setInterval(() => setElapsed(formatElapsed(new Date(startedAt))), 1000);
    return () => { cancelAnimationFrame(timer); if (ref.current) clearInterval(ref.current); };
  }, [startedAt, isLive]);
  return elapsed;
}

function useSpotifyProgress(playing: boolean, progressMs: number, durationMs: number) {
  const baseRef = useRef(progressMs);
  const startRef = useRef(Date.now());
  const [progress, setProgress] = useState(progressMs);

  useEffect(() => {
    if (!playing) {
      baseRef.current = progressMs;
      startRef.current = Date.now();
      const timer = requestAnimationFrame(() => setProgress(progressMs));
      return () => cancelAnimationFrame(timer);
    }
    baseRef.current = progressMs;
    startRef.current = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      setProgress(baseRef.current + elapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, [playing, progressMs, durationMs]);

  return Math.min(progress, durationMs);
}

// ── Spotify Mini Player ─────────────────────────────────

function SpotifyMiniPlayer({ spotify }: { spotify: SpotifyData }) {
  const isMusic = 'type' in spotify && spotify.type === 'music';
  const isPodcast = 'type' in spotify && spotify.type === 'podcast';
  const isActive = 'playing' in spotify && spotify.playing === true;
  const durationMs = ('type' in spotify) ? spotify.durationMs || 0 : 0;
  const progressMs = ('type' in spotify) ? spotify.progressMs || 0 : 0;
  const progress = useSpotifyProgress(isActive, progressMs, durationMs);

  // Not connected / no data
  if ('playing' in spotify && !spotify.playing && !('type' in spotify)) return null;
  if (!('type' in spotify)) return null;
  const pct = durationMs > 0 ? (progress / durationMs) * 100 : 0;
  const cover = spotify.cover || '';
  const title = spotify.title || '';
  const externalUrl = spotify.externalUrl || '';

  const subtitle = isMusic
    ? (spotify as MusicData).artist
    : isPodcast
      ? (spotify as PodcastData).show
      : (spotify as RecentData).artist || (spotify as RecentData).show || '';

  const deviceName = isActive
    ? isMusic
      ? (spotify as MusicData).deviceName
      : (spotify as PodcastData).deviceName
    : '';

  const animKey = `${title}-${isMusic ? 'music' : 'podcast'}-${isActive}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={animKey}
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.98 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-3 pt-3 border-t border-white/[0.06]"
      >
        {/* Header label */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[11px]">{isMusic ? '🎧' : '🎙️'}</span>
          <span className="text-[9px] uppercase tracking-[0.15em] text-white/30 font-medium">
            {isActive
              ? (isMusic ? 'Dinliyorum' : 'Podcast Dinliyorum')
              : (isMusic ? 'Son Dinlenen' : 'Son Podcast')}
          </span>
          {isActive && (
            <span className="relative flex size-1.5 ml-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-1.5 bg-emerald-400" />
            </span>
          )}
          {!isActive && (
            <span className="text-[8px] text-white/20 ml-auto font-mono">SON</span>
          )}
        </div>

        {/* Main row */}
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3"
        >
          {/* Cover art */}
          <div className="relative shrink-0">
            {cover ? (
              <motion.img
                src={cover}
                alt={title}
                className={`rounded-xl object-cover shadow-lg ${isMusic ? 'size-12' : 'size-12'}`}
                style={{
                  boxShadow: isActive ? `0 0 24px ${isMusic ? 'rgba(30,215,96,0.12)' : 'rgba(99,102,241,0.12)'}` : 'none',
                }}
                animate={isActive ? { rotate: [0, 0.5, -0.5, 0] } : {}}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
            ) : (
              <div className={`rounded-xl flex items-center justify-center ${isMusic ? 'size-12 bg-emerald-500/10 border border-emerald-500/15' : 'size-12 bg-indigo-500/10 border border-indigo-500/15'}`}>
                <span className="text-lg">{isMusic ? '🎧' : '🎙️'}</span>
              </div>
            )}
            {/* Spotify badge */}
            <div className={`absolute -bottom-0.5 -right-0.5 size-[18px] rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg`}>
              <svg viewBox="0 0 24 24" className="size-[10px] fill-black">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white/90 truncate group-hover:text-emerald-400 transition-colors leading-snug">
              {title}
            </p>
            <p className="text-[10px] text-white/45 truncate mt-0.5">
              {subtitle}
            </p>
            {isPodcast && isActive && (spotify as PodcastData).description && (
              <p className="text-[9px] text-white/25 truncate mt-0.5 italic">
                {(spotify as PodcastData).description}
              </p>
            )}

            {/* Progress bar */}
            {durationMs > 0 && (
              <div className="mt-1.5">
                <div className="h-[2px] bg-white/[0.08] rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${isActive ? 'bg-emerald-400' : 'bg-white/20'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[7px] text-white/15 font-mono tabular-nums">{formatMs(progress)}</span>
                  <span className="text-[7px] text-white/15 font-mono tabular-nums">{formatMs(durationMs)}</span>
                </div>
              </div>
            )}
          </div>

          {/* External link */}
          <motion.div
            className="shrink-0 p-1.5 rounded-full text-white/20 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <ExternalLink className="size-3" />
          </motion.div>
        </a>

        {/* Device info */}
        {deviceName && isActive && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="size-1 rounded-full bg-white/20" />
            <span className="text-[8px] text-white/20 font-mono">{deviceName}</span>
            {isMusic && (spotify as MusicData).shuffleState === 'on' && (
              <span className="text-[8px] text-white/15 ml-1">🔀</span>
            )}
            {isMusic && (spotify as MusicData).repeatState !== 'off' && (
              <span className="text-[8px] text-white/15 ml-0.5">🔁</span>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Widget ─────────────────────────────────────────

export default function ActivityWidget() {
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [spotify, setSpotify] = useState<SpotifyData>({ playing: false });
  const { lang } = useLanguage();
  const elapsed = useElapsedTime(activity?.startedAt ?? null, activity?.isLive ?? false);

  // Client-only mount detection via useSyncExternalStore
  const noop = () => () => {};
  const getSnapshot = () => true;
  const getServerSnapshot = () => false;
  const isClient = useSyncExternalStore(noop, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const fetchActivity = () => {
      fetch("/api/activity")
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setActivity(d); })
        .catch(() => {});
    };
    fetchActivity();
    const i = setInterval(fetchActivity, 30000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const fetchSpotify = () => {
      fetch("/api/spotify?action=now-playing")
        .then((r) => r.json())
        .then((d) => { if (d) setSpotify(d); })
        .catch(() => {});
    };
    fetchSpotify();
    const i = setInterval(fetchSpotify, 5000);
    return () => clearInterval(i);
  }, []);

  if (!isClient || !activity || !activity.visible) return null;

  const config = statusConfig[activity.status] || statusConfig.idle;
  const StatusIcon = config.icon;

  const statusLabels: Record<string, Record<string, string>> = {
    tr: { coding: "Kodluyorum", debugging: "Hata Ayıklıyorum", learning: "Öğreniyorum", break: "Mola Veriyorum", meeting: "Toplantıda", researching: "Araştırıyorum", idle: "Çevrimdışı" },
    en: { coding: "Coding", debugging: "Debugging", learning: "Learning", break: "On Break", meeting: "In Meeting", researching: "Researching", idle: "Offline" },
  };

  const elapsedLabel = lang === "tr" ? "kodluyor" : "coding";
  const whatImDoingLabel = lang === "tr" ? "Ne Yapıyorum?" : "What Am I Doing?";
  const hasSpotify = 'type' in spotify;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 2.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed bottom-6 right-6 z-40 ${hasSpotify ? 'w-[360px]' : 'w-[340px]'} max-w-[calc(100vw-3rem)]`}
      >
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "rgba(10, 10, 20, 0.85)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: `1px solid rgba(255, 255, 255, 0.06)`,
            boxShadow: `0 0 40px ${config.glowColor}, 0 20px 60px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Glow bar */}
          <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${config.glowColor}, transparent)` }} />

          {/* LIVE badge */}
          {activity.isLive && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: config.glowColor.replace("0.3", "0.6") }} />
                <span className="relative inline-flex rounded-full size-2" style={{ backgroundColor: config.glowColor.replace("0.3", "1") }} />
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/60">LIVE</span>
            </div>
          )}

          <div className="p-4 pt-3">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`flex items-center justify-center size-8 rounded-lg ${config.bgColor}`}>
                <StatusIcon className={`size-4 ${config.color}`} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-medium">{whatImDoingLabel}</p>
                <p className={`text-xs font-semibold ${config.color}`}>
                  {statusLabels[lang]?.[activity.status] || activity.status}
                </p>
              </div>
            </div>

            {/* Activity details */}
            <div className="space-y-2">
              {activity.title && (
                <div className="flex items-center gap-2">
                  <Code2 className="size-3 text-white/30 shrink-0" />
                  <p className="text-sm text-white/80 font-mono font-medium truncate">{activity.title}</p>
                </div>
              )}

              {activity.description && (
                <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{activity.description}</p>
              )}

              <div className="flex items-center gap-3 pt-1">
                {activity.language && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                    <div className="size-1.5 rounded-full" style={{ backgroundColor: config.glowColor.replace("0.3", "0.8") }} />
                    <span className="text-[10px] text-white/50 font-medium">{activity.language}</span>
                  </div>
                )}
                {elapsed && (
                  <div className="flex items-center gap-1 ml-auto">
                    <Clock className="size-3 text-white/25" />
                    <span className="text-[11px] text-white/40 font-mono tabular-nums">{elapsed}</span>
                  </div>
                )}
              </div>

              {elapsed && activity.isLive && (
                <div className="flex items-center gap-1">
                  <Signal className="size-3 text-white/20" />
                  <span className="text-[10px] text-white/25">
                    {elapsed.split(":").length === 3
                      ? `${elapsed.split(":")[0]} saat ${elapsedLabel}`
                      : `${elapsed.split(":")[0]} dk ${elapsedLabel}`}
                  </span>
                </div>
              )}

              {/* Spotify Mini Player */}
              <SpotifyMiniPlayer spotify={spotify} />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
