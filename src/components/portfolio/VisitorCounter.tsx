"use client";
import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/lib/i18n";

export default function VisitorCounter() {
  const { t } = useLanguage();
  const [count, setCount] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(0);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    fetch("/api/visitor", { method: "POST" })
      .then(res => res.json())
      .then(data => { if (typeof data.count === "number") setCount(data.count); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (count === null) return;
    const start = displayCount; const end = count;
    const duration = 1500; const startTime = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayCount(Math.round(start + (end - start) * eased));
      if (progress < 1) animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [count]);

  if (count === null) {
    return (
      <div className="glass-card p-3 px-4" aria-label={t("widget.visitors")}>
        <div className="flex items-center gap-2">
          <div className="text-lg">👥</div>
          <div className="flex flex-col gap-1">
            <div className="h-3 w-8 rounded bg-white/10 animate-pulse" />
            <div className="h-2 w-16 rounded bg-white/5 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-3 px-4" aria-label={t("widget.visitors")}>
      <div className="flex items-center gap-2.5">
        <span className="text-lg">👥</span>
        <div>
          <div className="text-sm font-bold text-foreground/80 tabular-nums">{displayCount}</div>
          <div className="text-[10px] text-foreground/40 font-medium">{t("widget.visitorCount")}</div>
        </div>
      </div>
    </div>
  );
}
