/**
 * Curriculum for the Napoleon Lab.
 *
 * Every stage carries three kinds of text:
 *  - `objective` / `task`  — what the student is asked to do (shown in the lab)
 *  - `science`             — the "why", revealed on demand, never required to progress
 *  - `tutorNotes`          — private guidance for the AI tutor: what the correct
 *                            answer is and how to nudge toward it without giving it away.
 *
 * The tutor notes are only ever sent to the model server-side; they are not
 * rendered in the UI.
 */

export type StageId =
  | "welcome"
  | "pantry"
  | "detrempe"
  | "lamination"
  | "bake"
  | "cream"
  | "assembly"
  | "rest"
  | "serve";

export interface Stage {
  id: StageId;
  index: number;
  title: string;
  short: string;
  eyebrow: string;
  objective: string;
  task: string[];
  science: { heading: string; body: string }[];
  suggestedQuestions: string[];
  tutorNotes: string;
}

export const STAGES: Stage[] = [
  {
    id: "welcome",
    index: 0,
    title: "Welcome to the bench",
    short: "Welcome",
    eyebrow: "Orientation",
    objective:
      "Get oriented: what a Napoleon is, what you will build, and how the lab and your tutor work together.",
    task: [
      "Look around the bench (drag to orbit, scroll to zoom).",
      "Read the two traditions below and decide which style you'd like to aim for. You can change your mind later.",
      "Say hello to Pip, your tutor, in the panel on the right.",
    ],
    science: [
      {
        heading: "What is a Napoleon?",
        body: "A Napoleon (mille-feuille, 'a thousand leaves') is sheets of puff pastry layered with pastry cream. Everything you will do comes down to two systems: a laminated dough that traps steam between fat layers, and a starch-thickened custard that holds those layers together.",
      },
      {
        heading: "Two traditions",
        body: "The French mille-feuille is served within hours: three crisp pastry sheets, thick cream, shattering texture. The Russian Napoleon uses many thin sheets and rests overnight so moisture migrates from the cream into the pastry, giving a tender, cake-like slice. Same ingredients, opposite goals for water.",
      },
    ],
    suggestedQuestions: [
      "What's the difference between a Napoleon and a mille-feuille?",
      "How long will this take in a real kitchen?",
      "What are the hardest parts for beginners?",
    ],
    tutorNotes:
      "Orientation only. Welcome the student warmly, briefly explain the lab flow (9 stages) and that you guide rather than give answers. Ask what they already know about puff pastry or custard to calibrate. There is nothing to 'get right' here.",
  },
  {
    id: "pantry",
    index: 1,
    title: "Choose your ingredients",
    short: "Pantry",
    eyebrow: "Stage 1 · Mise en place",
    objective:
      "Build two shopping lists from the pantry: one for the puff pastry, one for the pastry cream. Some items are traps.",
    task: [
      "Click ingredients to add them to the pastry list or the cream list.",
      "Aim for the smallest set that does the job. Extra items don't earn points.",
      "Press Check my lists when you're ready. Feedback will point you in a direction, not at the answer.",
    ],
    science: [
      {
        heading: "Flour protein and gluten",
        body: "Flour protein (glutenin + gliadin) becomes gluten when hydrated and worked. Puff pastry wants a moderate protein flour (~10–11%): enough structure to hold thin sheets, not so much that the dough fights the rolling pin and shrinks in the oven.",
      },
      {
        heading: "Why butter, and why cold",
        body: "Butter is ~80–84% fat and ~16% water. In lamination it must stay solid and plastic (bendable but not melting) so it forms continuous sheets between dough layers. The water inside those sheets later flashes to steam and lifts the layers. Higher-fat 'European' butter has less water and stays more pliable when cold.",
      },
      {
        heading: "Why no leavening",
        body: "Puff pastry rises from physics, not chemistry: water turning to steam expands roughly 1,600× in volume. Baking powder or yeast would add gas bubbles inside the dough layers and ruin the clean, flaky separation.",
      },
      {
        heading: "How pastry cream sets",
        body: "Egg yolks provide proteins that coagulate, starch (cornstarch or flour) gelatinizes when it swells in hot milk, and sugar slows both processes so the cream sets smoothly rather than scrambling. Milk brings water and proteins; butter at the end adds gloss and richness.",
      },
    ],
    suggestedQuestions: [
      "Does the protein content of flour matter here?",
      "What makes puff pastry puff if there's no baking powder?",
      "Why does pastry cream need both eggs and starch?",
      "Is margarine a reasonable substitute for butter?",
    ],
    tutorNotes: `Correct pastry list: all-purpose flour (bread flour is an acceptable choice with a note about toughness; cake flour is wrong), cold unsalted butter (high-fat European style is ideal; regular unsalted is acceptable), ice water, fine salt. Optional but acceptable: white vinegar or lemon juice (acid relaxes gluten). Traps for pastry: baking powder (no chemical leavening), instant yeast (that's croissant dough, not puff), cake flour (too weak to laminate), self-rising flour (contains leavening), margarine (more water, less fat, weaker layers — acceptable commercially but not what we want), warm water (softens butter), heavy cream (not for the dough).
Correct cream list: whole milk, egg yolks, granulated sugar, cornstarch (flour is an acceptable alternative), vanilla, unsalted butter (small amount, at the end). Traps for cream: egg whites (they don't provide the emulsifying richness and set rubbery), gelatin (unneeded; a Bavarian cream, not pastry cream), baking powder, yeast, heavy cream (acceptable only if they mention lightening it into diplomat cream later), chocolate (a variation, not the base).
Do not list the correct items. When a student asks about a specific item, ask what job they think it does, then confirm or redirect. If they've made 3+ attempts, you may confirm one category at a time (e.g. 'your flour choice is right').`,
  },
  {
    id: "detrempe",
    index: 2,
    title: "Mix the détrempe",
    short: "Dough",
    eyebrow: "Stage 2 · The base dough",
    objective:
      "Make the détrempe, the lean dough that will wrap the butter. The goal is a dough that is hydrated, barely mixed, and rested.",
    task: [
      "Set the hydration (water as a percentage of flour weight).",
      "Set how long you mix. Watch the gluten meter and the dough in the scene.",
      "Rest the dough in the fridge. Then press Check dough.",
    ],
    science: [
      {
        heading: "Hydration",
        body: "Détrempe is typically hydrated around 45–55% of flour weight, drier than bread dough. Too wet and it smears and sticks during lamination; too dry and it cracks and tears the butter sheets.",
      },
      {
        heading: "Gluten development and the resting trick",
        body: "Every minute of mixing aligns gluten strands and makes the dough more elastic. Elastic dough springs back when rolled and shrinks in the oven. You want the opposite: minimal mixing, then a cold rest so the gluten relaxes (stress relaxation) and the dough becomes extensible.",
      },
      {
        heading: "Why cold",
        body: "The fridge does two jobs: it relaxes gluten over time and keeps the dough at the same temperature as the butter block you'll add next, so the two layers roll at the same rate.",
      },
    ],
    suggestedQuestions: [
      "How do I know if I've over-mixed?",
      "Why do bakers add a little vinegar to the détrempe?",
      "What does resting the dough actually change?",
    ],
    tutorNotes: `Targets: hydration 45–55% (best ~50%), mixing 1–3 minutes (just until shaggy and cohesive; 4+ minutes is over-developed), rest ≥30 minutes chilled (60 is ideal). If the student over-mixes, ask them what elasticity will do when they roll and bake. If hydration is off, ask them to picture rolling the dough: what happens if it's sticky, what if it cracks? Don't state the numbers unless they've tried 3 times; instead reference the ranges qualitatively ('drier than bread dough').`,
  },
  {
    id: "lamination",
    index: 3,
    title: "Laminate the layers",
    short: "Laminate",
    eyebrow: "Stage 3 · Building the leaves",
    objective:
      "Lock the butter block inside the dough and fold it repeatedly to multiply the layers, all while keeping the butter cold enough to stay a sheet.",
    task: [
      "Choose a fold type each turn and press Roll & fold. Watch the layer count and the butter temperature.",
      "Working warms the butter. Chill the dough whenever it's getting soft.",
      "Reach a layer count in the hundreds without ever letting the butter go soft or crack, then press Check lamination.",
    ],
    science: [
      {
        heading: "Layer arithmetic",
        body: "A letter (single) fold turns one butter sheet into three; a book (double) fold turns it into four. Folds multiply: six single folds give 3⁶ = 729 butter layers. Too few folds and the pastry is coarse; too many and the layers get so thin the butter merges into the dough and you lose the flake.",
      },
      {
        heading: "Butter plasticity window",
        body: "Butter is a mix of fat crystals and liquid oil. Around 12–16 °C it is plastic: it bends into a continuous sheet. Below ~8 °C it is brittle and shatters into shards inside the dough. Above ~20 °C it softens, absorbs into the dough, and the layers vanish. Lamination is temperature management first, rolling second.",
      },
      {
        heading: "Why chill between folds",
        body: "Chilling re-firms the butter and lets the gluten relax again so the next roll doesn't tear the layers. Professionals rest 20–30 minutes between every one or two folds.",
      },
    ],
    suggestedQuestions: [
      "What happens if the butter gets too warm?",
      "Is a book fold better than a letter fold?",
      "How many layers does a professional puff pastry have?",
      "Why does the dough tear when I roll it?",
    ],
    tutorNotes: `Targets: final butter layer count between roughly 240 and 1,100 (classic 729 from six single folds, or 256 from four book folds, or a mix). Butter must never exceed 20 °C (it softens and merges) or drop below 8 °C at the moment of rolling (it cracks). Each fold warms the butter by about 3–4 °C; chilling drops it by ~8 °C per 15 minutes. The mechanic: alternate folds with chills. If the student's butter melted, ask what state butter is in at different temperatures and what a 'sheet' needs. If they under-fold, ask how layers multiply. Don't say 'do six folds'; help them reason from the multiplication.`,
  },
  {
    id: "bake",
    index: 4,
    title: "Bake the sheets",
    short: "Bake",
    eyebrow: "Stage 4 · Steam does the work",
    objective:
      "Roll the pastry into thin sheets and bake them into crisp, golden, even layers.",
    task: [
      "Decide whether to dock (prick) the sheet and whether to bake it under a weighted tray.",
      "Choose an oven temperature and a bake time. Watch the sheet rise and colour.",
      "Press Check bake when you have a sheet you'd be happy to build with.",
    ],
    science: [
      {
        heading: "Steam lift",
        body: "In a hot oven the water in each butter layer boils. Steam expands ~1,600× and pushes the dough sheets apart while the fat melts and fries them from the inside. Hot enough and this happens before the butter runs out: strong lift, crisp leaves. Too cool and the butter melts and leaks before steam forms, leaving a greasy, flat sheet.",
      },
      {
        heading: "Docking and weighting",
        body: "For a Napoleon you want flat, even sheets, not tall vol-au-vent puffs. Docking punches vents so steam escapes evenly; a second tray on top limits rise to a controlled height. Both trade a little height for a lot of evenness.",
      },
      {
        heading: "Colour: Maillard and caramelisation",
        body: "Golden colour comes from the Maillard reaction (proteins + sugars above ~140 °C) and caramelisation of surface sugars. Colour is also flavour: a pale sheet tastes of flour, a deep golden sheet tastes toasted and nutty. Past that it turns bitter.",
      },
    ],
    suggestedQuestions: [
      "Why is a high oven temperature important for puff pastry?",
      "What does docking do?",
      "How do I get flat, even sheets instead of a tall puff?",
      "What's happening when the pastry turns golden?",
    ],
    tutorNotes: `Targets: oven 200–220 °C (390–430 °F) is ideal; 180–200 acceptable but paler/less lift; below 180 the butter leaks (greasy, flat); above 230 the surface burns before the centre dries. Time: at 200–220 °C, 20–28 minutes for a weighted sheet is right; under 15 is under-baked (soggy centre), over 32 is burnt. Docking: yes. Weighted tray: yes for a Napoleon (flat even layers). Unweighted, undocked produces a tall uneven puff — nice for other pastries, wrong for stacking. Guide by asking what a stackable sheet looks like and what steam needs to do its job.`,
  },
  {
    id: "cream",
    index: 5,
    title: "Cook the crème pâtissière",
    short: "Cream",
    eyebrow: "Stage 5 · Custard chemistry",
    objective:
      "Make a smooth, thick pastry cream by tempering the eggs and cooking the starch fully, without scrambling anything.",
    task: [
      "Whisk yolks, sugar and starch together while the milk heats.",
      "Temper: pour hot milk into the yolks. Choose how fast you pour.",
      "Return everything to the pot and cook, watching the thermometer. Stop at the right moment, then finish and chill.",
    ],
    science: [
      {
        heading: "Tempering",
        body: "Egg yolk proteins start to coagulate around 65–70 °C. Dumping hot milk onto yolks creates local hot spots that scramble them. Adding milk gradually while whisking raises the yolks' temperature evenly, and the sugar and starch you whisked in dilute the proteins so they set more gently.",
      },
      {
        heading: "Starch gelatinisation",
        body: "Cornstarch granules swell and burst at roughly 90–95 °C, releasing amylose that thickens the cream. Because the starch also coats the egg proteins, pastry cream can be brought to a boil without curdling. Stopping early leaves it thin and chalky.",
      },
      {
        heading: "The amylase trap",
        body: "Egg yolks contain amylase, an enzyme that digests starch. If the cream isn't held at a boil for about a minute, the enzyme survives and slowly turns your thick cream watery in the fridge. This is why 'boil for a minute' is in every good recipe.",
      },
    ],
    suggestedQuestions: [
      "Why does pastry cream sometimes go watery overnight?",
      "How hot is too hot for egg yolks?",
      "Why press plastic wrap onto the surface of the cream?",
      "Can I use flour instead of cornstarch?",
    ],
    tutorNotes: `Targets: pour speed must be 'gradual' (slow stream while whisking) or 'in stages' — 'all at once' scrambles. Cooking: bring to a full boil (≥ 97 °C at sea level in this sim, the thermometer tops out around 100) and hold roughly 60–90 seconds; stopping below ~90 °C leaves starch under-gelatinised (thin), stopping below 60 s at boil leaves amylase active (weeps later), holding more than ~3 minutes scorches. If the student scrambled it, ask them what the temperature difference between the milk and the yolks was at the moment they met. Don't give the target temperature; ask what starch needs to swell and what happens to eggs at that temperature without a chaperone (sugar/starch).`,
  },
  {
    id: "assembly",
    index: 6,
    title: "Assemble the cake",
    short: "Assemble",
    eyebrow: "Stage 6 · Architecture",
    objective:
      "Stack pastry and cream into a cake with the structure of the style you chose.",
    task: [
      "Add layers one at a time: pastry, then cream, then pastry…",
      "Choose a cream thickness that matches your style.",
      "Finish the top, then press Check assembly.",
    ],
    science: [
      {
        heading: "Layer ratio",
        body: "French style: three thick pastry sheets with two generous cream layers, so the pastry stays the star. Russian style: eight or more thin sheets with thin, even cream so the whole thing eats like a tender cake. The ratio of cream surface area to pastry decides how much moisture will migrate during resting.",
      },
      {
        heading: "Crumb topping",
        body: "Trimmings from the baked sheets are crushed into the crumbs pressed over the top and sides. It's not just decoration: crumbs absorb surface moisture and hide uneven edges.",
      },
      {
        heading: "Pressing",
        body: "A gentle press with a board after stacking removes air gaps so the cake cuts cleanly, but pressing hard shatters the leaves.",
      },
    ],
    suggestedQuestions: [
      "How many layers should a Napoleon have?",
      "Why do people put crumbs on top?",
      "Should the top layer be pastry or cream?",
    ],
    tutorNotes: `Targets depend on the student's chosen style (in context). French: 3 pastry sheets alternating with 2 cream layers, cream 'thick', top can be pastry (glazed) or cream. Russian: 6–10 pastry sheets alternating with cream, cream 'thin' or 'medium', crumb top. Common errors: two cream layers touching (no pastry between), starting or ending with cream on the bottom, wildly mismatched thickness for the style. Ask them what each layer's job is and whether cream-on-cream has any structure.`,
  },
  {
    id: "rest",
    index: 7,
    title: "Rest and set",
    short: "Rest",
    eyebrow: "Stage 7 · Moisture migration",
    objective:
      "Decide how long the cake rests before serving, based on the texture you're aiming for.",
    task: [
      "Slide the rest time and watch the crispness and cohesion curves.",
      "Pick a time that matches your style, then press Check rest.",
    ],
    science: [
      {
        heading: "Water moves toward dryness",
        body: "Pastry cream is ~70% water; baked pastry is ~5%. Left together, water diffuses from cream into pastry along the concentration gradient. Within hours the pastry softens; overnight it becomes tender and the layers fuse into a sliceable cake. Crispness and cohesion are the same variable, running in opposite directions.",
      },
      {
        heading: "Cold slows everything",
        body: "Resting in the fridge slows diffusion and keeps the cream food-safe. Starch in the cream also retrogrades slightly when cold, firming the layers so slices hold their edges.",
      },
    ],
    suggestedQuestions: [
      "Why does a Russian Napoleon rest overnight?",
      "How do I keep a mille-feuille crisp?",
      "Is it safe to leave the cake out at room temperature?",
    ],
    tutorNotes: `Targets: French style 0–3 hours (serve soon; best within 2 hours). Russian style 8–24 hours chilled (12 is ideal). Room temperature rest for more than 2 hours is a food-safety issue (egg custard). Ask what happens to water sitting next to something dry, and whether their chosen style wants that.`,
  },
  {
    id: "serve",
    index: 8,
    title: "Slice and serve",
    short: "Serve",
    eyebrow: "Stage 8 · The reveal",
    objective:
      "Cut clean slices that show off the layers, and plate them well.",
    task: [
      "Pick a knife and a cutting motion.",
      "Choose a portion size and a finishing touch.",
      "Press Serve to reveal your cake and get your lab summary.",
    ],
    science: [
      {
        heading: "Why serrated, why sawing",
        body: "Flaky pastry is a stack of brittle sheets. A straight edge pushed downward compresses them and squeezes cream out the sides. A serrated blade drawn back and forth cuts each leaf in turn with almost no downward force. Wiping the blade between cuts keeps cream from smearing the next slice.",
      },
      {
        heading: "Temperature at service",
        body: "A slice straight from the fridge is firm and easy to cut but muted in flavour. Ten minutes at room temperature lets the butter in the pastry and the vanilla in the cream come forward.",
      },
    ],
    suggestedQuestions: [
      "What's the cleanest way to cut a Napoleon?",
      "Should I dust it with icing sugar or use fondant stripes?",
      "How long does a Napoleon keep?",
    ],
    tutorNotes: `Targets: serrated knife, sawing motion, wipe between cuts. Portion: rectangular slices about 4×8 cm (any reasonable choice). Finish: powdered sugar or crumbs are classic; fondant stripes are classic for French style. Celebrate the finish; offer a short reflective question about what they'd change next time.`,
  },
];

