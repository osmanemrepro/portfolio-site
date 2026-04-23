"use client";
import { useCallback, useRef, useState } from "react";

interface Particle {
  id: number; x: number; y: number; vx: number; vy: number;
  color: string; size: number; rotation: number; rotationSpeed: number;
}

const COLORS = ["#8B5CF6", "#06B6D4", "#EC4899", "#F59E0B", "#10B981", "#EF4444", "#3B82F6"];

export function useConfetti() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const idRef = useRef(0);

  const fire = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 80; i++) {
      idRef.current += 1;
      const angle = (Math.random() * Math.PI * 2);
      const velocity = Math.random() * 8 + 4;
      newParticles.push({
        id: idRef.current,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 50,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 6 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 720,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 3000);
  }, []);

  return { fire, particles };
}

export function ConfettiContainer({ particles }: { particles: Particle[] }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100]" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size * 0.6,
            background: p.color, borderRadius: "2px",
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall 1.5s ease-out forwards`,
            animationDelay: `${Math.random() * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
          100% { opacity: 0; transform: translateY(60vh) rotate(720deg) scale(0.3); }
        }
      `}</style>
    </div>
  );
}
