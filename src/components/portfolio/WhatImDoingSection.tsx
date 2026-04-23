"use client";

import { useEffect, useState, useRef, useSyncExternalStore } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Code2, Bug, BookOpen, Coffee, Users, Search,
  Clock, Signal, Monitor, ExternalLink,
  Activity,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

/* ── Types ──────────────────────────────────────────────── */

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

type SpotifyData = MusicData | PodcastData | RecentData | { playing: false };

/* ── Status Config ──────────────────────────────────────── */

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; glowColor: string; label: Record<string, string> }> = {
  coding:      { icon: Code2,   color: "text-emerald-400", bgColor: "bg-emerald-500/10",  glowColor: "rgba(16,185,129,0.3)",  label: { tr: "Kodluyorum", en: "Coding" } },
  debugging:   { icon: Bug,     color: "text-red-400",     bgColor: "bg-red-500/10",      glowColor: "rgba(239,68,68,0.3)",   label: { tr: "Hata Ayıklıyorum", en: "Debugging" } },
  learning:    { icon: BookOpen, color: "text-blue-400",    bgColor: "bg-blue-500/10",     glowColor: "rgba(59,130,246,0.3)",  label: { tr: "Öğreniyorum", en: "Learning" } },
  break:       { icon: Coffee,   color: "text-amber-400",   bgColor: "bg-amber-500/10",    glowColor: "rgba(245,158,11,0.3)",  label: { tr: "Mola Veriyorum", en: "On Break" } },
  meeting:     { icon: Users,    color: "text-purple-400",  bgColor: "bg-purple-500/10",   glowColor: "rgba(139,92,246,0.3)",  label: { tr: "Toplantıda", en: "In Meeting" } },
  researching: { icon: Search,   color: "text-cyan-400",    bgColor: "bg-cyan-500/10",     glowColor: "rgba(6,182,212,0.3)",   label: { tr: "Araştırıyorum", en: "Researching" } },
  idle:        { icon: Monitor,  color: "text-zinc-400",    bgColor: "bg-zinc-500/10",     glowColor: "rgba(161,161,170,0.2)", label: { tr: "Çevrimdışı", en: "Offline" } },
};

/* ── Helpers ────────────────────────────────────────────── */

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

/* ── Spotify Card ──────────────────────────────────────── */

