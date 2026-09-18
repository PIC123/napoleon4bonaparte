"use client";

import { useState } from "react";
import { ChevronDown, ArrowRight, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { useLab } from "@/lib/store";
import { STAGES, type Stage } from "@/lib/curriculum";
import { cn } from "@/lib/utils";

interface StagePanelProps {
  stage: Stage;
  children: React.ReactNode;
  /** Called when the student presses the check button */
  onCheck?: () => void;
  checkLabel?: string;
  onReset?: () => void;
}

/**
 * Wraps every stage's controls with the same skeleton: eyebrow, objective,
 * tasks, the stage's interactive controls, check/feedback, and the science
 * drawer. Keeping this uniform is what makes the lab feel calm.
 */
export function StagePanel({ stage, children, onCheck, checkLabel = "Check my work", onReset }: StagePanelProps) {
  const feedback = useLab((s) => s.feedback[stage.id]);
  const completed = useLab((s) => s.completed.includes(stage.id));
  const next = useLab((s) => s.next);
  const stageIndex = useLab((s) => s.stageIndex);
  const [scienceOpen, setScienceOpen] = useState(false);
  const isLast = stageIndex === STAGES.length - 1;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto nice-scroll px-6 py-5">
        <div className="mb-4 flex items-center gap-2">
          <Badge tone="caramel">{stage.eyebrow}</Badge>
          {completed && <Badge tone="sage">Completed</Badge>}
        </div>
        <h2 className="font-display text-2xl font-semibold leading-tight text-ink">{stage.title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{stage.objective}</p>

        <ol className="mt-4 space-y-1.5">
          {stage.task.map((t, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-ink-2">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-cream-2 font-mono text-[11px] font-semibold text-caramel-2">
                {i + 1}
              </span>
              <span className="leading-relaxed">{t}</span>
            </li>
          ))}
        </ol>

        <div className="mt-5 space-y-4 rounded-2xl border border-line bg-cream/60 p-4">{children}</div>

        <AnimatePresence initial={false}>
          {feedback && (
            <motion.div
              key={feedback.attempts + (feedback.ok ? "ok" : "no")}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="mt-4"
            >
              <Callout tone={feedback.ok ? "success" : "hint"} title={feedback.title}>
                <ul className="space-y-1.5">
                  {feedback.points.map((p, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-current opacity-50" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                {!feedback.ok && feedback.attempts >= 2 && (
                  <p className="mt-2 text-xs text-ink-3">
                    Stuck? Ask Pip. After a couple of tries, Pip can confirm parts you have right.
                  </p>
                )}
              </Callout>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5">
          <button
            type="button"
            onClick={() => setScienceOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-xl border border-sky/30 bg-sky-2/50 px-3.5 py-2.5 text-left text-sm font-medium text-ink transition hover:bg-sky-2"
            aria-expanded={scienceOpen}
          >
            <span>Why does this work? The science</span>
            <ChevronDown className={cn("size-4 text-sky transition-transform", scienceOpen && "rotate-180")} />
          </button>
          <AnimatePresence initial={false}>
            {scienceOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 px-1 pt-3">
                  {stage.science.map((s) => (
                    <div key={s.heading}>
                      <h4 className="text-sm font-semibold text-ink">{s.heading}</h4>
                      <p className="mt-0.5 text-sm leading-relaxed text-ink-2">{s.body}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-line bg-paper px-6 py-3">
        {onReset && (
          <Button variant="ghost" size="sm" onClick={onReset} title="Reset this stage">
            <RotateCcw /> Reset
          </Button>
        )}
        <div className="flex-1" />
        {onCheck && (
          <Button variant={completed ? "secondary" : "primary"} onClick={onCheck}>
            {checkLabel}
          </Button>
        )}
        {(completed || !onCheck) && !isLast && (
          <Button variant={onCheck ? "success" : "primary"} onClick={next}>
            {onCheck ? "Continue" : "Begin"} <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}
