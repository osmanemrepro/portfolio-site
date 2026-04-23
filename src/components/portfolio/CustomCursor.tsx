"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

function subscribe() {
  return () => {};
}

function getIsTouchSnapshot() {
  if (typeof window === "undefined") return true;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

function getServerSnapshot() {
  return true;
}

export default function CustomCursor() {
  const isTouchDevice = useSyncExternalStore(subscribe, getIsTouchSnapshot, getServerSnapshot);
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const target = e.target as HTMLElement;
      setIsPointer(
        window.getComputedStyle(target).cursor === "pointer" ||
          target.tagName === "A" ||
          target.tagName === "BUTTON" ||
          !!target.closest("a") ||
          !!target.closest("button")
      );
    },
    [cursorX, cursorY]
  );

  const handleMouseLeave = useCallback(() => setIsVisible(false), []);
  const handleMouseEnter = useCallback(() => setIsVisible(true), []);

  useEffect(() => {
    if (isTouchDevice) return;

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isTouchDevice, handleMouseMove, handleMouseLeave, handleMouseEnter]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* Outer glow ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-screen"
        style={{ x, y }}
      >
        <motion.div
          className="rounded-full"
          animate={{
            width: isPointer ? 60 : 40,
            height: isPointer ? 60 : 40,
            opacity: isPointer ? 0.3 : 0.15,
          }}
          transition={{ duration: 0.2 }}
          style={{
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(99, 102, 241, 0.3) 40%, transparent 70%)",
            transform: "translate(-50%, -50%)",
          }}
        />
      </motion.div>

      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ x, y }}
      >
        <motion.div
          className="rounded-full bg-white"
          animate={{
            width: isPointer ? 8 : 5,
            height: isPointer ? 8 : 5,
            opacity: isPointer ? 0.9 : 0.7,
          }}
          transition={{ duration: 0.2 }}
          style={{
            boxShadow: "0 0 10px rgba(139, 92, 246, 0.8)",
            transform: "translate(-50%, -50%)",
          }}
        />
      </motion.div>
    </>
  );
}
