import Link from "next/link";
import { ArrowRight, Box, FlaskConical, MessageCircleHeart, Sparkles } from "lucide-react";
import { STAGES } from "@/lib/curriculum";

export default function Home() {
  return (
    <div className="paper-grain min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-butter text-lg shadow-soft">🥐</span>
          <span className="font-display text-xl font-semibold text-ink">Napoleon Lab</span>
        </div>
        <Link
          href="/lab"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-caramel px-4 text-sm font-medium text-white shadow-soft transition hover:bg-caramel-2 hover:shadow-lift"
        >
          Enter the lab <ArrowRight className="size-4" />
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20">
        <section className="grid items-center gap-12 py-16 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-wide text-caramel-2">
              <Sparkles className="size-3.5" /> A virtual pastry laboratory
            </span>
            <h1 className="font-display mt-5 text-5xl font-semibold leading-[1.05] text-ink md:text-6xl">
              Learn to bake a Napoleon
              <br />
              <span className="text-caramel">by thinking like a chef.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2">
              Walk through a 3D kitchen bench from pantry to plate. Laminate butter into hundreds of layers, temper a
              custard without scrambling it, and find out why every step works. Pip, your AI tutor, guides you with
              questions, not answers.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/lab"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-caramel px-6 text-base font-medium text-white shadow-soft transition hover:bg-caramel-2 hover:shadow-lift"
              >
                Start the lab <ArrowRight className="size-4" />
              </Link>
              <span className="text-sm text-ink-3">About 30–40 minutes · works best on a laptop</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-line bg-paper p-6 shadow-lift">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-butter-2 text-xl">🧈</span>
                <div>
                  <div className="font-display text-lg font-semibold text-ink">Pip, your tutor</div>
                  <div className="text-xs text-ink-3">Guides without spoiling</div>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-caramel px-3.5 py-2.5 text-white">
                  My butter keeps melting into the dough. What am I doing wrong?
                </div>
                <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-cream-2 px-3.5 py-2.5 text-ink">
                  Your butter is sitting at 21 °C right now. Think about what butter is like at fridge temperature versus
                  on a warm counter: at which of those could you bend it into a sheet without it tearing or smearing?
                  What step in your sequence could bring it back to that state?
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-line bg-paper px-4 py-3 shadow-soft md:block">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">Butter layers</div>
              <div className="font-display text-3xl font-semibold text-ink">729</div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <Feature
            icon={<Box className="size-5 text-caramel" />}
            title="A real 3D bench"
            body="Every stage is a scene you can orbit: dough that slumps when it's too wet, butter that cracks when it's too cold, sheets that rise and colour in the oven."
          />
          <Feature
            icon={<FlaskConical className="size-5 text-sky" />}
            title="Science on demand"
            body="Gluten, steam expansion, the Maillard reaction, starch gelatinisation, amylase, moisture migration. Open the science drawer whenever you want the why."
          />
          <Feature
            icon={<MessageCircleHeart className="size-5 text-sage" />}
            title="A tutor who asks back"
            body="Pip sees your live settings and your last check, and answers with a question, a hint, or the mechanism, escalating only when you're stuck."
          />
        </section>

        <section className="mt-20">
          <h2 className="font-display text-3xl font-semibold text-ink">Nine stages, one cake</h2>
          <ol className="mt-6 grid gap-3 md:grid-cols-3">
            {STAGES.map((s) => (
              <li key={s.id} className="rounded-2xl border border-line bg-paper p-4 shadow-soft">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-cream-2 font-mono text-[11px] font-semibold text-caramel-2">
                    {s.index}
                  </span>
                  <span className="font-display text-base font-semibold text-ink">{s.title}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{s.objective}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-ink-3">
        Built with Next.js, React Three Fiber, and the Claude API. Set ANTHROPIC_API_KEY to bring Pip fully online.
      </footer>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper p-5 shadow-soft">
      <div className="flex size-10 items-center justify-center rounded-xl bg-cream-2">{icon}</div>
      <h3 className="font-display mt-3 text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{body}</p>
    </div>
  );
}
