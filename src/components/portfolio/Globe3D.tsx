"use client";

import { useRef, useMemo, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

/* ─── geometri sabitleri ─── */
const RADIUS = 1.2;
const DOT_COUNT = 1800;
const ARC_COUNT = 6;

/* ─── Fibonacci küre noktaları ─── */
function fibSphere(n: number, r: number) {
  const pts: [number, number, number][] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const theta = golden * i;
    pts.push([Math.cos(theta) * rad * r, y * r, Math.sin(theta) * rad * r]);
  }
  return pts;
}

/* ─── Rastgele yay (arc) ─── */
function randomArc(r: number) {
  const start = new THREE.Vector3().setFromSphericalCoords(r, Math.random() * Math.PI, Math.random() * 2 * Math.PI);
  const end = new THREE.Vector3().setFromSphericalCoords(r, Math.random() * Math.PI, Math.random() * 2 * Math.PI);
  const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(r + 0.5 + Math.random() * 0.4);
  return new THREE.QuadraticBezierCurve3(start, mid, end);
}

/* ─── Globe wireframe ─── */
function GlobeWireframe() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.08;
  });
  return (
    <group ref={ref}>
      {/* Ana küre */}
      <mesh>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <meshBasicMaterial color="#7c3aed" wireframe transparent opacity={0.08} />
      </mesh>
      {/* Dots */}
      <Dots />
      {/* Yaylar */}
      <Arcs />
    </group>
  );
}

/* ─── Noktalar ─── */
function Dots() {
  const points = useMemo(() => fibSphere(DOT_COUNT, RADIUS * 1.001), []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(points.flat(), 3));
    return g;
  }, [points]);

  return (
    <points geometry={geo}>
      <pointsMaterial size={0.012} color="#a78bfa" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

/* ─── Yaylar ─── */
function ArcLine({ index }: { index: number }) {
  const curve = useMemo(() => randomArc(RADIUS), []);
  const pts = useMemo(() => curve.getPoints(40), [curve]);
  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(pts), [pts]);
  return (
    <line geometry={geo}>
      <lineBasicMaterial color="#c084fc" transparent opacity={0.25} />
    </line>
  );
}

function Arcs() {
  return (
    <>
      {Array.from({ length: ARC_COUNT }, (_, i) => (
        <ArcLine key={i} index={i} />
      ))}
    </>
  );
}

/* ─── Glow ring ─── */
function GlowRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2 + 0.8;
    }
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[RADIUS * 1.25, RADIUS * 1.28, 96]} />
      <meshBasicMaterial color="#8b5cf6" transparent opacity={0.12} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ─── İç ışık noktası ─── */
function InnerGlow() {
  return (
    <mesh>
      <sphereGeometry args={[RADIUS * 0.98, 32, 32]} />
      <meshBasicMaterial color="#7c3aed" transparent opacity={0.03} />
    </mesh>
  );
}

/* ─── Floating etiket ─── */
function FloatingLabel() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15 + 1.8;
    }
  });
  const { t } = useLanguage();
  return (
    <group ref={ref}>
      <Html center distanceFactor={4}>
        <div className="px-3 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase bg-purple-500/10 border border-purple-500/20 text-purple-400 backdrop-blur-md whitespace-nowrap select-none pointer-events-none">
          {t("globe.label") || "Global Network"}
        </div>
      </Html>
    </group>
  );
}

/* ─── Ana bileşen ─── */
export default function Globe3D() {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleCreated = useCallback(() => {
    setVisible(true);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: hovered ? 0.95 : 0.7, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="fixed top-1/2 -translate-y-1/2 right-0 translate-x-[0%] z-10 pointer-events-auto"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setHasInteracted(!hasInteracted)}
          style={{ width: 340, height: 340 }}
        >
          <Canvas
            camera={{ position: [0, 0, 3.2], fov: 45 }}
            onCreated={handleCreated}
            style={{ pointerEvents: hasInteracted ? "auto" : "none" }}
          >
            <ambientLight intensity={0.5} />
            <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
              <GlobeWireframe />
              <InnerGlow />
              <GlowRing />
              <FloatingLabel />
            </Float>
            {hasInteracted && (
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={1.5}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 1.5}
              />
            )}
          </Canvas>
          {/* Overlay hint */}
          {!hasInteracted && (
            <div className="absolute inset-0 flex items-end justify-center pb-2 pointer-events-none">
              <span className="text-[9px] text-white/30 font-medium tracking-wide">
                Tıkla → Döndür
              </span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
