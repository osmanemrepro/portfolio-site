import { NextResponse } from "next/server";

interface WeatherCache { data: { city: string; country: string; temp: number; code: number }; timestamp: number; }
let weatherCache: WeatherCache | null = null;
const CACHE_DURATION = 10 * 60 * 1000;

function getWeatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code >= 1 && code <= 3) return "🌤️";
  if (code >= 45 && code <= 48) return "🌫️";
  if (code >= 51 && code <= 55) return "🌧️";
  if (code >= 61 && code <= 65) return "🌧️";
  if (code >= 71 && code <= 75) return "❄️";
  if (code >= 80 && code <= 82) return "🌧️";
  if (code === 95) return "⛈️";
  return "🌡️";
}

function getCountryFlag(cc: string): string {
  if (!cc || cc.length !== 2) return "";
  return String.fromCodePoint(...cc.toUpperCase().split("").map(c => 127397 + c.charCodeAt(0)));
}

export async function GET() {
  try {
    if (weatherCache && Date.now() - weatherCache.timestamp < CACHE_DURATION) {
      return NextResponse.json({ ...weatherCache.data, icon: getWeatherIcon(weatherCache.data.code), flag: getCountryFlag(weatherCache.data.country) });
    }
    const ipRes = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
    if (!ipRes.ok) return NextResponse.json({ error: "Location lookup failed" }, { status: 502 });
    const ipData = await ipRes.json();
    const { city, country, country_code, latitude, longitude } = ipData;
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&timezone=auto`, { signal: AbortSignal.timeout(5000) });
    if (!weatherRes.ok) return NextResponse.json({ error: "Weather unavailable" }, { status: 502 });
    const weatherData = await weatherRes.json();
    const result = { city, country, temp: Math.round(weatherData.current.temperature_2m), code: weatherData.current.weathercode };
    weatherCache = { data: result, timestamp: Date.now() };
    return NextResponse.json({ ...result, icon: getWeatherIcon(result.code), flag: getCountryFlag(country_code) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
