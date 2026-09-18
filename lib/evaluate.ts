import {
  PANTRY_BY_ID,
  REQUIRED,
  type ListKey,
  type CakeStyle,
} from "./curriculum";
import type { LabState, Feedback } from "./store";

type Result = Omit<Feedback, "attempts">;

/* ---------------- Stage 1: pantry ---------------- */

export function evaluatePantry(lists: LabState["lists"]): Result {
  const points: string[] = [];
  let ok = true;

  (["pastry", "cream"] as ListKey[]).forEach((list) => {
    const chosen = lists[list];
    const label = list === "pastry" ? "Pastry list" : "Cream list";

    // Missing slots
    const missing = REQUIRED[list].filter((slot) => !slot.some((id) => chosen.includes(id)));
    if (missing.length) {
      ok = false;
      points.push(
        `${label}: something essential is still missing (${missing.length} ${missing.length === 1 ? "job" : "jobs"} unfilled). Think about what each preparation needs to do: structure, fat, water, seasoning for the pastry; liquid, richness, sweetness, thickening, aroma for the cream.`,
      );
    }

    // Wrong items
    const wrong = chosen.filter((id) => {
      const ing = PANTRY_BY_ID[id];
      return !ing.correctFor.includes(list) && !(ing.optionalFor ?? []).includes(list);
    });
    if (wrong.length) {
      ok = false;
      wrong.slice(0, 3).forEach((id) => {
        const ing = PANTRY_BY_ID[id];
        points.push(`${label} · ${ing.name}: ${ing.nudge}`);
      });
      if (wrong.length > 3) points.push(`${label}: …and ${wrong.length - 3} more to reconsider.`);
    }

    // Optional-but-fine items get a gentle note
    const optional = chosen.filter((id) => {
      const ing = PANTRY_BY_ID[id];
      return !ing.correctFor.includes(list) && (ing.optionalFor ?? []).includes(list);
    });
    if (optional.length && !wrong.length && !missing.length) {
      points.push(
        `${label}: ${optional.map((id) => PANTRY_BY_ID[id].name).join(", ")} ${optional.length === 1 ? "is" : "are"} a legitimate choice, though not the textbook one. Worth asking Pip why.`,
      );
    }
  });

  if (ok && points.length === 0) {
    points.push("Both lists are lean and correct. Your mise en place is done.");
  }
  return {
    ok,
    title: ok ? "Lists look good" : "Not quite. Keep thinking about what each item does.",
    points,
  };
}

/* ---------------- Stage 2: détrempe ---------------- */

export function evaluateDetrempe(s: Pick<LabState, "hydration" | "mixMinutes" | "restMinutes">): Result {
  const points: string[] = [];
  let ok = true;

  if (s.hydration < 45) {
    ok = false;
    points.push("The dough is cracking at the edges as it's rolled. Something in the balance of flour to water isn't right for a sheet that needs to stretch.");
  } else if (s.hydration > 55) {
    ok = false;
    points.push("The dough is sticking to the bench and smearing. Puff pastry dough is drier than you might expect. Picture a bread dough and go the other way.");
  }

  if (s.mixMinutes > 3) {
    ok = false;
    points.push("The dough springs back every time it's rolled. Ask yourself what long mixing does to gluten, and whether elasticity helps when you need thin, flat sheets.");
  } else if (s.mixMinutes < 1) {
    ok = false;
    points.push("There are dry pockets of flour that never hydrated. It needs a little more mixing, but only a little.");
  }

  if (s.restMinutes < 30) {
    ok = false;
    points.push("It's fighting the rolling pin. There's a step that relaxes the dough and matches its temperature to the butter. How long does that take?");
  }

  if (ok) points.push("Hydrated, barely mixed, and rested. This détrempe will roll like a dream.");
  return { ok, title: ok ? "The détrempe is ready" : "The dough isn't cooperating yet", points };
}

/* ---------------- Stage 3: lamination ---------------- */

export function evaluateLamination(s: Pick<LabState, "butterLayers" | "laminationFault" | "foldLog" | "butterTemp">): Result {
  const points: string[] = [];
  let ok = true;

  if (s.laminationFault === "melted") {
    ok = false;
    points.push("The butter went soft and disappeared into the dough. The layers are gone. Before you reset, think about what a sheet of butter needs in order to stay a sheet while you work.");
  } else if (s.laminationFault === "cracked") {
    ok = false;
    points.push("The butter shattered into shards when it was rolled. Cold is good, but there's a floor as well as a ceiling. What state does butter need to be in to bend?");
  }

  if (!s.laminationFault) {
    if (s.butterLayers < 240) {
      ok = false;
      points.push(
        `You have ${s.butterLayers} butter layers. That would bake into something coarse and bready. Layers multiply with each fold: how many more folds would put you in the hundreds?`,
      );
    } else if (s.butterLayers > 1100) {
      ok = false;
      points.push(
        `You have ${s.butterLayers.toLocaleString()} layers. At that point each butter sheet is thinner than the dough can protect, and they merge. Fewer folds, not more.`,
      );
    }
    if (s.foldLog.length >= 2) {
      const hot = s.foldLog.filter((f) => f.tempBefore > 17).length;
      if (hot >= 2 && ok) {
        points.push("You got there, but a couple of folds happened with the butter warmer than ideal. In a real kitchen those would be the folds that leak in the oven.");
      }
    }
  }

  if (ok && points.length === 0) {
    points.push(
      `${s.butterLayers} butter layers, kept cold and plastic the whole way. That's textbook lamination.`,
    );
  }
  return { ok, title: ok ? "Beautiful lamination" : "The layers aren't there yet", points };
}

