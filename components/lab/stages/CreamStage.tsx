"use client";

import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { StagePanel } from "../StagePanel";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Meter } from "@/components/ui/meter";
import { Callout } from "@/components/ui/callout";
import { useLab, type PourSpeed } from "@/lib/store";
import { STAGE_BY_ID } from "@/lib/curriculum";
import { evaluateCream } from "@/lib/evaluate";
import { Flame, Square, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The cream stage runs a small real-time simulation: while the pot is on the
 * heat, temperature climbs toward a boil and the boil timer counts up. The
 * student decides when to stop. Every rule of thumb in a real recipe
 * ("bring to a boil, whisk one minute") becomes a decision they make.
 */
export function CreamStage() {
  const s = useLab(
    useShallow((st) => ({
      pourSpeed: st.pourSpeed,
      phase: st.creamPhase,
      temp: st.creamTemp,
      boil: st.boilSeconds,
      cook: st.cookSeconds,
      scrambled: st.scrambled,
      scorched: st.scorched,
      set: st.set,
      patch: st.patch,
      reset: st.resetCream,
      setFeedback: st.setFeedback,
      completeStage: st.completeStage,
    })),
  );
  const stage = STAGE_BY_ID.cream;
  const raf = useRef<number | null>(null);

  // Real-time cook loop. 1 real second = 6 simulated seconds.
  useEffect(() => {
    if (s.phase !== "cook") return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = ((now - last) / 1000) * 6;
      last = now;
      const st = useLab.getState();
      const temp = Math.min(100, st.creamTemp + dt * 0.9);
      const boiling = temp >= 97;
      const boilSeconds = st.boilSeconds + (boiling ? dt : 0);
      const cookSeconds = st.cookSeconds + dt;
      const scorched = st.scorched || boilSeconds > 180;
      useLab.setState({ creamTemp: temp, boilSeconds, cookSeconds, scorched });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [s.phase]);

  const temper = (speed: PourSpeed) => {
    const scrambled = speed === "all-at-once";
    s.patch({ pourSpeed: speed, creamPhase: "temper", scrambled, creamTemp: scrambled ? 62 : 48 });
  };

  const check = () => {
    const r = evaluateCream({
      pourSpeed: s.pourSpeed,
      creamPhase: s.phase,
      scrambled: s.scrambled,
      scorched: s.scorched,
      boilSeconds: s.boil,
      creamTemp: s.temp,
    });
    s.setFeedback("cream", r);
    if (r.ok) s.completeStage("cream");
  };

  const tempTone = s.temp < 65 ? "sky" : s.temp < 90 ? "caramel" : "rose";

  return (
    <StagePanel stage={stage} onCheck={check} checkLabel="Check cream" onReset={s.reset}>
      <div className="grid grid-cols-3 gap-2 text-center">
        {(["prep", "temper", "cook", "done"] as const).slice(0, 3).map((p, i) => {
          const order = ["prep", "temper", "cook", "done"];
          const active = order.indexOf(s.phase) >= i;
          return (
            <div key={p} className={cn("rounded-lg border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide", active ? "border-caramel bg-butter-2/70 text-caramel-2" : "border-line text-ink-3")}>
              {i + 1}. {p === "prep" ? "Whisk & heat" : p === "temper" ? "Temper" : "Cook"}
            </div>
          );
        })}
      </div>

      {s.phase === "prep" && (
        <>
          <p className="text-sm text-ink-2">
            The milk and vanilla are coming up to a simmer. The yolks, sugar and cornstarch are whisked pale in the bowl. Now bring them together.
          </p>
          <Segmented<PourSpeed>
            label="How do you add the hot milk to the yolks?"
            value={s.pourSpeed}
            columns={3}
            onChange={temper}
            options={[
              { value: "all-at-once", label: "All at once", description: "Fast. Get it over with." },
              { value: "in-stages", label: "In a few additions", description: "A ladle at a time, whisking." },
              { value: "gradual", label: "Thin stream", description: "Slowly, whisking constantly." },
            ]}
          />
        </>
      )}

      {s.phase === "temper" && (
        <>
          {s.scrambled ? (
            <Callout tone="warn" title="Something's not smooth">
              There are pale flecks in the bowl. You can carry on and see how it cooks, or reset and try a different pour.
            </Callout>
          ) : (
            <Callout tone="success" title="Smooth and warm">
              The yolks took the heat evenly. Everything goes back into the pot.
            </Callout>
          )}
          <Button onClick={() => s.set("creamPhase", "cook")}>
            <Flame /> Return to the pot and cook
          </Button>
        </>
      )}

      {(s.phase === "cook" || s.phase === "done") && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-line bg-paper px-3 py-2">
              <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-ink-3"><Thermometer className="size-3" /> Pot</div>
              <div className={cn("font-display text-2xl font-semibold tabular-nums", tempTone === "rose" ? "text-rose" : "text-ink")}>{s.temp.toFixed(0)} °C</div>
            </div>
            <div className="rounded-xl border border-line bg-paper px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">At the boil</div>
              <div className="font-display text-2xl font-semibold tabular-nums text-ink">{Math.floor(s.boil)} s</div>
            </div>
            <div className="rounded-xl border border-line bg-paper px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">Total</div>
              <div className="font-display text-2xl font-semibold tabular-nums text-ink">{Math.floor(s.cook / 60)}:{String(Math.floor(s.cook % 60)).padStart(2, "0")}</div>
            </div>
          </div>
          <Meter label="Thickness" value={Math.max(0, (s.temp - 75) / 25)} tone="caramel" />
          {s.phase === "cook" ? (
            <Button variant="secondary" onClick={() => s.set("creamPhase", "done")}>
              <Square /> Take it off the heat
            </Button>
          ) : (
            <p className="text-sm text-ink-2">
              Off the heat. Butter is whisked in, then the cream is chilled with film pressed onto its surface. Check it when you&apos;re ready.
            </p>
          )}
        </>
      )}
    </StagePanel>
  );
}
