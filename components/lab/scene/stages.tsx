"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useLab, type AssemblyLayer } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { PANTRY_BY_ID } from "@/lib/curriculum";
import { bakeOutcome } from "@/lib/evaluate";
import { clamp, remap } from "@/lib/utils";
import { CakeModel } from "./CakeModel";
import { Bottle, Bowl, Burner, ButterBlock, Egg, Jar, PopIn, Pot, Sack } from "./props";

/* ------------------------------------------------------------------ */
/* Welcome                                                             */
/* ------------------------------------------------------------------ */

const SHOWCASE_LAYERS: AssemblyLayer[] = ["pastry", "cream", "pastry", "cream", "pastry", "cream", "pastry", "cream", "pastry", "cream", "pastry", "cream", "pastry"];

/** Later stages still show a cake if the student skipped assembly. */
const withFallback = (layers: AssemblyLayer[]) => (layers.length ? layers : SHOWCASE_LAYERS);

export function WelcomeScene() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.18;
  });
  return (
    <group ref={ref}>
      {/* cake stand */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.8, 1.8, 0.06, 64]} />
        <meshStandardMaterial color="#ffffff" roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.5, 0.7, 0.06, 32]} />
        <meshStandardMaterial color="#e7dfd2" roughness={0.4} />
      </mesh>
      <CakeModel
        layers={SHOWCASE_LAYERS}
        creamThickness="thin"
        topping="crumbs"
        position={[0, 0.11, 0]}
        sliced
        soak={0.6}
      />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Pantry                                                              */
/* ------------------------------------------------------------------ */

function IngredientProp({ id }: { id: string }) {
  const ing = PANTRY_BY_ID[id];
  switch (id) {
    case "ap-flour":
    case "bread-flour":
    case "cake-flour":
    case "self-rising":
    case "cornstarch":
      return <Sack color={ing.color} label />;
    case "euro-butter":
    case "butter":
    case "margarine":
      return <ButterBlock color={ing.color} />;
    case "milk":
    case "heavy-cream":
    case "vinegar":
    case "vanilla":
      return <Bottle color={ing.color} height={id === "vanilla" || id === "vinegar" ? 0.4 : 0.7} />;
    case "yolks":
    case "whites":
      return (
        <group>
          <Egg color={id === "whites" ? "#fbfbfb" : "#f3dcb8"} />
          <group position={[0.16, 0, 0.05]}>
            <Egg color={id === "whites" ? "#fbfbfb" : "#f3dcb8"} />
          </group>
        </group>
      );
    case "ice-water":
    case "warm-water":
      return <Jar color={ing.color} lid={id === "ice-water" ? "#5b8bb3" : "#c95f5f"} />;
    case "chocolate":
      return (
        <RoundedBox args={[0.4, 0.08, 0.26]} radius={0.01} position={[0, 0.04, 0]} castShadow>
          <meshStandardMaterial color={ing.color} roughness={0.4} />
        </RoundedBox>
      );
    default:
      return <Jar color={ing.color} />;
  }
}

