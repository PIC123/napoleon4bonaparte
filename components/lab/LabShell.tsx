"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";
import { Check, ChevronLeft, ChevronRight, Home, Maximize2, Minimize2, MousePointer2, RotateCcw } from "lucide-react";
import { useLab } from "@/lib/store";
import { STAGES } from "@/lib/curriculum";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TutorPanel } from "@/components/tutor/TutorPanel";
import { WelcomeStage } from "./stages/WelcomeStage";
import { PantryStage } from "./stages/PantryStage";
import { DetrempeStage } from "./stages/DetrempeStage";
import { LaminationStage } from "./stages/LaminationStage";
import { BakeStage } from "./stages/BakeStage";
import { CreamStage } from "./stages/CreamStage";
import { AssemblyStage } from "./stages/AssemblyStage";
import { RestStage } from "./stages/RestStage";
import { ServeStage } from "./stages/ServeStage";

// WebGL only exists in the browser; never render the canvas on the server.
const LabCanvas = dynamic(() => import("./scene/LabCanvas").then((m) => m.LabCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#f7f1e6] text-sm text-ink-3">Warming up the bench…</div>
  ),
});

/** True once the persisted store has been read from localStorage (client only). */
function useHydrated() {
  return useSyncExternalStore(
    (cb) => useLab.persist.onFinishHydration(cb),
    () => useLab.persist.hasHydrated(),
    () => false,
  );
}

export function LabShell() {
  const { stageIndex, completed, goTo, prev, next, resetLab, startedAt, set } = useLab(
    useShallow((s) => ({
      stageIndex: s.stageIndex,
      completed: s.completed,
      goTo: s.goTo,
      prev: s.prev,
      next: s.next,
      resetLab: s.resetLab,
      startedAt: s.startedAt,
      set: s.set,
    })),
  );
  const stage = STAGES[stageIndex];
  const hydrated = useHydrated();
  const [panelTall, setPanelTall] = useState(false);

  useEffect(() => {
    if (hydrated && !startedAt) set("startedAt", Date.now());
  }, [hydrated, startedAt, set]);

  // Bake animation lives here because both the canvas and the stage panel read it.
  const [bakeProgress, setBakeProgress] = useState(1);
  const raf = useRef<number | null>(null);
  const startBake = useCallback(() => {
    useLab.getState().patch({ bakeRun: true });
    useLab.getState().clearFeedback("bake");
    const t0 = performance.now();
    const duration = 4200;
    if (raf.current) cancelAnimationFrame(raf.current);
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / duration);
      setBakeProgress(k);
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    setBakeProgress(0);
    raf.current = requestAnimationFrame(tick);
  }, []);
  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  const progress = completed.length / STAGES.length;

  const panel = (() => {
    switch (stage.id) {
      case "welcome": return <WelcomeStage />;
      case "pantry": return <PantryStage />;
      case "detrempe": return <DetrempeStage />;
      case "lamination": return <LaminationStage />;
      case "bake": return <BakeStage bakeProgress={bakeProgress} startBake={startBake} />;
      case "cream": return <CreamStage />;
      case "assembly": return <AssemblyStage />;
      case "rest": return <RestStage />;
      case "serve": return <ServeStage />;
    }
  })();

  if (!hydrated) {
    return <div className="flex h-dvh items-center justify-center text-sm text-ink-3">Loading your lab…</div>;
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-cream">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-line bg-paper/80 px-4 backdrop-blur">
        <Link href="/" className="flex items-center gap-2 text-ink" title="Home">
          <span className="flex size-8 items-center justify-center rounded-xl bg-butter text-base">🥐</span>
          <span className="font-display text-lg font-semibold">Napoleon Lab</span>
        </Link>
        <div className="hidden items-center gap-2 text-xs text-ink-3 md:flex">
          <MousePointer2 className="size-3.5" /> Drag to orbit · scroll to zoom
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <div className="w-40">
            <div className="mb-1 flex justify-between text-[11px] text-ink-3">
              <span>Progress</span>
              <span className="font-mono">{completed.length}/{STAGES.length}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-2">
              <div className="h-full rounded-full bg-sage transition-all duration-500" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm("Start over? This clears all your progress in the lab.")) resetLab();
            }}
          >
            <RotateCcw /> Start over
          </Button>
          <Link href="/" className="text-ink-3 hover:text-ink" aria-label="Home">
            <Home className="size-4" />
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Stage rail */}
        <nav className="flex w-56 shrink-0 flex-col border-r border-line bg-paper/60 py-3" aria-label="Stages">
          {STAGES.map((s) => {
            const done = completed.includes(s.id);
            const active = s.index === stageIndex;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(s.index)}
                className={cn(
                  "group mx-2 flex items-center gap-3 rounded-xl px-3 py-2 text-left transition",
                  active ? "bg-butter-2/70 text-ink" : "text-ink-2 hover:bg-cream-2",
                )}
                aria-current={active ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-semibold",
                    done ? "border-sage bg-sage text-white" : active ? "border-caramel text-caramel-2" : "border-line text-ink-3",
                  )}
                >
                  {done ? <Check className="size-3.5" /> : s.index}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{s.short}</span>
                  <span className="block truncate text-[11px] text-ink-3">{s.eyebrow.replace(/^Stage \d · /, "")}</span>
                </span>
              </button>
            );
          })}
          <div className="mt-auto flex items-center justify-between px-4 pt-3">
            <Button variant="ghost" size="sm" onClick={prev} disabled={stageIndex === 0} aria-label="Previous stage">
              <ChevronLeft /> Prev
            </Button>
            <Button variant="ghost" size="sm" onClick={next} disabled={stageIndex === STAGES.length - 1} aria-label="Next stage">
              Next <ChevronRight />
            </Button>
          </div>
        </nav>

        {/* Bench + stage panel */}
        <main className="flex min-w-0 flex-1 flex-col">
          <div className={cn("relative min-h-0 transition-[flex-basis] duration-300", panelTall ? "basis-[34%]" : "basis-[54%]")}>
            <LabCanvas bakeProgress={bakeProgress} />
            <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-line bg-paper/85 px-3 py-1 text-xs font-medium text-ink-2 shadow-soft backdrop-blur">
              {stage.eyebrow} · {stage.short}
            </div>
            <button
              type="button"
              onClick={() => setPanelTall((v) => !v)}
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full border border-line bg-paper/85 text-ink-2 shadow-soft backdrop-blur hover:text-ink"
              aria-label={panelTall ? "Expand the 3D bench" : "Expand the task panel"}
              title={panelTall ? "Expand the 3D bench" : "Expand the task panel"}
            >
              {panelTall ? <Maximize2 className="size-4" /> : <Minimize2 className="size-4" />}
            </button>
          </div>
          <section className="min-h-0 flex-1 border-t border-line bg-paper" aria-label="Stage tasks">
            {panel}
          </section>
        </main>

        {/* Tutor */}
        <div className="w-[380px] shrink-0 border-l border-line">
          <TutorPanel />
        </div>
      </div>
    </div>
  );
}
