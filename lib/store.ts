"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STAGES, type StageId, type CakeStyle, type ListKey } from "./curriculum";

export type FoldType = "letter" | "book";
export type PourSpeed = "all-at-once" | "in-stages" | "gradual";
export type CreamThickness = "thin" | "medium" | "thick";
export type AssemblyLayer = "pastry" | "cream";
export type Topping = "crumbs" | "sugar" | "fondant" | "none";

export interface Feedback {
  ok: boolean;
  title: string;
  points: string[];
  /** Number of check attempts so far on this stage */
  attempts: number;
}

export interface LabState {
  // Navigation
  stageIndex: number;
  completed: StageId[];
  style: CakeStyle | null;
  startedAt: number | null;

  // Stage 1 – pantry
  lists: Record<ListKey, string[]>;

  // Stage 2 – détrempe
  hydration: number; // percent of flour weight
  mixMinutes: number;
  restMinutes: number;

  // Stage 3 – lamination
  butterLayers: number; // starts at 1
  butterTemp: number; // °C
  foldLog: { type: FoldType; tempBefore: number }[];
  laminationFault: "melted" | "cracked" | null;
  chills: number;

  // Stage 4 – bake
  ovenTemp: number; // °C
  bakeMinutes: number;
  docked: boolean;
  weighted: boolean;
  bakeRun: boolean;

  // Stage 5 – cream
  pourSpeed: PourSpeed | null;
  creamPhase: "prep" | "temper" | "cook" | "done";
  creamTemp: number; // °C of the pot
  boilSeconds: number;
  cookSeconds: number;
  scrambled: boolean;
  scorched: boolean;

  // Stage 6 – assembly
  layers: AssemblyLayer[];
  creamThickness: CreamThickness;
  topping: Topping;

  // Stage 7 – rest
  restHours: number;
  restLocation: "fridge" | "counter";

  // Stage 8 – serve
  knife: "serrated" | "chef" | null;
  motion: "saw" | "press" | null;
  portion: "small" | "classic" | "large" | null;
  finish: "sugar" | "crumbs" | "fondant" | null;
  served: boolean;

  feedback: Partial<Record<StageId, Feedback>>;
  hintsRequested: number;
}

export interface LabActions {
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  setStyle: (s: CakeStyle) => void;
  completeStage: (id: StageId) => void;
  setFeedback: (id: StageId, fb: Omit<Feedback, "attempts">) => void;
  clearFeedback: (id: StageId) => void;
  toggleIngredient: (list: ListKey, id: string) => void;
  set: <K extends keyof LabState>(key: K, value: LabState[K]) => void;
  patch: (p: Partial<LabState>) => void;
  fold: (type: FoldType) => void;
  chill: () => void;
  resetLamination: () => void;
  addLayer: (l: AssemblyLayer) => void;
  popLayer: () => void;
  resetCream: () => void;
  bumpHints: () => void;
  resetLab: () => void;
}

const initial: LabState = {
  stageIndex: 0,
  completed: [],
  style: null,
  startedAt: null,
  lists: { pastry: [], cream: [] },
  hydration: 60,
  mixMinutes: 5,
  restMinutes: 0,
  butterLayers: 1,
  butterTemp: 12,
  foldLog: [],
  laminationFault: null,
  chills: 0,
  ovenTemp: 170,
  bakeMinutes: 15,
  docked: false,
  weighted: false,
  bakeRun: false,
  pourSpeed: null,
  creamPhase: "prep",
  creamTemp: 20,
  boilSeconds: 0,
  cookSeconds: 0,
  scrambled: false,
  scorched: false,
  layers: [],
  creamThickness: "medium",
  topping: "none",
  restHours: 0,
  restLocation: "fridge",
  knife: null,
  motion: null,
  portion: null,
  finish: null,
  served: false,
  feedback: {},
  hintsRequested: 0,
};

export const useLab = create<LabState & LabActions>()(
  persist(
    (set, get) => ({
      ...initial,
      goTo: (index) =>
        set({ stageIndex: Math.max(0, Math.min(STAGES.length - 1, index)) }),
      next: () => get().goTo(get().stageIndex + 1),
      prev: () => get().goTo(get().stageIndex - 1),
      setStyle: (style) => set({ style }),
      completeStage: (id) =>
        set((s) => ({
          completed: s.completed.includes(id) ? s.completed : [...s.completed, id],
        })),
      setFeedback: (id, fb) =>
        set((s) => ({
          feedback: {
            ...s.feedback,
            [id]: { ...fb, attempts: (s.feedback[id]?.attempts ?? 0) + 1 },
          },
        })),
      clearFeedback: (id) =>
        set((s) => {
          const f = { ...s.feedback };
          delete f[id];
          return { feedback: f };
        }),
      toggleIngredient: (list, id) =>
        set((s) => {
          const cur = s.lists[list];
          const nextList = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
          return { lists: { ...s.lists, [list]: nextList } };
        }),
      set: (key, value) => set({ [key]: value } as Partial<LabState>),
      patch: (p) => set(p),
      fold: (type) =>
        set((s) => {
          if (s.laminationFault) return {};
          const tempBefore = s.butterTemp;
          // Rolling and folding at room temperature warms the butter.
          const warmed = s.butterTemp + (type === "book" ? 4 : 3);
          let fault: LabState["laminationFault"] = null;
          if (tempBefore < 8) fault = "cracked";
          if (warmed > 20) fault = "melted";
          return {
            butterLayers: s.butterLayers * (type === "letter" ? 3 : 4),
            butterTemp: warmed,
            foldLog: [...s.foldLog, { type, tempBefore }],
            laminationFault: fault,
          };
        }),
      chill: () =>
        set((s) => ({
          butterTemp: Math.max(4, s.butterTemp - 8),
          chills: s.chills + 1,
        })),
      resetLamination: () =>
        set({ butterLayers: 1, butterTemp: 12, foldLog: [], laminationFault: null, chills: 0 }),
      addLayer: (l) => set((s) => ({ layers: [...s.layers, l] })),
      popLayer: () => set((s) => ({ layers: s.layers.slice(0, -1) })),
      resetCream: () =>
        set({
          pourSpeed: null,
          creamPhase: "prep",
          creamTemp: 20,
          boilSeconds: 0,
          cookSeconds: 0,
          scrambled: false,
          scorched: false,
        }),
      bumpHints: () => set((s) => ({ hintsRequested: s.hintsRequested + 1 })),
      resetLab: () => set({ ...initial, startedAt: Date.now() }),
    }),
    {
      name: "napoleon-lab-v1",
      partialize: (s) => {
        // Persist everything except functions
        const { ...rest } = s;
        return rest as LabState;
      },
    },
  ),
);

export const useStage = () => useLab((s) => STAGES[s.stageIndex]);