export function PantryScene() {
  const lists = useLab((s) => s.lists);
  const place = (ids: string[], xStart: number) =>
    ids.map((id, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      return (
        <PopIn key={`${xStart}-${id}`} position={[xStart + col * 0.62, 0.05, -0.55 + row * 0.75]}>
          <IngredientProp id={id} />
        </PopIn>
      );
    });
  return (
    <group>
      {/* two boards, one per list */}
      <RoundedBox args={[2.5, 0.04, 1.9]} radius={0.02} position={[-1.35, 0.06, 0]} receiveShadow>
        <meshStandardMaterial color="#e5cfae" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[2.5, 0.04, 1.9]} radius={0.02} position={[1.35, 0.06, 0]} receiveShadow>
        <meshStandardMaterial color="#efe0c8" roughness={0.9} />
      </RoundedBox>
      {place(lists.pastry, -2.3)}
      {place(lists.cream, 0.4)}
      {lists.pastry.length === 0 && lists.cream.length === 0 && (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
          <Bowl color="#ffffff" radius={0.5} />
        </Float>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Détrempe                                                            */
/* ------------------------------------------------------------------ */

export function DoughScene() {
  const { hydration, mixMinutes, restMinutes } = useLab(useShallow((s) => ({
    hydration: s.hydration,
    mixMinutes: s.mixMinutes,
    restMinutes: s.restMinutes,
  })));
  const ref = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.Mesh>(null);
  const target = useMemo(() => {
    // wetter dough slumps: wider and flatter
    const spread = remap(hydration, 40, 65, 0.85, 1.35);
    const height = remap(hydration, 40, 65, 1.05, 0.62);
    return new THREE.Vector3(spread, height, spread);
  }, [hydration]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.scale.lerp(target, 1 - Math.pow(0.001, dt));
    if (wire.current) {
      const mat = wire.current.material as THREE.MeshBasicMaterial;
      const goal = clamp(mixMinutes / 8, 0, 0.7);
      mat.opacity += (goal - mat.opacity) * (1 - Math.pow(0.001, dt));
      wire.current.scale.copy(ref.current?.scale ?? target).multiplyScalar(1.01);
      wire.current.rotation.y += dt * 0.15;
    }
  });
  const cracked = hydration < 45;
  const doughColor = hydration > 55 ? "#efe0be" : "#f0e3c6";
  return (
    <group>
      {/* mixing bowl, pushed aside once the dough is out on the marble */}
      <group position={[-1.9, 0, -0.7]}>
        <Bowl color="#ffffff" radius={0.6} />
      </group>
      <group position={[0, 0.02, 0]}>
        <mesh ref={ref} position={[0, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.55, 48, 48]} />
          <meshStandardMaterial color={doughColor} roughness={hydration > 55 ? 0.35 : 0.95} />
        </mesh>
        <mesh ref={wire} position={[0, 0.5, 0]}>
          <icosahedronGeometry args={[0.56, 2]} />
          <meshBasicMaterial color="#c8873a" wireframe transparent opacity={0} />
        </mesh>
        {cracked &&
          [0, 1.2, 2.5, 4].map((a, i) => (
            <mesh key={i} position={[Math.cos(a) * 0.42, 0.5 + 0.25, Math.sin(a) * 0.42]} rotation={[0, -a, 0.3]}>
              <boxGeometry args={[0.02, 0.22, 0.14]} />
              <meshStandardMaterial color="#c9b58f" roughness={1} />
            </mesh>
          ))}
        {/* flour dusting on the slab */}
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.95, 48]} />
          <meshStandardMaterial color="#fbf6ea" roughness={1} transparent opacity={0.8} />
        </mesh>
      </group>
      {restMinutes > 0 && (
        // cling film wrapped over the dough while it rests
        <mesh position={[0, 0.52, 0]} scale={[1.08, 0.9, 1.08]}>
          <sphereGeometry args={[0.62, 32, 32]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.22} roughness={0.05} transmission={0.6} />
        </mesh>
      )}
      {restMinutes > 0 && <FridgeGlow />}
    </group>
  );
}

function FridgeGlow() {
  return <pointLight position={[0, 2, 0.5]} color="#bfe2ff" intensity={4} distance={5} />;
}

/* ------------------------------------------------------------------ */
/* Lamination                                                          */
/* ------------------------------------------------------------------ */

