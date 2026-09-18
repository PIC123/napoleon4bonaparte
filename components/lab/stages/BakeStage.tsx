"use client";

import { useShallow } from "zustand/react/shallow";
import { StagePanel } from "../StagePanel";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useLab } from "@/lib/store";
import { STAGE_BY_ID } from "@/lib/curriculum";
import { evaluateBake } from "@/lib/evaluate";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  bakeProgress: number;
  startBake: () => void;
}

function Toggle({ label, desc, value, disabled, onChange }: { label: string; desc: string; value: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      disabled={disabled}
      className={cn(
        "rounded-xl border px-3 py-2 text-left transition-all disabled:opacity-60",
        value ? "border-caramel bg-butter-2/70 shadow-soft" : "border-line bg-paper hover:border-caramel/40",
      )}
      aria-pressed={value}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className={cn("h-4 w-7 rounded-full p-0.5 transition", value ? "bg-caramel" : "bg-line")}>
          <span className={cn("block size-3 rounded-full bg-white transition", value && "translate-x-3")} />
        </span>
      </div>
      <div className="text-[11px] leading-snug text-ink-3">{desc}</div>
    </button>
  );
}

export function BakeStage({ bakeProgress, startBake }: Props) {
  const s = useLab(
    useShallow((st) => ({
      ovenTemp: st.ovenTemp,
      bakeMinutes: st.bakeMinutes,
      docked: st.docked,
      weighted: st.weighted,
      bakeRun: st.bakeRun,
      set: st.set,
      patch: st.patch,
      setFeedback: st.setFeedback,
      completeStage: st.completeStage,
    })),
  );
  const stage = STAGE_BY_ID.bake;
  const baking = s.bakeRun && bakeProgress < 1;

  const check = () => {
    const r = evaluateBake(s);
    s.setFeedback("bake", r);
    if (r.ok) s.completeStage("bake");
  };

  return (
    <StagePanel
      stage={stage}
      onCheck={check}
      checkLabel="Check bake"
      onReset={() => s.patch({ ovenTemp: 170, bakeMinutes: 15, docked: false, weighted: false, bakeRun: false })}
    >
      <div className="grid grid-cols-2 gap-2">
        <Toggle label="Dock the sheet" desc="Prick it all over with a fork." value={s.docked} disabled={baking} onChange={(v) => s.set("docked", v)} />
        <Toggle label="Weighted tray on top" desc="A second sheet pan resting on the pastry." value={s.weighted} disabled={baking} onChange={(v) => s.set("weighted", v)} />
      </div>
      <Slider
        label="Oven temperature"
        value={s.ovenTemp}
        min={140}
        max={260}
        step={5}
        format={(v) => `${v} °C · ${Math.round((v * 9) / 5 + 32)} °F`}
        onChange={(v) => s.set("ovenTemp", v)}
        disabled={baking}
      />
      <Slider
        label="Bake time"
        value={s.bakeMinutes}
        min={5}
        max={40}
        format={(v) => `${v} min`}
        onChange={(v) => s.set("bakeMinutes", v)}
        disabled={baking}
      />
      <div className="flex items-center gap-3">
        <Button onClick={startBake} disabled={baking}>
          <Flame /> {s.bakeRun ? "Bake again" : "Bake"}
        </Button>
        <div className="flex-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-cream-2">
            <div className="h-full rounded-full bg-caramel transition-[width] duration-100" style={{ width: `${(s.bakeRun ? bakeProgress : 0) * 100}%` }} />
          </div>
          <div className="mt-1 text-[11px] text-ink-3">
            {baking ? `Baking… ${Math.round(bakeProgress * s.bakeMinutes)} / ${s.bakeMinutes} min` : s.bakeRun ? "Out of the oven. Look at the colour and the height." : "Ready when you are."}
          </div>
        </div>
      </div>
    </StagePanel>
  );
}
