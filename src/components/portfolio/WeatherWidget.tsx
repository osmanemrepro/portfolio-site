"use client";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";

interface WeatherData { city: string; country: string; temp: number; code: number; icon?: string; flag?: string; }

function loadCachedWeather(): WeatherData | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem("weather-cache");
    const cachedTime = localStorage.getItem("weather-cache-time");
    if (cached && cachedTime && Date.now() - parseInt(cachedTime, 10) < 10 * 60 * 1000) return JSON.parse(cached);
  } catch {}
  return null;
}

export default function WeatherWidget() {
  const { t } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(() => loadCachedWeather());
  const [loading, setLoading] = useState(() => loadCachedWeather() === null);
  const [error, setError] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    if (loadCachedWeather()) return;
    fetch("/api/weather")
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setWeather(data);
        localStorage.setItem("weather-cache", JSON.stringify(data));
        localStorage.setItem("weather-cache-time", Date.now().toString());
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="glass-card p-3 px-4 min-w-[140px]">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-white/10 animate-pulse" />
        <div className="flex flex-col gap-1">
          <div className="h-3 w-16 rounded bg-white/10 animate-pulse" />
          <div className="h-2 w-12 rounded bg-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  );

  if (error || !weather) return null;

  return (
    <div className="glass-card p-3 px-4">
      <div className="flex items-center gap-2.5">
        <span className="text-lg">{weather.icon}</span>
        <div>
          <div className="text-sm font-medium text-foreground/80">{weather.temp}°C</div>
          <div className="text-[10px] text-foreground/40 font-medium">{weather.flag} {weather.city}</div>
        </div>
      </div>
    </div>
  );
}
