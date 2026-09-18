"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { AssemblyLayer, CreamThickness, Topping } from "@/lib/store";

const THICK: Record<CreamThickness, number> = { thin: 0.09, medium: 0.15, thick: 0.24 };
const PASTRY_T = 0.07;

interface CakeModelProps {
  layers: AssemblyLayer[];
  creamThickness?: CreamThickness;
  topping?: Topping;
  width?: number;
  depth?: number;
  /** 0..1 how much moisture has migrated into the pastry (rest stage) */
  soak?: number;
  /** Remove a slice to reveal the layers */
  sliced?: boolean;
  position?: [number, number, number];
  animateIn?: boolean;
}

/**
 * A parametric Napoleon. Every layer is a slab; the slab list is derived from
 * the student's assembly so the model always reflects what they actually built.
 */
export function CakeModel({
  layers,
  creamThickness = "medium",
  topping = "none",
  width = 2.2,
  depth = 1.3,
  soak = 0,
  sliced = false,
  position = [0, 0, 0],
  animateIn = false,
}: CakeModelProps) {
  const slabs = useMemo(() => {
    const out: { type: AssemblyLayer; y: number; t: number; i: number }[] = [];
    for (let i = 0, y = 0; i < layers.length; i++) {
      const t = layers[i] === "pastry" ? PASTRY_T : THICK[creamThickness];
      out.push({ type: layers[i], y: y + t / 2, t, i });
      y += t;
    }
    return out;
  }, [layers, creamThickness]);

  const totalHeight = slabs.reduce((a, s) => a + s.t, 0);
  const sliceW = width * 0.3;

  return (
    <group position={position}>
      {slabs.map((s) => (
        <Slab
          key={s.i}
          {...s}
          width={width}
          depth={depth}
          soak={soak}
          sliced={sliced}
          sliceW={sliceW}
          animateIn={animateIn && s.i === slabs.length - 1}
        />
      ))}
      {slabs.length > 0 && topping !== "none" && (
        <ToppingLayer type={topping} y={totalHeight} width={width} depth={depth} sliced={sliced} sliceW={sliceW} />
      )}
      {sliced && slabs.length > 0 && (
        <group position={[width * 0.95, 0, 0.55]} rotation={[0, -0.35, 0]}>
          {slabs.map((s) => (
            <mesh key={`slice-${s.i}`} position={[0, s.y, 0]} castShadow>
              <boxGeometry args={[sliceW * 0.98, s.t, depth * 0.55]} />
              <SlabMaterial type={s.type} soak={soak} />
            </mesh>
          ))}
          {topping !== "none" && (
            <ToppingLayer type={topping} y={totalHeight} width={sliceW * 0.98} depth={depth * 0.55} sliced={false} sliceW={0} />
          )}
          {/* plate under the slice */}
          <mesh position={[0, -0.03, 0]} receiveShadow>
            <cylinderGeometry args={[0.85, 0.85, 0.04, 48]} />
            <meshStandardMaterial color="#ffffff" roughness={0.25} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function SlabMaterial({ type, soak }: { type: AssemblyLayer; soak: number }) {
  const color = useMemo(() => {
    if (type === "cream") return new THREE.Color("#fff1c2");
    // pastry darkens and loses matte crispness as it soaks
    return new THREE.Color("#e9b866").lerp(new THREE.Color("#d9a35a"), soak);
  }, [type, soak]);
  return (
    <meshStandardMaterial
      color={color}
      roughness={type === "cream" ? 0.4 : 0.95 - soak * 0.4}
      metalness={0}
    />
  );
}

function Slab({
  type,
  y,
  t,
  width,
  depth,
  soak,
  sliced,
  sliceW,
  animateIn,
}: {
  type: AssemblyLayer;
  y: number;
  t: number;
  width: number;
  depth: number;
  soak: number;
  sliced: boolean;
  sliceW: number;
  animateIn: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  useFrame(() => {
    if (!ref.current || !animateIn) return;
    if (start.current === null) start.current = performance.now();
    const k = Math.min(1, (performance.now() - start.current) / 450);
    const ease = 1 - Math.pow(1 - k, 3);
    ref.current.position.y = y + (1 - ease) * 0.6;
    ref.current.scale.setScalar(0.9 + 0.1 * ease);
  });
  const w = sliced ? width - sliceW : width;
  const x = sliced ? -sliceW / 2 : 0;
  return (
    <group ref={ref} position={[0, y, 0]}>
      <mesh position={[x, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, t, depth]} />
        <SlabMaterial type={type} soak={soak} />
      </mesh>
      {type === "pastry" && (
        // Fine horizontal lines hint at the internal leaves
        <mesh position={[x, 0, depth / 2 + 0.001]}>
          <planeGeometry args={[w, t]} />
          <meshStandardMaterial color="#c98f3c" transparent opacity={0.18} roughness={1} />
        </mesh>
      )}
    </group>
  );
}

function ToppingLayer({
  type,
  y,
  width,
  depth,
  sliced,
  sliceW,
}: {
  type: Topping;
  y: number;
  width: number;
  depth: number;
  sliced: boolean;
  sliceW: number;
}) {
  const w = sliced ? width - sliceW : width;
  const x = sliced ? -sliceW / 2 : 0;
  if (type === "crumbs") {
    return (
      <group position={[x, y + 0.02, 0]}>
        <mesh>
          <boxGeometry args={[w, 0.04, depth]} />
          <meshStandardMaterial color="#d7a256" roughness={1} />
        </mesh>
        <Crumbs w={w} d={depth} />
      </group>
    );
  }
  if (type === "sugar") {
    return (
      <mesh position={[x, y + 0.004, 0]}>
        <boxGeometry args={[w, 0.008, depth]} />
        <meshStandardMaterial color="#ffffff" roughness={1} transparent opacity={0.85} />
      </mesh>
    );
  }
  // fondant with chocolate feathering
  return (
    <group position={[x, y + 0.01, 0]}>
      <mesh>
        <boxGeometry args={[w, 0.02, depth]} />
        <meshStandardMaterial color="#fffaf0" roughness={0.3} />
      </mesh>
      {[-0.35, -0.15, 0.05, 0.25].map((zz, i) => (
        <mesh key={i} position={[0, 0.012, zz * depth]}>
          <boxGeometry args={[w * 0.96, 0.004, 0.018]} />
          <meshStandardMaterial color="#5b3a2a" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Crumbs({ w, d }: { w: number; d: number }) {
  const crumbs = useMemo(() => {
    const arr: { p: [number, number, number]; s: number; r: number }[] = [];
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 140; i++) {
      arr.push({
        p: [(rnd() - 0.5) * w * 0.98, 0.03 + rnd() * 0.02, (rnd() - 0.5) * d * 0.98],
        s: 0.02 + rnd() * 0.035,
        r: rnd() * Math.PI,
      });
    }
    return arr;
  }, [w, d]);
  return (
    <group>
      {crumbs.map((c, i) => (
        <mesh key={i} position={c.p} rotation={[c.r, c.r * 0.5, 0]}>
          <boxGeometry args={[c.s, c.s * 0.6, c.s]} />
          <meshStandardMaterial color={i % 3 === 0 ? "#c98f3c" : "#e2b46a"} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}
