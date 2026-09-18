# Napoleon Lab

A virtual pastry laboratory that teaches students to bake a Napoleon cake (mille-feuille) from scratch: ingredient selection, détrempe, lamination, baking, crème pâtissière, assembly, resting, and serving. Each stage is an interactive 3D scene with controls, a checker that gives directional feedback (not answers), and an on-demand science drawer. Pip, the built-in AI tutor, sees the student's live lab state and guides Socratically.

## Stack

- **Next.js 16** (App Router, TypeScript) with **Tailwind CSS v4**
- **React Three Fiber + drei** for the 3D bench and every stage scene
- **Zustand** (persisted) for lab state, **Motion** for UI transitions
- **Anthropic TypeScript SDK** streaming `claude-opus-5` for the tutor, with prompt caching on the curriculum and server-side refusal fallbacks enabled
- UI primitives written in the shadcn / 21st.dev idiom (`class-variance-authority` + `tailwind-merge`)

## Run it

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000 and press **Enter the lab**.

Without an API key the lab is still fully playable; Pip switches to an offline mode that answers from the stage's science notes.

## Project layout

```
app/
  page.tsx              landing page
  lab/page.tsx          the lab
  api/tutor/route.ts    streaming tutor endpoint
lib/
  curriculum.ts         stages, science notes, pantry, private tutor notes
  evaluate.ts           per-stage checkers (feedback never states the answer)
  store.ts              Zustand lab state
  tutor-prompt.ts       system prompt + live lab context formatting
components/
  lab/LabShell.tsx      3-column lab layout (stage rail · bench + tasks · tutor)
  lab/StagePanel.tsx    shared stage skeleton (objective, tasks, check, science)
  lab/stages/*.tsx      the nine interactive stage panels
  lab/scene/*.tsx       R3F scenes, props, and the parametric cake model
  tutor/*               avatar, chat panel, streaming hook with offline fallback
  ui/*                  button, card, badge, slider, segmented, meter, callout
```

## How the tutor avoids spoiling

The system prompt contains the full curriculum, including private per-stage notes with the correct values and a hint ladder: nudge → mechanism → confirm one item at a time, and only after repeated attempts. The student's live state (settings, attempts, last feedback) is appended to the final user turn on every request so the cached system prefix stays stable and the answers stay specific.
