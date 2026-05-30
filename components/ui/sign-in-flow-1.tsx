"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface CanvasRevealEffectProps {
  reverse?: boolean;
}

function ParticleField({ reverse = false }: CanvasRevealEffectProps) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const data = new Float32Array(900);
    for (let i = 0; i < data.length; i += 3) {
      const radius = 1.2 + Math.random() * 2.8;
      const angle = Math.random() * Math.PI * 2;
      data[i] = Math.cos(angle) * radius;
      data[i + 1] = (Math.random() - 0.5) * 3;
      data[i + 2] = Math.sin(angle) * radius;
    }
    return data;
  }, []);

  useFrame(({ clock }) => {
    if (!points.current) return;
    const t = clock.getElapsedTime();
    points.current.rotation.y = t * (reverse ? -0.08 : 0.08);
    points.current.rotation.x = Math.sin(t * 0.3) * 0.08;
  });

  return (
    <points ref={points} scale={reverse ? 0.75 : 1}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={reverse ? "#16a34a" : "#006cff"}
        size={0.018}
        transparent
        opacity={reverse ? 0.2 : 0.55}
        depthWrite={false}
      />
    </points>
  );
}

export function CanvasRevealEffect({ reverse = false }: CanvasRevealEffectProps) {
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#080808]"
      initial={false}
      animate={{ opacity: reverse ? 0.55 : 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(0,108,255,0.22),transparent_36%),radial-gradient(circle_at_28%_72%,rgba(22,163,74,0.12),transparent_30%)]" />
      <Canvas camera={{ position: [0, 0, 5], fov: 55 }}>
        <ambientLight intensity={0.8} />
        <ParticleField reverse={reverse} />
      </Canvas>
      <motion.div
        className="absolute inset-0 bg-[#080808]"
        initial={false}
        animate={{ opacity: reverse ? 0.38 : 0.08 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
    </motion.div>
  );
}
