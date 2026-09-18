"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useLab } from "@/lib/store";
import { STAGES } from "@/lib/curriculum";
import { Bench, Lights } from "./Bench";
import {
  AssemblyScene,
  BakeScene,
  CreamScene,
  DoughScene,
  LaminationScene,
  PantryScene,
  RestScene,
  ServeScene,
  WelcomeScene,
} from "./stages";

const CAMERA: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
  welcome: { position: [3.2, 2.4, 4.2], target: [0, 0.6, 0] },
  pantry: { position: [0, 3.6, 4.6], target: [0, 0.2, 0] },
  detrempe: { position: [1.8, 1.9, 3.0], target: [0, 0.4, 0] },
  lamination: { position: [2.6, 2.2, 3.6], target: [0, 0.3, 0] },
  bake: { position: [0.6, 2.0, 5.0], target: [0, 0.9, -0.4] },
  cream: { position: [2.4, 2.6, 3.4], target: [0, 0.5, 0] },
  assembly: { position: [2.8, 2.2, 3.4], target: [0, 0.6, 0] },
  rest: { position: [2.6, 2.0, 3.6], target: [0, 0.7, 0] },
  serve: { position: [3.0, 2.2, 3.8], target: [0, 0.6, 0] },
};

export function LabCanvas({ bakeProgress }: { bakeProgress: number }) {
  const stage = useLab((s) => STAGES[s.stageIndex]);
  const cam = CAMERA[stage.id];
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: cam.position, fov: 38, near: 0.1, far: 60 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      className="!h-full !w-full"
    >
      <color attach="background" args={["#f7f1e6"]} />
      <fog attach="fog" args={["#f7f1e6", 9, 18]} />
      <Suspense fallback={null}>
        <Lights />
        <Bench />
        <group key={stage.id} position={[0, 0.06, 0]}>
          <StageSwitch id={stage.id} bakeProgress={bakeProgress} />
        </group>
      </Suspense>
      <OrbitControls
        key={stage.id}
        target={cam.target}
        enablePan={false}
        minDistance={2.2}
        maxDistance={9}
        maxPolarAngle={Math.PI / 2.05}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}

function StageSwitch({ id, bakeProgress }: { id: string; bakeProgress: number }) {
  switch (id) {
    case "welcome":
      return <WelcomeScene />;
    case "pantry":
      return <PantryScene />;
    case "detrempe":
      return <DoughScene />;
    case "lamination":
      return <LaminationScene />;
    case "bake":
      return <BakeScene progress={bakeProgress} />;
    case "cream":
      return <CreamScene />;
    case "assembly":
      return <AssemblyScene />;
    case "rest":
      return <RestScene />;
    case "serve":
      return <ServeScene />;
    default:
      return null;
  }
}
