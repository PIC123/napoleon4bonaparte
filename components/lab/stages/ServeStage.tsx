"use client";

import { useShallow } from "zustand/react/shallow";
import { StagePanel } from "../StagePanel";
import { Segmented } from "@/components/ui/segmented";
import { Callout } from "@/components/ui/callout";
import { useLab } from "@/lib/store";
import { STAGE_BY_ID, STAGES, STYLE_INFO } from "@/lib/curriculum";
import { evaluateServe } from "@/lib/evaluate";
import { Button } from "@/components/ui/button";
import { PartyPopper, RotateCcw } from "lucide-react";

export function ServeStage() {
  const s = useLab(
    useShallow((st) => ({
      knife: st.knife,
      motion: st.motion,
      portion: st.portion,
      finish: st.finish,
      served: st.served,
      style: st.style,
      completed: st.completed,
      feedback: st.feedback,
      butterLayers: st.butterLayers,
      layers: st.layers,
      restHours: st.restHours,
      set: st.set,
      patch: st.patch,
      setFeedback: st.setFeedback,
      completeStage: st.completeStage,
      resetLab: st.resetLab,
    })),
  );
  const stage = STAGE_BY_ID.serve;
  const check = () => {
    const r = evaluateServe(s);
    s.setFeedback("serve", r);
    if (r.ok) {
      s.completeStage("serve");
      s.set("served", true);
    }
  };
  const totalAttempts = Object.values(s.feedback).reduce((a, f) => a + (f?.attempts ?? 0), 0);
  const done = s.completed.length;

  return (
    <StagePanel stage={stage} onCheck={check} checkLabel="Serve" onReset={() => s.patch({ knife: null, motion: null, portion: null, finish: null, served: false })}>
      <Segmented<"serrated" | "chef">
        label="Knife"
        value={s.knife}
        onChange={(v) => s.set("knife", v)}
        options={[
          { value: "chef", label: "Chef's knife", description: "Straight, heavy edge" },
          { value: "serrated", label: "Serrated knife", description: "Toothed bread knife" },
        ]}
      />
      <Segmented<"saw" | "press">
        label="Cutting motion"
        value={s.motion}
        onChange={(v) => s.set("motion", v)}
        options={[
          { value: "press", label: "Press down", description: "One clean push" },
          { value: "saw", label: "Gentle sawing", description: "Back and forth, little pressure" },
        ]}
      />
      <Segmented<"small" | "classic" | "large">
        label="Portion"
        value={s.portion}
        columns={3}
        onChange={(v) => s.set("portion", v)}
        options={[
          { value: "small", label: "Petit" },
          { value: "classic", label: "Classic 4 × 8 cm" },
          { value: "large", label: "Generous" },
        ]}
      />
      <Segmented<"sugar" | "crumbs" | "fondant">
        label="Finishing touch"
        value={s.finish}
        columns={3}
        onChange={(v) => s.set("finish", v)}
        options={[
          { value: "sugar", label: "Icing sugar" },
          { value: "crumbs", label: "Crumb coat" },
          { value: "fondant", label: "Fondant stripes" },
        ]}
      />

      {s.served && (
        <Callout tone="success" title="Lab complete">
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <PartyPopper className="size-5 text-caramel" /> You made a {s.style ? STYLE_INFO[s.style].name : "Napoleon"}.
          </div>
          <ul className="mt-2 space-y-1 text-sm">
            <li>Stages completed: {done} of {STAGES.length}</li>
            <li>Butter layers laminated: {s.butterLayers.toLocaleString()}</li>
            <li>Layers assembled: {s.layers.length}</li>
            <li>Rested: {s.restHours} h</li>
            <li>Checks used across the lab: {totalAttempts}</li>
          </ul>
          <p className="mt-2 text-sm">Ask Pip for a debrief: what would you change next time, and why?</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={s.resetLab}>
            <RotateCcw /> Start a fresh lab
          </Button>
        </Callout>
      )}
    </StagePanel>
  );
}
