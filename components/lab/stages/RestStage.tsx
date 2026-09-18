"use client";

import { useShallow } from "zustand/react/shallow";
import { StagePanel } from "../StagePanel";
import { Slider } from "@/components/ui/slider";
import { Segmented } from "@/components/ui/segmented";
import { useLab } from "@/lib/store";
import { STAGE_BY_ID, STYLE_INFO } from "@/lib/curriculum";
import { evaluateRest } from "@/lib/evaluate";
import { clamp } from "@/lib/utils";

export function RestStage() {
  const s = useLab(
    useShallow((st) => ({
      restHours: st.restHours,
      restLocation: st.restLocation,
      style: st.style,
      set: st.set,
      patch: st.patch,
      setFeedback: st.setFeedback,
      completeStage: st.completeStage,
    })),
  );
  const stage = STAGE_BY_ID.rest;
  const check = () => {
    const r = evaluateRest(s, s.style);
    s.setFeedback("rest", r);
    if (r.ok) s.completeStage("rest");
  };

  // Simple model: crispness decays, cohesion rises, both saturate ~12 h.
  const hours = s.restHours;
  const crisp = Math.exp(-hours / 5);
  const cohesion = 1 - Math.exp(-hours / 6);
  const W = 300;
  const H = 90;
  const path = (fn: (h: number) => number) =>
    Array.from({ length: 49 }, (_, i) => {
      const h = (i / 48) * 36;
      return `${i === 0 ? "M" : "L"}${(h / 36) * W},${H - fn(h) * (H - 8) - 4}`;
    }).join(" ");
  const cx = clamp(hours / 36, 0, 1) * W;

  return (
    <StagePanel stage={stage} onCheck={check} checkLabel="Check rest" onReset={() => s.patch({ restHours: 0, restLocation: "fridge" })}>
      <div className="rounded-xl border border-line bg-paper p-3">
        <div className="mb-1 flex justify-between text-[11px] text-ink-3">
          <span><span className="inline-block size-2 rounded-full bg-caramel" /> Crispness</span>
          <span><span className="inline-block size-2 rounded-full bg-sky" /> Cohesion (sliceability)</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-24 w-full" role="img" aria-label="Crispness falls and cohesion rises as the cake rests">
          <path d={path((h) => Math.exp(-h / 5))} fill="none" stroke="var(--caramel)" strokeWidth={2} />
          <path d={path((h) => 1 - Math.exp(-h / 6))} fill="none" stroke="var(--sky)" strokeWidth={2} />
          <line x1={cx} x2={cx} y1={0} y2={H} stroke="var(--ink-3)" strokeDasharray="3 3" />
        </svg>
        <div className="flex justify-between font-mono text-[10px] text-ink-3"><span>0 h</span><span>12 h</span><span>24 h</span><span>36 h</span></div>
      </div>
      <Slider
        label="Rest time"
        value={hours}
        min={0}
        max={36}
        format={(v) => (v === 0 ? "serve now" : `${v} h`)}
        onChange={(v) => s.set("restHours", v)}
        hint={`Right now: crispness ${Math.round(crisp * 100)}%, cohesion ${Math.round(cohesion * 100)}%. Your style: ${s.style ? STYLE_INFO[s.style].rest : "not chosen"}.`}
      />
      <Segmented<"fridge" | "counter">
        label="Where does it rest?"
        value={s.restLocation}
        onChange={(v) => s.set("restLocation", v)}
        options={[
          { value: "fridge", label: "Fridge", description: "4 °C, covered" },
          { value: "counter", label: "Counter", description: "Room temperature" },
        ]}
      />
    </StagePanel>
  );
}
