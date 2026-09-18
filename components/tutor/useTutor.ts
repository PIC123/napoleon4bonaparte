"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useLab } from "@/lib/store";
import { STAGES, STAGE_BY_ID, type StageId } from "@/lib/curriculum";
import type { LabContext } from "@/lib/tutor-prompt";

export interface TutorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Scripted messages come from the lab itself, not the model */
  scripted?: boolean;
}

export type TutorStatus = "idle" | "thinking" | "talking";
export type TutorMode = "unknown" | "live" | "offline";

const uid = () => Math.random().toString(36).slice(2, 10);

const STAGE_GREETINGS: Record<StageId, string> = {
  welcome:
    "Hi, I'm Pip! I live on this bench. I won't hand you the recipe, but I'll help you think like a pastry chef. Pick a style when you're ready, and ask me anything along the way.",
  pantry:
    "New stage: the pantry. Some of these items are traps. Before you click, ask yourself what job each ingredient does. I'm happy to talk through any of them.",
  detrempe:
    "The détrempe. Three dials: water, mixing, rest. Watch what the dough does in the bowl as you change them, and tell me what you notice.",
  lamination:
    "Lamination is a temperature game as much as a folding game. Keep an eye on the thermometer as you fold. If you want to talk strategy first, I'm here.",
  bake:
    "Time for the oven. Think about what has to happen inside each butter layer, and how the oven settings help or hinder it.",
  cream:
    "Crème pâtissière. Eggs, starch and heat. Two of those get along fine; the third needs chaperoning. Take it slowly.",
  assembly:
    "Now you build. Think about the job of each layer and match the structure to the style you chose.",
  rest:
    "Resting is where water does the work. The curves show you the trade-off; your style tells you which side of it you want.",
  serve:
    "The reveal! Cutting is the last place to lose all those layers. Choose your tools with the structure in mind.",
};

/**
 * Chat state + streaming. Falls back to scripted, stage-aware hints when the
 * API route reports that no key is configured, so the lab stays useful
 * without a backend.
 */