export function LaminationScene() {
  const { butterLayers, butterTemp, laminationFault, foldLog } = useLab(useShallow((s) => ({
    butterLayers: s.butterLayers,
    butterTemp: s.butterTemp,
    laminationFault: s.laminationFault,
    foldLog: s.foldLog,
  })));
  const group = useRef<THREE.Group>(null);
  const lastFold = useRef(foldLog.length);
  const pulse = useRef(0);
  useFrame((_, dt) => {
    if (foldLog.length !== lastFold.current) {
      lastFold.current = foldLog.length;
      pulse.current = 1;
    }
    pulse.current = Math.max(0, pulse.current - dt * 2.2);
    if (group.current) {
      const p = Math.sin(pulse.current * Math.PI);
      group.current.scale.set(1 + p * 0.18, 1 - p * 0.22, 1 + p * 0.1);
    }
  });

  const visibleButter = clamp(Math.round(Math.log2(butterLayers + 1) * 1.5), 1, 12);
  const butterColor = useMemo(() => {
    const cold = new THREE.Color("#f3cf5c");
    const warm = new THREE.Color("#f0b12e");
    return cold.lerp(warm, clamp((butterTemp - 6) / 16, 0, 1));
  }, [butterTemp]);

  const W = 2.4;
  const D = 1.5;
  const H = 0.62;

  if (laminationFault === "melted") {
    return (
      <group>
        <RoundedBox args={[W * 1.15, H * 0.55, D * 1.15]} radius={0.12} position={[0, H * 0.28 + 0.05, 0]} castShadow>
          <meshStandardMaterial color="#efd992" roughness={0.25} />
        </RoundedBox>
        <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.7, 48]} />
          <meshStandardMaterial color="#f5d55a" roughness={0.15} transparent opacity={0.6} />
        </mesh>
      </group>
    );
  }
  if (laminationFault === "cracked") {
    return (
      <group>
        <RoundedBox args={[W, H, D]} radius={0.04} position={[0, H / 2 + 0.05, 0]} castShadow>
          <meshStandardMaterial color="#f0e3c6" roughness={0.95} />
        </RoundedBox>
        {[-0.8, -0.3, 0.2, 0.7].map((x, i) => (
          <mesh key={i} position={[x, H / 2 + 0.06, (i % 2 ? 0.2 : -0.25)]} rotation={[0.2 * i, 0.4 * i, 0.1]}>
            <boxGeometry args={[0.35, 0.08, 0.3]} />
            <meshStandardMaterial color="#f5e6a4" roughness={0.6} />
          </mesh>
        ))}
      </group>
    );
  }

  const layerT = H / (visibleButter * 2 + 1);
  return (
    <group ref={group} position={[0, 0.05, 0]}>
      {Array.from({ length: visibleButter * 2 + 1 }).map((_, i) => {
        const isButter = i % 2 === 1;
        return (
          <mesh key={i} position={[0, layerT * (i + 0.5), 0]} castShadow={i === visibleButter * 2} receiveShadow>
            <boxGeometry args={[W, layerT, D]} />
            <meshStandardMaterial color={isButter ? butterColor : "#f5ecd8"} roughness={isButter ? 0.5 : 0.95} />
          </mesh>
        );
      })}
      {/* rolling pin */}
      <group position={[0, H + 0.42, -1.05]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.16, 0.16, 2.6, 32]} />
          <meshStandardMaterial color="#d8b98e" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} />
          <meshStandardMaterial color="#b8956a" roughness={0.8} />
        </mesh>
        <mesh position={[0, -1.5, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} />
          <meshStandardMaterial color="#b8956a" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Bake                                                                */
/* ------------------------------------------------------------------ */

export function BakeScene({ progress }: { progress: number }) {
  const s = useLab(useShallow((st) => ({
    ovenTemp: st.ovenTemp,
    bakeMinutes: st.bakeMinutes,
    docked: st.docked,
    weighted: st.weighted,
    bakeRun: st.bakeRun,
  })));
  const out = bakeOutcome(s);
  const p = s.bakeRun ? progress : 0;
  const rise = 0.08 + out.rise * 0.55 * Math.min(1, p * 1.4);
  const doneness = out.doneness * p;
  const color = useMemo(() => {
    const raw = new THREE.Color("#f3e6c8");
    const golden = new THREE.Color("#d9963f");
    const dark = new THREE.Color("#5a341c");
    if (doneness <= 1) return raw.clone().lerp(golden, clamp(doneness, 0, 1));
    return golden.clone().lerp(dark, clamp((doneness - 1) / 0.6, 0, 1));
  }, [doneness]);
  const uneven = 1 - out.evenness;

  return (
    <group>
      {/* Oven: five panels around an open-front cavity so the sheet is visible */}
      <group position={[0, 0, -0.4]}>
        <OvenShell />
        <pointLight position={[0, 1.7, 0.4]} intensity={s.bakeRun ? 9 : 2.5} distance={4} color="#ffb060" />
        {/* rack */}
        {[-0.9, -0.45, 0, 0.45, 0.9].map((x) => (
          <mesh key={x} position={[x, 0.7, 0]}>
            <boxGeometry args={[0.03, 0.03, 1.8]} />
            <meshStandardMaterial color="#8d8d8d" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {/* pastry sheet */}
        <group position={[0, 0.72, 0]}>
          <mesh position={[0, rise / 2, 0]} castShadow>
            <boxGeometry args={[2.2, rise, 1.3]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
          {uneven > 0 && (
            <mesh position={[0.2 * uneven, rise + uneven * 0.22, -0.1]} scale={[1, uneven, 1]}>
              <sphereGeometry args={[0.55, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={color} roughness={0.85} />
            </mesh>
          )}
          {s.weighted && (
            <mesh position={[0, rise + 0.03, 0]}>
              <boxGeometry args={[2.4, 0.04, 1.5]} />
              <meshStandardMaterial color="#9a9a9a" metalness={0.7} roughness={0.35} />
            </mesh>
          )}
          {s.docked &&
            Array.from({ length: 24 }).map((_, i) => (
              <mesh key={i} position={[-0.9 + (i % 6) * 0.36, rise + 0.001, -0.45 + Math.floor(i / 6) * 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.018, 8]} />
                <meshStandardMaterial color="#7a4a1e" />
              </mesh>
            ))}
          {out.greasy && p > 0.3 && (
            <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.6, 1.6]} />
              <meshStandardMaterial color="#f2c957" roughness={0.1} transparent opacity={0.6} />
            </mesh>
          )}
        </group>
        {/* glass door, hinged at the bottom and swung open */}
        <group position={[0, 0.16, 1.05]} rotation={[-Math.PI / 2 + 0.12, 0, 0]}>
          <mesh position={[0, 0.85, 0]}>
            <boxGeometry args={[3.3, 1.7, 0.05]} />
            <meshPhysicalMaterial color="#9fbfd2" transmission={0.75} roughness={0.08} thickness={0.2} transparent opacity={0.55} />
          </mesh>
          <mesh position={[0, 1.62, 0]}>
            <boxGeometry args={[3.3, 0.16, 0.08]} />
            <meshStandardMaterial color="#3e3b39" roughness={0.6} metalness={0.3} />
          </mesh>
        </group>
        {s.bakeRun && p > 0.1 && p < 1 && <Steam strength={out.rise} />}
      </group>
    </group>
  );
}

function OvenShell() {
  const wall = <meshStandardMaterial color="#3e3b39" roughness={0.6} metalness={0.3} />;
  const inner = <meshStandardMaterial color="#1f1c1a" roughness={0.9} />;
  const W = 3.5;
  const H = 2.0;
  const D = 2.2;
  const t = 0.12;
  return (
    <group position={[0, 0, 0]}>
      {/* back */}
      <mesh position={[0, H / 2 + 0.16, -D / 2]} receiveShadow>
        <boxGeometry args={[W, H, t]} />
        {inner}
      </mesh>
      {/* floor */}
      <mesh position={[0, 0.16, 0]} receiveShadow>
        <boxGeometry args={[W, t, D]} />
        {inner}
      </mesh>
      {/* ceiling */}
      <mesh position={[0, H + 0.16, 0]}>
        <boxGeometry args={[W, t, D]} />
        {wall}
      </mesh>
      {/* sides */}
      <mesh position={[-W / 2, H / 2 + 0.16, 0]} castShadow>
        <boxGeometry args={[t, H + t, D]} />
        {wall}
      </mesh>
      <mesh position={[W / 2, H / 2 + 0.16, 0]} castShadow>
        <boxGeometry args={[t, H + t, D]} />
        {wall}
      </mesh>
      {/* heating element glow at the top */}
      <mesh position={[0, H + 0.06, -0.3]}>
        <boxGeometry args={[W - 0.6, 0.04, 0.08]} />
        <meshStandardMaterial color="#ff8a3d" emissive="#ff6a1a" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

function Steam({ strength }: { strength: number }) {
  const ref = useRef<THREE.Points>(null);
  const count = 120;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    let seed = 42;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rnd() - 0.5) * 2;
      arr[i * 3 + 1] = rnd() * 1.2;
      arr[i * 3 + 2] = (rnd() - 0.5) * 1.1;
    }
    return arr;
  }, []);
  useFrame((_, dt) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) + dt * (0.35 + strength * 0.5);
      if (y > 1.4) y = 0;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });
  return (
    <points ref={ref} position={[0, 0.85, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.05} transparent opacity={0.45} depthWrite={false} />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Cream                                                               */
/* ------------------------------------------------------------------ */

export function CreamScene() {
  const s = useLab(useShallow((st) => ({
    phase: st.creamPhase,
    temp: st.creamTemp,
    scrambled: st.scrambled,
    scorched: st.scorched,
    boil: st.boilSeconds,
  })));
  const whisk = useRef<THREE.Group>(null);
  const cooking = s.phase === "cook";
  useFrame(({ clock }, dt) => {
    if (!whisk.current) return;
    if (cooking) {
      whisk.current.rotation.y += dt * 9;
      whisk.current.position.x = Math.sin(clock.elapsedTime * 5) * 0.12;
    }
  });
  const thickness = clamp((s.temp - 80) / 20, 0, 1); // starts to thicken past 80
  const liquidColor = useMemo(() => {
    const thin = new THREE.Color("#fff3c4");
    const thick = new THREE.Color("#ffe08a");
    return thin.lerp(thick, thickness);
  }, [thickness]);
  const level = s.phase === "prep" ? 0.02 : 0.32;
  const tempColumn = remap(s.temp, 0, 110, 0, 0.9);

  return (
    <group>
      <Burner on={cooking} />
      <group position={[0, 0.03, 0]}>
        <Pot>
          <mesh position={[0, level / 2 + 0.02, 0]}>
            <cylinderGeometry args={[0.58, 0.58, level, 48]} />
            <meshStandardMaterial color={liquidColor} roughness={0.35 - thickness * 0.2} />
          </mesh>
          {s.scrambled &&
            Array.from({ length: 22 }).map((_, i) => (
              <mesh key={i} position={[Math.cos(i * 1.7) * (0.15 + (i % 4) * 0.1), level + 0.03, Math.sin(i * 2.3) * (0.15 + (i % 3) * 0.12)]}>
                <sphereGeometry args={[0.03 + (i % 3) * 0.012, 8, 8]} />
                <meshStandardMaterial color="#f9f0d0" roughness={1} />
              </mesh>
            ))}
          {s.scorched && (
            <mesh position={[0, 0.03, 0]}>
              <cylinderGeometry args={[0.58, 0.58, 0.02, 48]} />
              <meshStandardMaterial color="#4a2a12" roughness={1} />
            </mesh>
          )}
          {s.phase !== "prep" && (
            <group ref={whisk} position={[0, level + 0.05, 0]} rotation={[0.35, 0, 0]}>
              <mesh position={[0, 0.65, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 0.7, 12]} />
                <meshStandardMaterial color="#c9cdd2" metalness={0.8} roughness={0.3} />
              </mesh>
              {[0, 1, 2, 3].map((k) => (
                <mesh key={k} position={[0, 0.16, 0]} rotation={[0, (k * Math.PI) / 4, 0]}>
                  <torusGeometry args={[0.13, 0.008, 8, 24, Math.PI]} />
                  <meshStandardMaterial color="#c9cdd2" metalness={0.8} roughness={0.3} />
                </mesh>
              ))}
            </group>
          )}
        </Pot>
      </group>
      {/* thermometer */}
      <group position={[1.3, 0.1, 0.4]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1, 16]} />
          <meshPhysicalMaterial color="#ffffff" transmission={0.5} roughness={0.1} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, 0.05 + tempColumn / 2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, tempColumn, 12]} />
          <meshStandardMaterial color="#c95f5f" emissive="#c95f5f" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color="#c95f5f" />
        </mesh>
      </group>
      {/* bowl of yolks on the side during prep/temper */}
      {s.phase !== "done" && (
        <group position={[-1.5, 0.05, 0.4]}>
          <Bowl color="#ffffff" radius={0.42}>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.16, 32]} />
              <meshStandardMaterial color="#ffd86b" roughness={0.3} />
            </mesh>
          </Bowl>
        </group>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Assembly / Rest / Serve                                             */
/* ------------------------------------------------------------------ */

export function AssemblyScene() {
  const { layers, creamThickness, topping } = useLab(useShallow((s) => ({
    layers: s.layers,
    creamThickness: s.creamThickness,
    topping: s.topping,
  })));
  return (
    <group>
      <mesh position={[0, 0.07, 0]} receiveShadow>
        <boxGeometry args={[2.8, 0.04, 1.9]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <CakeModel layers={layers} creamThickness={creamThickness} topping={topping} position={[0, 0.09, 0]} animateIn />
      {layers.length === 0 && (
        <Float speed={2.5} floatIntensity={0.3} rotationIntensity={0}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[2.2, 0.07, 1.3]} />
            <meshStandardMaterial color="#e9b866" transparent opacity={0.35} roughness={0.9} />
          </mesh>
        </Float>
      )}
    </group>
  );
}

export function RestScene() {
  const { layers, creamThickness, topping, restHours, restLocation } = useLab(useShallow((s) => ({
    layers: s.layers,
    creamThickness: s.creamThickness,
    topping: s.topping,
    restHours: s.restHours,
    restLocation: s.restLocation,
  })));
  const soak = clamp(restHours / 12, 0, 1);
  return (
    <group>
      {restLocation === "fridge" && (
        <group>
          <mesh position={[0, 1.2, -1.2]}>
            <boxGeometry args={[4.2, 2.6, 2.6]} />
            <meshStandardMaterial color="#f4f6f8" roughness={0.4} side={THREE.BackSide} />
          </mesh>
          <pointLight position={[0, 2.2, -0.5]} intensity={6} color="#dff0ff" distance={5} />
          {[0.9, 1.8].map((y) => (
            <mesh key={y} position={[0, y, -1.2]}>
              <boxGeometry args={[4, 0.03, 2.2]} />
              <meshPhysicalMaterial color="#dfe8ee" transmission={0.5} roughness={0.1} transparent opacity={0.6} />
            </mesh>
          ))}
        </group>
      )}
      <mesh position={[0, 0.07, 0]} receiveShadow>
        <boxGeometry args={[2.8, 0.04, 1.9]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      <CakeModel layers={withFallback(layers)} creamThickness={creamThickness} topping={topping} position={[0, 0.09, 0]} soak={soak} />
      {/* cling film */}
      <mesh position={[0, 0.1 + layers.length * 0.12 + 0.2, 0]}>
        <boxGeometry args={[2.5, 0.01, 1.6]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.18} roughness={0.05} transmission={0.7} />
      </mesh>
    </group>
  );
}

export function ServeScene() {
  const { layers, creamThickness, topping, restHours, finish, served } = useLab(useShallow((s) => ({
    layers: s.layers,
    creamThickness: s.creamThickness,
    topping: s.topping,
    restHours: s.restHours,
    finish: s.finish,
    served: s.served,
  })));
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current && served) ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.4) * 0.35;
  });
  const top = finish === "sugar" ? "sugar" : finish === "fondant" ? "fondant" : finish === "crumbs" ? "crumbs" : topping;
  return (
    <group ref={ref}>
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.9, 1.9, 0.06, 64]} />
        <meshStandardMaterial color="#ffffff" roughness={0.25} />
      </mesh>
      <CakeModel
        layers={withFallback(layers)}
        creamThickness={creamThickness}
        topping={top}
        position={[-0.3, 0.11, 0]}
        soak={clamp(restHours / 12, 0, 1)}
        sliced={served}
      />
      {/* knife */}
      <group position={[0.2, 0.14, 1.25]} rotation={[0, -0.2, 0]}>
        <mesh>
          <boxGeometry args={[1.6, 0.01, 0.12]} />
          <meshStandardMaterial color="#d9dde2" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[1.05, 0.02, 0]}>
          <boxGeometry args={[0.5, 0.06, 0.1]} />
          <meshStandardMaterial color="#2a2420" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}
