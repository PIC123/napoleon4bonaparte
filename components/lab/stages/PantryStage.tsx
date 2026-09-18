"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { StagePanel } from "../StagePanel";
import { useLab } from "@/lib/store";
import { PANTRY, STAGE_BY_ID, type ListKey } from "@/lib/curriculum";
import { evaluatePantry } from "@/lib/evaluate";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function PantryStage() {
  const { lists, toggle, setFeedback, completeStage, patch } = useLab(
    useShallow((s) => ({
      lists: s.lists,
      toggle: s.toggleIngredient,
      setFeedback: s.setFeedback,
      completeStage: s.completeStage,
      patch: s.patch,
    })),
  );
  const [target, setTarget] = useState<ListKey>("pastry");
  const stage = STAGE_BY_ID.pantry;

  const check = () => {
    const r = evaluatePantry(lists);
    setFeedback("pantry", r);
    if (r.ok) completeStage("pantry");
  };

  return (
    <StagePanel
      stage={stage}
      onCheck={check}
      checkLabel="Check my lists"
      onReset={() => patch({ lists: { pastry: [], cream: [] } })}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-ink">Adding to:</span>
        {(["pastry", "cream"] as ListKey[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTarget(k)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition",
              target === k ? "bg-caramel text-white" : "bg-paper text-ink-2 border border-line hover:bg-cream-2",
            )}
          >
            {k === "pastry" ? "Puff pastry" : "Pastry cream"} · {lists[k].length}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {PANTRY.map((ing) => {
          const inPastry = lists.pastry.includes(ing.id);
          const inCream = lists.cream.includes(ing.id);
          const active = target === "pastry" ? inPastry : inCream;
          return (
            <button
              key={ing.id}
              type="button"
              onClick={() => toggle(target, ing.id)}
              className={cn(
                "group relative rounded-xl border px-2.5 py-2 text-left transition-all",
                active
                  ? "border-caramel bg-butter-2/70 shadow-soft"
                  : "border-line bg-paper hover:border-caramel/40 hover:bg-cream-2",
              )}
              title={ing.detail}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none">{ing.emoji}</span>
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-ink">{ing.name}</div>
                  {ing.detail && <div className="truncate text-[10px] text-ink-3">{ing.detail}</div>}
                </div>
              </div>
              <div className="absolute -top-1.5 -right-1 flex gap-0.5">
                {inPastry && <Badge tone="caramel" className="px-1.5 py-0 text-[9px]">P</Badge>}
                {inCream && <Badge tone="sky" className="px-1.5 py-0 text-[9px]">C</Badge>}
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-ink-3">P = on the pastry list, C = on the cream list. An item can be on both.</p>
    </StagePanel>
  );
}
