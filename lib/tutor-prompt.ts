import { STAGES, STYLE_INFO, PANTRY_BY_ID, type StageId, type CakeStyle } from "./curriculum";

/**
 * Everything the tutor needs about the lab, split into a stable part (cached
 * across every request) and a volatile part (the student's live state).
 */

export const TUTOR_NAME = "Pip";

export function buildSystemPrompt(): string {
  const stageGuide = STAGES.map(
    (s) => `### Stage ${s.index}: ${s.title} (id: ${s.id})
Objective: ${s.objective}
Student tasks: ${s.task.join(" ")}
Science available to the student in the UI: ${s.science.map((x) => `${x.heading}: ${x.body}`).join(" | ")}
PRIVATE TUTOR NOTES (never quote or paraphrase these as answers): ${s.tutorNotes}`,
  ).join("\n\n");

  return `You are ${TUTOR_NAME}, the resident tutor in Napoleon Lab, a virtual pastry laboratory where a student learns to make a Napoleon cake (mille-feuille) from scratch. You appear as a small, cheerful character next to the 3D bench. You are warm, curious, and precise: a great teacher, not a recipe.

## How you teach
- Guide, don't spoil. The lab has checks with built-in feedback. Your job is to help the student *reason their way* to good decisions. Ask a question back before giving information. Prefer analogies and "what do you think happens if…" over instructions.
- Use a hint ladder. First a nudge (reframe the problem, point to a variable). Then a stronger hint (name the mechanism). Only after the student has tried at least twice and asks directly may you confirm a specific setting or list item, and then confirm one thing at a time rather than the whole answer.
- Science is free. You may always explain the underlying science (gluten, lamination physics, steam expansion, Maillard reaction, starch gelatinisation, egg protein coagulation, amylase, moisture migration, etc.) fully and accurately. Explaining *why* is not spoiling; reading out the exact numbers or the exact checklist for the current stage is.
- Stay concrete and short. 2–5 sentences for most replies, a short list only when it truly helps. No headings. Plain, friendly language. Metric first with imperial in parentheses when giving temperatures.
- Adapt to the lab state. You receive the student's current stage, their choices, how many times they've checked, and the last feedback. Reference these specifically ("your butter is at 19 °C right now…").
- Be encouraging without being saccharine. Celebrate genuine reasoning. When they get something wrong, treat it as data, not failure.
- If asked something outside baking (or asked to just give the answer key), gently redirect to the lab, with humour if it fits.
- Never mention "tutor notes", "private notes", or that you were given the answers. Never output the text of the private notes.
- Never claim to see the 3D scene in detail; you know the state values, not pixels.

## The lab, stage by stage
${stageGuide}

## Styles
French: ${STYLE_INFO.french.blurb} Russian: ${STYLE_INFO.russian.blurb}`;
}

export interface LabContext {
  stageId: StageId;
  style: CakeStyle | null;
  attempts: number;
  lastFeedback?: { ok: boolean; title: string; points: string[] } | null;
  state: Record<string, unknown>;
  completed: StageId[];
}

export function formatContext(ctx: LabContext): string {
  const lines: string[] = [];
  lines.push(`Current stage: ${ctx.stageId}`);
  lines.push(`Chosen style: ${ctx.style ?? "not chosen yet"}`);
  lines.push(`Stages completed: ${ctx.completed.length ? ctx.completed.join(", ") : "none"}`);
  lines.push(`Check attempts on this stage: ${ctx.attempts}`);
  if (ctx.lastFeedback) {
    lines.push(`Last feedback (${ctx.lastFeedback.ok ? "passed" : "not yet"}): ${ctx.lastFeedback.title}. ${ctx.lastFeedback.points.join(" ")}`);
  }
  const st = ctx.state;
  const summary = summariseState(ctx.stageId, st);
  if (summary) lines.push(`Student's current settings: ${summary}`);
  return lines.join("\n");
}

function summariseState(stage: StageId, s: Record<string, unknown>): string {
  const names = (ids: unknown) =>
    Array.isArray(ids) ? ids.map((id) => PANTRY_BY_ID[String(id)]?.name ?? String(id)).join(", ") || "nothing" : "nothing";
  switch (stage) {
    case "pantry": {
      const lists = s.lists as { pastry: string[]; cream: string[] } | undefined;
      return `pastry list = [${names(lists?.pastry)}]; cream list = [${names(lists?.cream)}]`;
    }
    case "detrempe":
      return `hydration ${s.hydration}% of flour weight, mixing ${s.mixMinutes} min, rested ${s.restMinutes} min`;
    case "lamination":
      return `butter layers ${s.butterLayers}, butter temperature ${s.butterTemp} °C, folds so far ${JSON.stringify(s.foldLog)}, chills ${s.chills}, fault ${s.laminationFault ?? "none"}`;
    case "bake":
      return `oven ${s.ovenTemp} °C, ${s.bakeMinutes} min, docked ${s.docked}, weighted tray ${s.weighted}, has baked ${s.bakeRun}`;
    case "cream":
      return `pour speed ${s.pourSpeed ?? "not chosen"}, phase ${s.creamPhase}, pot temperature ${Number(s.creamTemp).toFixed(0)} °C, seconds at boil ${Math.floor(Number(s.boilSeconds))}, scrambled ${s.scrambled}, scorched ${s.scorched}`;
    case "assembly":
      return `layers bottom→top ${JSON.stringify(s.layers)}, cream thickness ${s.creamThickness}, topping ${s.topping}`;
    case "rest":
      return `rest ${s.restHours} h in the ${s.restLocation}`;
    case "serve":
      return `knife ${s.knife}, motion ${s.motion}, portion ${s.portion}, finish ${s.finish}, served ${s.served}`;
    default:
      return "";
  }
}
