"use client";

import { useShallow } from "zustand/react/shallow";
import { StagePanel } from "../StagePanel";
import { Button } from "@/components/ui/button";
import { Meter } from "@/components/ui/meter";
import { Callout } from "@/components/ui/callout";
import { useLab } from "@/lib/store";
import { STAGE_BY_ID } from "@/lib/curriculum";
import { evaluateLamination } from "@/lib/evaluate";
import { Layers3, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";

export function LaminationStage() {
  const s = useLab(
    useShallow((st) => ({
      butterLayers: st.butterLayers,
      butterTemp: st.butterTemp,
      foldLog: st.foldLog,
      laminationFault: st.laminationFault,
      chills: st.chills,
      fold: st.fold,
      chill: st.chill,
      reset: st.resetLamination,
      setFeedback: st.setFeedback,
      completeStage: st.completeStage,
    })),
  );
  const stage = STAGE_BY_ID.lamination;
  const t = s.butterTemp;
  const tempTone = t < 8 ? "sky" : t <= 16 ? "sage" : t <= 20 ? "caramel" : "rose";
  const tempLabel = t < 8 ? "Brittle" : t <= 16 ? "Plastic (ideal)" : t <= 20 ? "Softening" : "Melting";

  const check = () => {
    const r = evaluateLamination(s);
    s.setFeedback("lamination", r);
    if (r.ok) s.completeStage("lamination");
  };

  return (
    <StagePanel stage={stage} onCheck={check} checkLabel="Check lamination" onReset={s.reset}>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-paper px-3 py-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">Butter layers</div>
          <div className="font-display text-3xl font-semibold text-ink tabular-nums">
            {s.butterLayers.toLocaleString()}
          </div>
          <div className="text-xs text-ink-3">{s.foldLog.length} folds · {s.chills} chills</div>
        </div>
        <div className="rounded-xl border border-line bg-paper px-3 py-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">Butter temperature</div>
          <div className={cn("font-display text-3xl font-semibold tabular-nums", tempTone === "rose" ? "text-rose" : tempTone === "sky" ? "text-sky" : "text-ink")}>
            {t.toFixed(0)} °C
          </div>
          <div className="text-xs text-ink-3">{tempLabel}</div>
        </div>
      </div>
      <Meter label="Plasticity window" value={(t - 2) / 24} display={`${t} °C`} tone={tempTone} />

      {s.laminationFault ? (
        <Callout tone="warn" title={s.laminationFault === "melted" ? "The butter melted in" : "The butter cracked"}>
          {s.laminationFault === "melted"
            ? "The layers have merged. Reset and think about when to chill."
            : "Rolling brittle butter shatters it. Reset and let it come up a little before folding."}
        </Callout>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" onClick={() => s.fold("letter")}>
            <Layers3 /> Letter fold ×3
          </Button>
          <Button variant="secondary" onClick={() => s.fold("book")}>
            <Layers3 /> Book fold ×4
          </Button>
          <Button variant="soft" onClick={s.chill}>
            <Snowflake /> Chill 15 min
          </Button>
        </div>
      )}
      <p className="text-xs text-ink-3">
        Each roll-and-fold warms the butter a few degrees at room temperature. Chilling brings it back down.
      </p>
    </StagePanel>
  );
}