/* ---------------- Stage 4: bake ---------------- */

export function evaluateBake(s: Pick<LabState, "ovenTemp" | "bakeMinutes" | "docked" | "weighted" | "bakeRun">): Result {
  const points: string[] = [];
  let ok = true;

  if (!s.bakeRun) {
    return { ok: false, title: "Nothing has gone in the oven yet", points: ["Run the bake first, then check the result."] };
  }

  if (s.ovenTemp < 180) {
    ok = false;
    points.push("The sheet is pale, flat and sitting in a puddle of melted butter. Think about the race between two things happening to the butter as it heats: which one has to win?");
  } else if (s.ovenTemp > 230) {
    ok = false;
    points.push("The surface has gone dark and bitter while the middle stayed doughy. Heat has to travel through the sheet before the outside burns.");
  }

  const bakeResult = bakeOutcome(s);
  if (bakeResult.doneness < 0.75 && s.ovenTemp >= 180 && s.ovenTemp <= 230) {
    ok = false;
    points.push("The centre is still soft and pale. Colour is a signal of flavour and dryness; this sheet wants more time.");
  } else if (bakeResult.doneness > 1.25) {
    ok = false;
    points.push("Past golden into dark brown. The Maillard reaction has a sweet spot and this went beyond it.");
  }

  if (!s.docked || !s.weighted) {
    ok = false;
    points.push(
      "It puffed unevenly, tall in the middle and low at the edges. That's a lovely vol-au-vent, but you need to stack these. Two techniques control the rise; are you using both?",
    );
  }

  if (ok) points.push("Flat, even, deep golden, and crisp all the way through. Perfect building material.");
  return { ok, title: ok ? "Sheets are golden and even" : "Not a sheet you can build with yet", points };
}

/** Physical-ish model of the bake used by both the 3D scene and the checker. */
export function bakeOutcome(s: Pick<LabState, "ovenTemp" | "bakeMinutes" | "docked" | "weighted">) {
  // doneness ~1 means ideal. Hotter ovens finish faster.
  const rate = Math.max(0, (s.ovenTemp - 120) / 90); // 1.0 at 210 °C
  const doneness = (s.bakeMinutes / 24) * rate;
  // rise: strong between 190–230; weak below; weighted/docked flatten it.
  let rise = s.ovenTemp < 170 ? 0.25 : s.ovenTemp < 190 ? 0.55 : 1;
  if (s.docked) rise *= 0.7;
  if (s.weighted) rise *= 0.45;
  const evenness = (s.docked ? 0.5 : 0) + (s.weighted ? 0.5 : 0);
  const greasy = s.ovenTemp < 180;
  return { doneness, rise, evenness, greasy };
}

/* ---------------- Stage 5: cream ---------------- */

export function evaluateCream(s: Pick<LabState, "pourSpeed" | "creamPhase" | "scrambled" | "scorched" | "boilSeconds" | "creamTemp">): Result {
  const points: string[] = [];
  let ok = true;

  if (s.creamPhase !== "done") {
    return { ok: false, title: "The cream isn't finished", points: ["Work through tempering and cooking, then stop the heat and finish."] };
  }
  if (s.scrambled) {
    ok = false;
    points.push("Little flecks of cooked egg. When the hot milk met the yolks, what was the temperature gap, and how quickly did the yolks have to absorb it?");
  }
  if (s.scorched) {
    ok = false;
    points.push("It caught on the bottom of the pot. Once starch has done its job, more heat is only risk.");
  }
  if (!s.scrambled && !s.scorched) {
    if (s.creamTemp < 90) {
      ok = false;
      points.push("It's thin and tastes faintly chalky. Something in there needed to get hotter to fully swell.");
    } else if (s.boilSeconds < 45) {
      ok = false;
      points.push("It looks thick now, but this cream would weep into a puddle in the fridge overnight. Yolks carry an enzyme with an appetite for starch. What deactivates enzymes?");
    }
  }
  if (ok) points.push("Glossy, thick, and it holds a line when you drag a spoon through it. Chill it with film pressed onto the surface.");
  return { ok, title: ok ? "Silky crème pâtissière" : "The cream needs another go", points };
}