function SpotifyCard({ spotify }: { spotify: SpotifyData }) {
  const isMusic = 'type' in spotify && spotify.type === 'music';
  const isPodcast = 'type' in spotify && spotify.type === 'podcast';
  const isActive = 'playing' in spotify && spotify.playing === true;
  const durationMs = ('type' in spotify) ? spotify.durationMs || 0 : 0;
  const progressMs = ('type' in spotify) ? spotify.progressMs || 0 : 0;
  const progress = useSpotifyProgress(isActive, progressMs, durationMs);

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
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.98 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card p-5 border border-[#1DB954]/20 hover:border-[#1DB954]/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(29,185,84,0.08)]"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="size-7 rounded-full bg-[#1DB954]/10 flex items-center justify-center">
            <span className="text-sm">🎧</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-medium">
            {isActive
              ? (isMusic ? 'Şimdi Dinliyorum' : 'Podcast Dinliyorum')
              : (isMusic ? 'Son Dinlenen' : 'Son Podcast')}
          </span>
          {isActive && (
            <span className="relative flex size-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-emerald-400" />
            </span>
          )}
        </div>

        {/* Main row */}
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4"
        >
          {/* Cover */}
          <div className="relative shrink-0">
            {cover ? (
              <motion.img
                src={cover}
                alt={title}
                className="rounded-xl object-cover shadow-lg size-16"
                style={{
                  boxShadow: isActive ? `0 0 28px rgba(29,185,84,0.15)` : 'none',
                }}
                animate={isActive ? { rotate: [0, 0.5, -0.5, 0] } : {}}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
            ) : (
              <div className="rounded-xl flex items-center justify-center size-16 bg-[#1DB954]/10 border border-[#1DB954]/15">
                <span className="text-2xl">🎧</span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-[#1DB954] flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 24 24" className="size-3 fill-black">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white/90 truncate group-hover:text-emerald-400 transition-colors leading-snug">
              {title}
            </p>
            <p className="text-xs text-white/45 truncate mt-0.5">{subtitle}</p>
            {isPodcast && isActive && (spotify as PodcastData).description && (
              <p className="text-[10px] text-white/25 truncate mt-0.5 italic">
                {(spotify as PodcastData).description}
              </p>
            )}

            {/* Progress */}
            {durationMs > 0 && (
              <div className="mt-2">
                <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${isActive ? 'bg-emerald-400' : 'bg-white/15'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[9px] text-white/15 font-mono tabular-nums">{formatMs(progress)}</span>
                  <span className="text-[9px] text-white/15 font-mono tabular-nums">{formatMs(durationMs)}</span>
                </div>
              </div>
            )}
          </div>

          {/* External link */}
          <motion.div
            className="shrink-0 p-2 rounded-full text-white/20 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all duration-200"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <ExternalLink className="size-4" />
          </motion.div>
        </a>

        {/* Device */}
        {deviceName && isActive && (
          <div className="mt-3 flex items-center gap-1.5">
            <div className="size-1 rounded-full bg-white/20" />
            <span className="text-[9px] text-white/20 font-mono">{deviceName}</span>
            {isMusic && (spotify as MusicData).shuffleState === 'on' && (
              <span className="text-[9px] text-white/15 ml-1">🔀</span>
            )}
            {isMusic && (spotify as MusicData).repeatState !== 'off' && (
              <span className="text-[9px] text-white/15 ml-0.5">🔁</span>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Clock + Weather Top Bar ───────────────────────────── */

function TopBar() {
  const { lang } = useLanguage();
  const [time, setTime] = useState<Date | null>(null);
  const [colonVisible, setColonVisible] = useState(true);

  const trDays = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  const trMonths = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const enDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const enMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  useEffect(() => {
    const tick = () => { setTime(new Date()); setColonVisible(p => !p); };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  function loadCachedWeather(): { city: string; temp: number; icon: string; flag?: string } | null {
    if (typeof window === "undefined") return null;
    try {
      const cached = localStorage.getItem("weather-cache");
      const cachedTime = localStorage.getItem("weather-cache-time");
      if (cached && cachedTime && Date.now() - parseInt(cachedTime, 10) < 10 * 60 * 1000) return JSON.parse(cached);
    } catch {}
    return null;
  }

  const [weather, setWeather] = useState<{ city: string; temp: number; icon: string; flag?: string } | null>(() => loadCachedWeather());

  useEffect(() => {
    if (loadCachedWeather()) return;
    fetch("/api/weather")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setWeather(data);
          localStorage.setItem("weather-cache", JSON.stringify(data));
          localStorage.setItem("weather-cache-time", Date.now().toString());
        }
      })
      .catch(() => {});
  }, []);

  if (!time) return null;

  const h = time.getHours().toString().padStart(2, "0");
  const m = time.getMinutes().toString().padStart(2, "0");
  const s = time.getSeconds().toString().padStart(2, "0");
  const days = lang === "tr" ? trDays : enDays;
  const months = lang === "tr" ? trMonths : enMonths;
  const dateStr = lang === "tr"
    ? `${time.getDate()} ${months[time.getMonth()]} ${time.getFullYear()}, ${days[time.getDay()]}`
    : `${months[time.getMonth()]} ${time.getDate()}, ${time.getFullYear()}, ${days[time.getDay()]}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-12"
    >
      {/* Clock */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-full glass-card border border-white/[0.06]">
        <Clock className="size-4 text-purple-400/60" />
        <span className="text-sm font-mono font-medium text-foreground/70 tracking-wider tabular-nums">
          {h}<span className={colonVisible ? "opacity-100" : "opacity-20"}>:</span>
          {m}<span className={colonVisible ? "opacity-100" : "opacity-20"}>:</span>
          {s}
        </span>
        <span className="text-[11px] text-foreground/30 font-medium hidden sm:inline">{dateStr}</span>
      </div>

      {/* Weather */}
      {weather && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full glass-card border border-white/[0.06]">
          <span className="text-base">{weather.icon}</span>
          <span className="text-sm font-medium text-foreground/70">{weather.temp}°C</span>
          <span className="text-[11px] text-foreground/30 font-medium">
            {weather.flag} {weather.city}
          </span>
        </div>
      )}
    </motion.div>
  );
}

/* ── Main Section ──────────────────────────────────────── */

export default function WhatImDoingSection() {
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [spotify, setSpotify] = useState<SpotifyData>({ playing: false });
  const { lang } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const elapsed = useElapsedTime(activity?.startedAt ?? null, activity?.isLive ?? false);

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

  if (!isClient) return null;

  const config = activity ? (statusConfig[activity.status] || statusConfig.idle) : statusConfig.idle;
  const StatusIcon = config.icon;
  const statusLabel = config.label[lang] || config.label.en;
  const elapsedLabel = lang === "tr" ? "kodluyor" : "coding";
  const sectionTitle = lang === "tr" ? "Ne Yapıyorum?" : "What Am I Doing?";
  const sectionSubtitle = lang === "tr" ? "Şu anda nelerle meşgulüm" : "What I'm currently up to";

  const hasSpotify = 'type' in spotify;

  return (
    <section
      id="activity"
      ref={ref}
      className="relative section-padding overflow-hidden"
    >
      {/* Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-600/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar — Clock + Weather */}
        <TopBar />

        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border border-white/[0.06] mb-6"
          >
            <Activity className="size-3.5 text-purple-400/60" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">
              {lang === "tr" ? "Canlı Durum" : "Live Status"}
            </span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            <span className="gradient-text">{sectionTitle}</span>
          </h2>
          <p className="text-white/30 text-sm sm:text-base max-w-lg mx-auto">{sectionSubtitle}</p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Left — Activity Status */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div
              className="glass-card p-6 sm:p-8 border transition-all duration-300"
              style={{
                borderColor: `${config.glowColor.replace("0.3", "0.15")}`,
                boxShadow: `0 0 40px ${config.glowColor.replace("0.3", "0.05")}`,
              }}
            >
              {/* Glow bar */}
              <div className="h-[2px] w-full rounded-full mb-6" style={{ background: `linear-gradient(90deg, transparent, ${config.glowColor}, transparent)` }} />

              {/* Status header */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`flex items-center justify-center size-10 rounded-xl ${config.bgColor} border border-white/[0.04]`}>
                  <StatusIcon className={`size-5 ${config.color}`} />
                </div>
                <div>
                  <p className="text-xs text-white/35 font-medium">{lang === "tr" ? "Durum" : "Status"}</p>
                  <p className={`text-base font-semibold ${config.color}`}>{statusLabel}</p>
                </div>
                {activity?.isLive && (
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="relative flex size-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: config.glowColor.replace("0.3", "0.6") }} />
                      <span className="relative inline-flex rounded-full size-2" style={{ backgroundColor: config.glowColor.replace("0.3", "1") }} />
                    </span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-white/50">LIVE</span>
                  </div>
                )}
              </div>

              {/* Activity details */}
              <div className="space-y-4">
                {activity?.title && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <Code2 className="size-4 text-white/25 shrink-0" />
                    <p className="text-sm text-white/80 font-mono font-medium truncate">{activity.title}</p>
                  </div>
                )}

                {activity?.description && (
                  <p className="text-xs text-white/35 leading-relaxed pl-1">{activity.description}</p>
                )}

                <div className="flex items-center gap-3 flex-wrap">
                  {activity?.language && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
                      <div className="size-2 rounded-full" style={{ backgroundColor: config.glowColor.replace("0.3", "0.8") }} />
                      <span className="text-xs text-white/50 font-medium">{activity.language}</span>
                    </div>
                  )}
                  {elapsed && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
                      <Clock className="size-3 text-white/25" />
                      <span className="text-xs text-white/50 font-mono tabular-nums">{elapsed}</span>
                    </div>
                  )}
                </div>

                {elapsed && activity?.isLive && (
                  <div className="flex items-center gap-1.5">
                    <Signal className="size-3 text-white/20" />
                    <span className="text-[11px] text-white/25">
                      {elapsed.split(":").length === 3
                        ? `${elapsed.split(":")[0]} saat ${elapsedLabel}`
                        : `${elapsed.split(":")[0]} dk ${elapsedLabel}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right — Spotify */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {hasSpotify ? (
              <SpotifyCard spotify={spotify} />
            ) : (
              <div className="glass-card p-6 sm:p-8 border border-white/[0.06] flex flex-col items-center justify-center min-h-[200px] text-center">
                <div className="size-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                  <span className="text-2xl">🎧</span>
                </div>
                <p className="text-sm text-white/40 font-medium mb-1">
                  {lang === "tr" ? "Spotify Bağlantısı Bekleniyor" : "Waiting for Spotify"}
                </p>
                <p className="text-xs text-white/20">
                  {lang === "tr" ? "Şu an bir şey dinlemiyor" : "Not listening to anything right now"}
                </p>
              </div>
            )}

            {/* Coding stats mini cards */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="glass-card p-4 border border-white/[0.04] text-center">
                <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center mx-auto mb-2">
                  <Code2 className="size-4 text-purple-400/70" />
                </div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium">
                  {lang === "tr" ? "Aktif Dil" : "Active Lang"}
                </p>
                <p className="text-sm text-white/70 font-semibold font-mono mt-1">
                  {activity?.language || "—"}
                </p>
              </div>
              <div className="glass-card p-4 border border-white/[0.04] text-center">
                <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                  <Clock className="size-4 text-emerald-400/70" />
                </div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium">
                  {lang === "tr" ? "Geçen Süre" : "Elapsed"}
                </p>
                <p className="text-sm text-white/70 font-semibold font-mono mt-1 tabular-nums">
                  {elapsed || "—"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