export const STAGE_BY_ID: Record<StageId, Stage> = Object.fromEntries(
  STAGES.map((s) => [s.id, s]),
) as Record<StageId, Stage>;

/* ------------------------------------------------------------------ */
/* Pantry                                                              */
/* ------------------------------------------------------------------ */

export type ListKey = "pastry" | "cream";

export interface Ingredient {
  id: string;
  name: string;
  detail: string;
  emoji: string;
  color: string;
  /** Which list(s) this ingredient legitimately belongs to */
  correctFor: ListKey[];
  /** Whether it's fine but optional (doesn't count against the student) */
  optionalFor?: ListKey[];
  /** Shown after checking when the item is misplaced. A nudge, not an answer. */
  nudge: string;
}

export const PANTRY: Ingredient[] = [
  { id: "ap-flour", name: "All-purpose flour", detail: "~10.5% protein", emoji: "🌾", color: "#efe4cf", correctFor: ["pastry"], optionalFor: ["cream"], nudge: "Think about how much gluten structure each preparation needs." },
  { id: "bread-flour", name: "Bread flour", detail: "~12.5% protein", emoji: "🍞", color: "#e6d3ad", correctFor: [], optionalFor: ["pastry"], nudge: "More protein means more elasticity. Is that a friend or an enemy when you roll thin sheets?" },
  { id: "cake-flour", name: "Cake flour", detail: "~8% protein", emoji: "🎂", color: "#f8f1e3", correctFor: [], nudge: "Very low protein makes tender crumb. Can a tender dough hold a sheet of butter without tearing?" },
  { id: "self-rising", name: "Self-rising flour", detail: "flour + leavening + salt", emoji: "🥄", color: "#efe7d6", correctFor: [], nudge: "What's already mixed into this flour, and does the pastry want it?" },
  { id: "euro-butter", name: "Cold European butter", detail: "84% fat, unsalted", emoji: "🧈", color: "#f6d76b", correctFor: ["pastry", "cream"], nudge: "Consider fat vs water content and what each does in the oven." },
  { id: "butter", name: "Cold unsalted butter", detail: "80% fat", emoji: "🧈", color: "#f4de8c", correctFor: [], optionalFor: ["pastry", "cream"], nudge: "Fine, though slightly more water than its European cousin. Which list did you put it on?" },
  { id: "margarine", name: "Margarine", detail: "~70% fat, softer", emoji: "🟡", color: "#f5e6a1", correctFor: [], nudge: "What happens to a softer, wetter fat when it's rolled thin and then heated?" },
  { id: "ice-water", name: "Ice water", detail: "~2 °C", emoji: "🧊", color: "#dbeeff", correctFor: ["pastry"], nudge: "Water is needed somewhere. Think about the temperature the butter needs to stay at." },
  { id: "warm-water", name: "Warm water", detail: "~40 °C", emoji: "♨️", color: "#ffe1cc", correctFor: [], nudge: "Warm water speeds gluten and does something to butter nearby. Is that what you want?" },
  { id: "salt", name: "Fine sea salt", detail: "", emoji: "🧂", color: "#f3f3f3", correctFor: ["pastry"], optionalFor: ["cream"], nudge: "Salt does more than season: it tightens gluten slightly. Which preparation benefits?" },
  { id: "vinegar", name: "White vinegar", detail: "a teaspoon", emoji: "🫙", color: "#eef3e6", correctFor: [], optionalFor: ["pastry"], nudge: "Acid relaxes gluten. Where would that help?" },
  { id: "baking-powder", name: "Baking powder", detail: "chemical leavener", emoji: "🥫", color: "#fbe9e0", correctFor: [], nudge: "Ask yourself what makes puff pastry puff. Is it a chemical reaction or something physical?" },
  { id: "yeast", name: "Instant yeast", detail: "biological leavener", emoji: "🦠", color: "#eadfc9", correctFor: [], nudge: "Yeast makes croissant dough breadlike. Is a Napoleon breadlike?" },
  { id: "milk", name: "Whole milk", detail: "3.5% fat", emoji: "🥛", color: "#fbfbf7", correctFor: ["cream"], nudge: "Something has to carry the water and proteins that the custard sets in." },
  { id: "heavy-cream", name: "Heavy cream", detail: "36% fat", emoji: "🍶", color: "#fdf8ec", correctFor: [], optionalFor: ["cream"], nudge: "Rich, but does the base custard need this much fat, or is it a later upgrade?" },
  { id: "yolks", name: "Egg yolks", detail: "protein + lecithin", emoji: "🥚", color: "#ffd86b", correctFor: ["cream"], nudge: "Which part of the egg brings richness and emulsifiers?" },
  { id: "whites", name: "Egg whites", detail: "mostly albumin", emoji: "⚪", color: "#f7f7f2", correctFor: [], nudge: "Whites set firm and rubbery. Is that the texture of a custard?" },
  { id: "sugar", name: "Granulated sugar", detail: "", emoji: "🍬", color: "#ffffff", correctFor: ["cream"], nudge: "Beyond sweetness, sugar changes how proteins set. Where does that matter?" },
  { id: "cornstarch", name: "Cornstarch", detail: "pure starch", emoji: "🌽", color: "#fff6dc", correctFor: ["cream"], nudge: "Something must thicken the custard so it can be sliced. What swells in hot liquid?" },
  { id: "vanilla", name: "Vanilla", detail: "bean or extract", emoji: "🌿", color: "#e9d7c3", correctFor: ["cream"], nudge: "Aroma belongs where it can infuse into something warm and fatty." },
  { id: "gelatin", name: "Gelatin", detail: "sheets", emoji: "🍮", color: "#f5e9d5", correctFor: [], nudge: "Gelatin makes a different family of creams. Does a classic pastry cream need it?" },
  { id: "chocolate", name: "Dark chocolate", detail: "70%", emoji: "🍫", color: "#5b3a2a", correctFor: [], nudge: "A delicious variation, but we're building the classic first." },
];

export const PANTRY_BY_ID: Record<string, Ingredient> = Object.fromEntries(
  PANTRY.map((p) => [p.id, p]),
);

export const REQUIRED: Record<ListKey, string[][]> = {
  // Each inner array is a slot; any one of the ids satisfies it.
  pastry: [["ap-flour", "bread-flour"], ["euro-butter", "butter"], ["ice-water"], ["salt"]],
  cream: [["milk"], ["yolks"], ["sugar"], ["cornstarch", "ap-flour"], ["vanilla"], ["euro-butter", "butter"]],
};

/* ------------------------------------------------------------------ */
/* Style                                                               */
/* ------------------------------------------------------------------ */

export type CakeStyle = "french" | "russian";

export const STYLE_INFO: Record<CakeStyle, { name: string; blurb: string; sheets: string; rest: string }> = {
  french: {
    name: "French mille-feuille",
    blurb: "Three crisp sheets, thick cream, served within hours.",
    sheets: "3 sheets",
    rest: "Serve within ~2 hours",
  },
  russian: {
    name: "Russian Napoleon",
    blurb: "Many thin sheets, thin cream, rested overnight until tender.",
    sheets: "8+ sheets",
    rest: "Rest 8–24 hours",
  },
};
