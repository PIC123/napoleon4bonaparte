"use client";

import { RoundedBox } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Pop-in wrapper: scales from 0 to 1 when mounted. */
export function PopIn({ children, delay = 0, position }: { children: React.ReactNode; delay?: number; position?: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const t0 = useRef<number | null>(null);
  useFrame(() => {
    if (!ref.current) return;
    if (t0.current === null) t0.current = performance.now() + delay;
    const k = Math.max(0, Math.min(1, (performance.now() - t0.current) / 380));
    const s = k < 1 ? 1.15 * Math.sin((k * Math.PI) / 2) - 0.15 * Math.sin(k * Math.PI) : 1;
    ref.current.scale.setScalar(Math.max(0.0001, s));
  });
  return (
    <group ref={ref} position={position} scale={0.0001}>
      {children}
    </group>
  );
}

export function Sack({ color = "#efe4cf", label }: { color?: string; label?: boolean }) {
  return (
    <group>
      <RoundedBox args={[0.5, 0.62, 0.32]} radius={0.08} smoothness={4} position={[0, 0.31, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={1} />
      </RoundedBox>
      <mesh position={[0, 0.66, 0]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.36, 0.08, 0.2]} />
        <meshStandardMaterial color="#d9c7a6" roughness={1} />
      </mesh>
      {label && (
        <mesh position={[0, 0.3, 0.165]}>
          <planeGeometry args={[0.3, 0.16]} />
          <meshStandardMaterial color="#c8873a" roughness={1} />
        </mesh>
      )}
    </group>
  );
}

export function ButterBlock({ color = "#f6d76b", size = 1 }: { color?: string; size?: number }) {
  return (
    <RoundedBox args={[0.42 * size, 0.22 * size, 0.28 * size]} radius={0.02} smoothness={3} position={[0, 0.11 * size, 0]} castShadow>
      <meshStandardMaterial color={color} roughness={0.55} />
    </RoundedBox>
  );
}

export function Bottle({ color = "#fbfbf7", height = 0.7 }: { color?: string; height?: number }) {
  return (
    <group>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.15, height, 24]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      <mesh position={[0, height + 0.06, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.12, 24]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      <mesh position={[0, height + 0.14, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.05, 24]} />
        <meshStandardMaterial color="#5b8bb3" roughness={0.5} />
      </mesh>
    </group>
  );
}

export function Jar({ color = "#ffffff", lid = "#8c8279" }: { color?: string; lid?: string }) {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.4, 28]} />
        <meshPhysicalMaterial color={color} roughness={0.2} transmission={0.25} thickness={0.3} />
      </mesh>
      <mesh position={[0, 0.43, 0]}>
        <cylinderGeometry args={[0.175, 0.175, 0.06, 28]} />
        <meshStandardMaterial color={lid} roughness={0.6} metalness={0.3} />
      </mesh>
    </group>
  );
}

export function Egg({ color = "#f3dcb8" }: { color?: string }) {
  return (
    <mesh position={[0, 0.12, 0]} scale={[1, 1.3, 1]} castShadow>
      <sphereGeometry args={[0.1, 24, 24]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}

export function Bowl({ color = "#ffffff", radius = 0.55, children }: { color?: string; radius?: number; children?: React.ReactNode }) {
  return (
    <group>
      <mesh position={[0, radius * 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius * 0.72, radius * 0.9, 40, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.005, 0]}>
        <cylinderGeometry args={[radius * 0.72, radius * 0.72, 0.01, 40]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      <group position={[0, 0.02, 0]}>{children}</group>
    </group>
  );
}

export function Pot({ children }: { children?: React.ReactNode }) {
  return (
    <group>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.6, 0.6, 48, 1, true]} />
        <meshStandardMaterial color="#c9cdd2" roughness={0.3} metalness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.02, 48]} />
        <meshStandardMaterial color="#aeb3b8" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* handle */}
      <mesh position={[0.85, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.6, 16]} />
        <meshStandardMaterial color="#2a2420" roughness={0.6} />
      </mesh>
      {children}
    </group>
  );
}

export function Burner({ on }: { on: boolean }) {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const flicker = on ? 0.7 + Math.sin(clock.elapsedTime * 14) * 0.15 : 0;
    ref.current.emissiveIntensity = flicker;
  });
  return (
    <group>
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.85, 0.85, 0.06, 48]} />
        <meshStandardMaterial color="#3b3a3a" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <torusGeometry args={[0.5, 0.04, 12, 48]} />
        <meshStandardMaterial ref={ref} color="#5a2a1a" emissive="#ff7a2a" emissiveIntensity={0} roughness={0.7} />
      </mesh>
    </group>
  );
}