export function useTutor() {
  const [messages, setMessages] = useState<TutorMessage[]>(() => [
    { id: uid(), role: "assistant", content: STAGE_GREETINGS[STAGES[useLab.getState().stageIndex].id], scripted: true },
  ]);
  const [status, setStatus] = useState<TutorStatus>("idle");
  const [mode, setMode] = useState<TutorMode>("unknown");
  const abortRef = useRef<AbortController | null>(null);

  const lab = useLab(
    useShallow((s) => ({
      stageIndex: s.stageIndex,
      bumpHints: s.bumpHints,
    })),
  );
  const stage = STAGES[lab.stageIndex];

  // Scripted messages react to the lab store (an external system): a greeting
  // the first time a stage is opened, and a nudge after a second failed check.
  useEffect(() => {
    const greeted = new Set<StageId>([STAGES[useLab.getState().stageIndex].id]);
    const nudged = new Map<StageId, number>();
    return useLab.subscribe((s, prev) => {
      const id = STAGES[s.stageIndex].id;
      if (s.stageIndex !== prev.stageIndex && !greeted.has(id)) {
        greeted.add(id);
        setMessages((m) => [...m, { id: uid(), role: "assistant", content: STAGE_GREETINGS[id], scripted: true }]);
      }
      const fb = s.feedback[id];
      if (fb && !fb.ok && fb.attempts === 2 && nudged.get(id) !== 2 && s.feedback !== prev.feedback) {
        nudged.set(id, 2);
        setMessages((m) => [
          ...m,
          {
            id: uid(),
            role: "assistant",
            content:
              "Two tries in. That's normal; this stage catches everyone somewhere. Tell me what you changed between attempts and I'll help you narrow it down.",
            scripted: true,
          },
        ]);
      }
    });
  }, []);

  const buildContext = useCallback((): LabContext => {
    const s = useLab.getState();
    const fb = s.feedback[stage.id];
    return {
      stageId: stage.id,
      style: s.style,
      attempts: fb?.attempts ?? 0,
      lastFeedback: fb ? { ok: fb.ok, title: fb.title, points: fb.points } : null,
      completed: s.completed,
      state: {
        lists: s.lists,
        hydration: s.hydration,
        mixMinutes: s.mixMinutes,
        restMinutes: s.restMinutes,
        butterLayers: s.butterLayers,
        butterTemp: s.butterTemp,
        foldLog: s.foldLog,
        chills: s.chills,
        laminationFault: s.laminationFault,
        ovenTemp: s.ovenTemp,
        bakeMinutes: s.bakeMinutes,
        docked: s.docked,
        weighted: s.weighted,
        bakeRun: s.bakeRun,
        pourSpeed: s.pourSpeed,
        creamPhase: s.creamPhase,
        creamTemp: s.creamTemp,
        boilSeconds: s.boilSeconds,
        scrambled: s.scrambled,
        scorched: s.scorched,
        layers: s.layers,
        creamThickness: s.creamThickness,
        topping: s.topping,
        restHours: s.restHours,
        restLocation: s.restLocation,
        knife: s.knife,
        motion: s.motion,
        portion: s.portion,
        finish: s.finish,
        served: s.served,
      },
    };
  }, [stage.id]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || status !== "idle") return;
      lab.bumpHints();

      const userMsg: TutorMessage = { id: uid(), role: "user", content: trimmed };
      const assistantId = uid();
      const history = [...messages, userMsg];
      setMessages([...history, { id: assistantId, role: "assistant", content: "" }]);
      setStatus("thinking");

      const append = (chunk: string) =>
        setMessages((m) => m.map((x) => (x.id === assistantId ? { ...x, content: x.content + chunk } : x)));

      if (mode === "offline") {
        await streamScripted(offlineAnswer(stage.id, trimmed), append, setStatus);
        setStatus("idle");
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // Scripted messages are UI furniture; the model only sees the real exchange.
            messages: history.filter((m) => !m.scripted).map(({ role, content }) => ({ role, content })),
            context: buildContext(),
          }),
          signal: controller.signal,
        });
        if (res.status === 503) {
          setMode("offline");
          await streamScripted(offlineAnswer(stage.id, trimmed), append, setStatus);
          return;
        }
        if (!res.ok || !res.body) {
          append("Hmm, I couldn't reach my notes just now. Try again in a moment.");
          return;
        }
        setMode("live");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let first = true;
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          if (first) {
            setStatus("talking");
            first = false;
          }
          append(decoder.decode(value, { stream: true }));
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") append("Something interrupted me. Ask again?");
      } finally {
        abortRef.current = null;
        setStatus("idle");
      }
    },
    [messages, status, mode, stage.id, buildContext, lab],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);
  const clear = useCallback(() => {
    setMessages([{ id: uid(), role: "assistant", content: STAGE_GREETINGS[stage.id], scripted: true }]);
  }, [stage.id]);

  return { messages, status, mode, send, stop, clear, suggested: stage.suggestedQuestions };
}

/* ------------------------------------------------------------------ */
/* Offline fallback: stage-aware, still Socratic                       */
/* ------------------------------------------------------------------ */

async function streamScripted(text: string, append: (c: string) => void, setStatus: (s: TutorStatus) => void) {
  await new Promise((r) => setTimeout(r, 500));
  setStatus("talking");
  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    append((i ? " " : "") + words[i]);
    await new Promise((r) => setTimeout(r, 22));
  }
}

const STOP = new Set(["the", "a", "an", "and", "or", "of", "to", "in", "is", "it", "i", "my", "do", "does", "what", "why", "how", "for", "on", "with", "this", "that", "be", "can", "should"]);

function offlineAnswer(stageId: StageId, question: string): string {
  const stage = STAGE_BY_ID[stageId];
  const q = new Set(question.toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w)));
  let best = stage.science[0];
  let bestScore = -1;
  for (const s of STAGES.flatMap((st) => st.science.map((sc) => ({ ...sc, own: st.id === stageId })))) {
    const words = `${s.heading} ${s.body}`.toLowerCase().split(/\W+/);
    const score = words.reduce((a, w) => a + (q.has(w) ? 1 : 0), 0) + (s.own ? 0.5 : 0);
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  }
  const followUps = [
    "How would that change what you do at the bench right now?",
    "Which of your current settings does that touch?",
    "What do you think would happen if you pushed that variable the other way?",
  ];
  const f = followUps[Math.floor(Math.random() * followUps.length)];
  return `(I'm running in offline mode: no API key is configured, so I'm working from my notes.) Here's a piece of the picture that I think matters for your question. ${best.body} ${f}`;
}
