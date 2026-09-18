"use client";

import { useShallow } from "zustand/react/shallow";
import { StagePanel } from "../StagePanel";
import { Slider } from "@/components/ui/slider";
import { Meter } from "@/components/ui/meter";
import { Button } from "@/components/ui/button";
import { useLab } from "@/lib/store";
import { STAGE_BY_ID } from "@/lib/curriculum";
import { evaluateDetrempe } from "@/lib/evaluate";
import { clamp } from "@/lib/utils";
import { Snowflake } from "lucide-react";

export function DetrempeStage() {
  const s = useLab(
    useShallow((st) => ({
      hydration: st.hydration,
      mixMinutes: st.mixMinutes,
      restMinutes: st.restMinutes,
      set: st.set,
      patch: st.patch,
      setFeedback: st.setFeedback,
      completeStage: st.completeStage,
    })),
  );
  const stage = STAGE_BY_ID.detrempe;
  const gluten = clamp(s.mixMinutes / 8, 0, 1);
  const relaxed = clamp(s.restMinutes / 60, 0, 1);
  const elasticity = clamp(gluten * (1 - relaxed * 0.8), 0, 1);

  const check = () => {
    const r = evaluateDetrempe(s);
    s.setFeedback("detrempe", r);
    if (r.ok) s.completeStage("detrempe");
  };

  return (
    <StagePanel
      stage={stage}
      onCheck={check}
      checkLabel="Check dough"
      onReset={() => s.patch({ hydration: 60, mixMinutes: 5, restMinutes: 0 })}
    >
      <Slider
        label="Hydration"
        value={s.hydration}
        min={35}
        max={70}
        unit="%"
        hint="Water as a percentage of flour weight. For reference, a sandwich bread is ~65%."
        onChange={(v) => s.set("hydration", v)}
      />
      <Slider
        label="Mixing time"
        value={s.mixMinutes}
        min={0}
        max={8}
        step={0.5}
        format={(v) => `${v} min`}
        hint="Watch the gluten meter and the wireframe network forming in the bowl."
        onChange={(v) => s.set("mixMinutes", v)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Meter label="Gluten developed" value={gluten} tone="caramel" />
        <Meter label="Elasticity (springs back)" value={elasticity} tone={elasticity > 0.45 ? "rose" : "sage"} />
      </div>
      <div className="flex items-center justify-between rounded-xl border border-line bg-paper px-3 py-2">
        <div>
          <div className="text-sm font-medium text-ink">Rest in the fridge</div>
          <div className="font-mono text-xs text-ink-3">{s.restMinutes} min rested</div>
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant="secondary" onClick={() => s.set("restMinutes", s.restMinutes + 15)}>
            <Snowflake /> +15 min
          </Button>
          <Button size="sm" variant="ghost" onClick={() => s.set("restMinutes", 0)}>
            Clear
          </Button>
        </div>
      </div>
    </StagePanel>
  );
}
