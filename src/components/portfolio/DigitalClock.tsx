"use client";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";

const trDays = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const trMonths = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const enDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const enMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatDate(time: Date, lang: string): string {
  const days = lang === "tr" ? trDays : enDays;
  const months = lang === "tr" ? trMonths : enMonths;
  return lang === "tr"
    ? `${time.getDate()} ${months[time.getMonth()]} ${time.getFullYear()}, ${days[time.getDay()]}`
    : `${months[time.getMonth()]} ${time.getDate()}, ${time.getFullYear()}, ${days[time.getDay()]}`;
}

export default function DigitalClock() {
  const { t, lang } = useLanguage();
  const [time, setTime] = useState<Date | null>(null);
  const [colonVisible, setColonVisible] = useState(true);

  useEffect(() => {
    const tick = () => { setTime(new Date()); setColonVisible(p => !p); };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return (
    <div className="glass-card p-3 px-4 min-w-[140px]">
      <div className="flex flex-col gap-1">
        <div className="h-4 w-16 rounded bg-white/10 animate-pulse" />
        <div className="h-2.5 w-24 rounded bg-white/5 animate-pulse" />
      </div>
    </div>
  );

  const h = time.getHours().toString().padStart(2, "0");
  const m = time.getMinutes().toString().padStart(2, "0");
  const s = time.getSeconds().toString().padStart(2, "0");

  return (
    <div className="glass-card p-3 px-4">
      <div className="flex flex-col gap-0.5">
        <div className="text-sm font-mono font-medium text-foreground/80 tracking-wider">
          {h}<span className={colonVisible ? "opacity-100" : "opacity-20"}>:</span>
          {m}<span className={colonVisible ? "opacity-100" : "opacity-20"}>:</span>
          {s}
        </div>
        <div className="text-[10px] text-foreground/40 font-medium">{formatDate(time, lang)}</div>
      </div>
    </div>
  );
}
