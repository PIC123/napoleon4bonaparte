"use client";

import { useShallow } from "zustand/react/shallow";
import { StagePanel } from "../StagePanel";
import { Segmented } from "@/components/ui/segmented";
import { useLab } from "@/lib/store";
import { STAGE_BY_ID, STYLE_INFO, type CakeStyle } from "@/lib/curriculum";

export function WelcomeStage() {
  const { style, setStyle, completeStage } = useLab(
    useShallow((s) => ({ style: s.style, setStyle: s.setStyle, completeStage: s.completeStage })),
  );
  const stage = STAGE_BY_ID.welcome;
  return (
    <StagePanel stage={stage}>
      <Segmented<CakeStyle>
        label="Which tradition are you aiming for?"
        value={style}
        onChange={(v) => {
          setStyle(v);
          completeStage("welcome");
        }}
        options={[
          { value: "french", label: STYLE_INFO.french.name, description: STYLE_INFO.french.blurb },
          { value: "russian", label: STYLE_INFO.russian.name, description: STYLE_INFO.russian.blurb },
        ]}
      />
      <p className="text-xs text-ink-3">
        This choice shapes the later stages (how many layers, how long to rest). Pip will remember it.
      </p>
    </StagePanel>
  );
}
