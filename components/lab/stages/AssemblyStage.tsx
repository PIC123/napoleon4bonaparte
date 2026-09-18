"use client";

import { useShallow } from "zustand/react/shallow";
import { StagePanel } from "../StagePanel";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { useLab, type CreamThickness, type Topping } from "@/lib/store";
import { STAGE_BY_ID, STYLE_INFO } from "@/lib/curriculum";
import { evaluateAssembly } from "@/lib/evaluate";
import { Layers, Undo2 } from "lucide-react";

export function AssemblyStage() {
  const s = useLab(
    useShallow((st) => ({
      layers: st.layers,
      creamThickness: st.creamThickness,
      topping: st.topping,
      style: st.style,
      addLayer: st.addLayer,
      popLayer: st.popLayer,
      set: st.set,
      patch: st.patch,
      setFeedback: st.setFeedback,
      completeStage: st.completeStage,
    })),
  );
  const stage = STAGE_BY_ID.assembly;
  const pastry = s.layers.filter((l) => l === "pastry").length;
  const cream = s.layers.length - pastry;

  const check = () => {
    const r = evaluateAssembly(s, s.style);
    s.setFeedback("assembly", r);
    if (r.ok) s.completeStage("assembly");
  };

  return (
    <StagePanel stage={stage} onCheck={check} checkLabel="Check assembly" onReset={() => s.patch({ layers: [], topping: "none" })}>
      <div className="flex items-center justify-between rounded-xl border border-line bg-paper px-3 py-2">
        <div>
          <div className="text-sm font-medium text-ink">Your target: {s.style ? STYLE_INFO[s.style].name : "choose a style on the Welcome stage"}</div>
          <div className="text-xs text-ink-3">{s.style ? STYLE_INFO[s.style].sheets : ""}</div>
        </div>
        <div className="text-right font-mono text-xs text-ink-2">
          <div>{pastry} pastry</div>
          <div>{cream} cream</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Button variant="secondary" onClick={() => s.addLayer("pastry")}>
          <Layers /> Add pastry
        </Button>
        <Button variant="secondary" onClick={() => s.addLayer("cream")}>
          <Layers /> Add cream
        </Button>
        <Button variant="ghost" onClick={s.popLayer} disabled={s.layers.length === 0}>
          <Undo2 /> Remove top
        </Button>
      </div>
      <Segmented<CreamThickness>
        label="Cream layer thickness"
        value={s.creamThickness}
        columns={3}
        onChange={(v) => s.set("creamThickness", v)}
        options={[
          { value: "thin", label: "Thin" },
          { value: "medium", label: "Medium" },
          { value: "thick", label: "Thick" },
        ]}
      />
      <Segmented<Topping>
        label="Finish the top"
        value={s.topping}
        columns={3}
        onChange={(v) => s.set("topping", v)}
        options={[
          { value: "crumbs", label: "Pastry crumbs" },
          { value: "sugar", label: "Icing sugar" },
          { value: "fondant", label: "Fondant stripes" },
        ]}
      />
    </StagePanel>
  );
}
