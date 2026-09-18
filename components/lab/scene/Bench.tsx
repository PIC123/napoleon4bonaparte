"use client";

import { ContactShadows, RoundedBox } from "@react-three/drei";

/** The shared kitchen bench every stage sits on. */
export function Bench() {
  return (
    <group>
      {/* Countertop */}
      <RoundedBox
        args={[9, 0.35, 5]}
        radius={0.08}
        smoothness={4}
        position={[0, -0.18, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#d9c3a3" roughness={0.85} />
      </RoundedBox>
      {/* Marble slab inset — a pastry bench is cold on purpose */}
      <RoundedBox
        args={[5.4, 0.06, 3.2]}
        radius={0.03}
        smoothness={4}
        position={[0, 0.02, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#f1ece4" roughness={0.35} metalness={0.05} />
      </RoundedBox>
      {/* Back wall tiles */}
      <mesh position={[0, 1.6, -2.55]} receiveShadow>
        <planeGeometry args={[9, 4]} />
        <meshStandardMaterial color="#efe6d6" roughness={1} />
      </mesh>
      <ContactShadows position={[0, 0.06, 0]} opacity={0.35} scale={9} blur={2.4} far={2} />
    </group>
  );
}

export function Lights() {
  return (
    <>
      <hemisphereLight args={["#fff7e8", "#c9b79a", 0.75]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-4, 3, -2]} intensity={0.5} color="#ffe9c9" />
      <pointLight position={[0, 2.5, 2.5]} intensity={6} distance={9} color="#fff2dc" />
    </>
  );
}
