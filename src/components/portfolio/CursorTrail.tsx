"use client";
import { useEffect, useRef } from "react";

interface TrailPoint { id: number; x: number; y: number; createdAt: number; }
const MAX_TRAIL = 20;
const TRAIL_LIFETIME = 800;

export default function CursorTrail() {
  const pointsRef = useRef<TrailPoint[]>([]);
  const frameRef = useRef<number>(0);
  const idRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    const handleMouseMove = (e: MouseEvent) => {
      idRef.current += 1;
      pointsRef.current.push({ id: idRef.current, x: e.clientX, y: e.clientY, createdAt: Date.now() });
      if (pointsRef.current.length > MAX_TRAIL) pointsRef.current = pointsRef.current.slice(-MAX_TRAIL);
    };
    const animate = () => {
      const now = Date.now();
      pointsRef.current = pointsRef.current.filter(p => now - p.createdAt < TRAIL_LIFETIME);
      const container = containerRef.current;
      if (container) {
        const existingDots = container.querySelectorAll(".trail-dot");
        existingDots.forEach(d => d.remove());
        pointsRef.current.forEach((point, index) => {
          const age = (now - point.createdAt) / TRAIL_LIFETIME;
          const opacity = 1 - age;
          const scale = 1 - age * 0.5;
          const hue = 270 + (index / MAX_TRAIL) * 60;
          const dot = document.createElement("div");
          dot.className = "trail-dot";
          dot.style.cssText = `position:fixed;left:${point.x}px;top:${point.y}px;width:${4+scale*2}px;height:${4+scale*2}px;background:hsl(${hue},80%,65%);border-radius:50%;pointer-events:none;opacity:${opacity*0.6};transform:translate(-50%,-50%) scale(${scale});z-index:9999;transition:none;box-shadow:0 0 6px hsl(${hue},80%,65%);`;
          container.appendChild(dot);
        });
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    frameRef.current = requestAnimationFrame(animate);
    return () => { window.removeEventListener("mousemove", handleMouseMove); cancelAnimationFrame(frameRef.current); };
  }, []);

  return <div ref={containerRef} className="hidden md:block fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true" />;
}