/* ---------------- Stage 6: assembly ---------------- */

export function evaluateAssembly(
  s: Pick<LabState, "layers" | "creamThickness" | "topping">,
  style: CakeStyle | null,
): Result {
  const points: string[] = [];
  let ok = true;
  const st = style ?? "russian";
  const pastryCount = s.layers.filter((l) => l === "pastry").length;

  if (s.layers.length === 0) {
    return { ok: false, title: "Nothing stacked yet", points: ["Add some layers first."] };
  }
  if (s.layers[0] !== "pastry") {
    ok = false;
    points.push("The cake is sitting on cream. What does the bottom layer need to do when you lift a slice?");
  }
  for (let i = 1; i < s.layers.length; i++) {
    if (s.layers[i] === "cream" && s.layers[i - 1] === "cream") {
      ok = false;
      points.push("Two cream layers are touching. Cream on cream has no structure; what separates them in every Napoleon you've seen?");
      break;
    }
    if (s.layers[i] === "pastry" && s.layers[i - 1] === "pastry") {
      ok = false;
      points.push("Two pastry sheets are stacked with nothing between them. They'll slide apart when cut.");
      break;
    }
  }
  if (st === "french") {
    if (pastryCount < 3) {
      ok = false;
      points.push("A mille-feuille has a specific number of pastry sheets. The name is a hint, but the classic is fewer than you'd think.");
    } else if (pastryCount > 4) {
      ok = false;
      points.push("That's a lot of sheets for a French-style cake. You've drifted toward the Russian tradition. Either is fine, but match your style.");
    }
    if (s.creamThickness === "thin" && ok) {
      points.push("Thin cream works, though a French mille-feuille usually shows off generous cream between its few sheets.");
    }
  } else {
    if (pastryCount < 6) {
      ok = false;
      points.push("A Russian Napoleon is about many thin sheets. This is still a mille-feuille. Keep going.");
    } else if (pastryCount > 12) {
      ok = false;
      points.push("You've built a tower. Beyond a certain point the cream can't soften that much pastry overnight.");
    }
    if (s.creamThickness === "thick") {
      ok = false;
      points.push("With this many sheets, thick cream makes a very tall, very rich cake that won't set into a clean slice. Think about the ratio.");
    }
  }
  if (s.layers[s.layers.length - 1] === "cream" && s.topping === "none") {
    points.push("The top is bare cream. Consider a finish that protects the surface and hides uneven edges.");
  }
  if (ok && points.length === 0) points.push("Alternating, well-proportioned, and finished. This is a cake.");
  return { ok, title: ok ? "Assembled" : "The structure needs work", points };
}

/* ---------------- Stage 7: rest ---------------- */

export function evaluateRest(s: Pick<LabState, "restHours" | "restLocation">, style: CakeStyle | null): Result {
  const points: string[] = [];
  let ok = true;
  const st = style ?? "russian";

  if (s.restLocation === "counter" && s.restHours > 2) {
    ok = false;
    points.push("An egg custard on the counter for that long is a food-safety problem, not just a texture one.");
  }
  if (st === "french") {
    if (s.restHours > 3) {
      ok = false;
      points.push("The crisp is gone. Water always moves toward dryness. For the style you chose, is that what you want?");
    }
  } else {
    if (s.restHours < 8) {
      ok = false;
      points.push("The layers still shatter and the slice falls apart. Give moisture time to travel. This style is patient.");
    } else if (s.restHours > 24) {
      ok = false;
      points.push("Now it's gone soggy and the cream has dulled. There's a window, and you passed it.");
    }
  }
  if (ok) points.push(st === "french" ? "Served while the leaves still shatter. Textbook mille-feuille." : "Rested until tender and sliceable. Textbook Napoleon.");
  return { ok, title: ok ? "Perfectly timed" : "The timing is off for your style", points };
}

/* ---------------- Stage 8: serve ---------------- */

export function evaluateServe(s: Pick<LabState, "knife" | "motion" | "portion" | "finish">): Result {
  const points: string[] = [];
  let ok = true;
  if (!s.knife || !s.motion || !s.portion || !s.finish) {
    return { ok: false, title: "A few decisions left", points: ["Choose a knife, a motion, a portion, and a finish."] };
  }
  if (s.knife === "chef") {
    ok = false;
    points.push("The slice squashed and cream oozed out the sides. Which blade cuts brittle layers one at a time?");
  }
  if (s.motion === "press") {
    ok = false;
    points.push("Downward pressure crushed the leaves. Think about how a blade can move without pushing down.");
  }
  if (ok) points.push("Clean edges, every layer visible. Take a bow.");
  return { ok, title: ok ? "Beautiful slices" : "The slices are messy", points };
}
