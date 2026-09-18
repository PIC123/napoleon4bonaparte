import * as React from "react";
import { cn } from "@/lib/utils";
import { FlaskConical, Lightbulb, AlertTriangle, CheckCircle2 } from "lucide-react";

type Tone = "science" | "hint" | "warn" | "success";

const styles: Record<Tone, { box: string; icon: React.ReactNode; label: string }> = {
  science: {
    box: "border-sky/30 bg-sky-2/60 text-ink",
    icon: <FlaskConical className="size-4 text-sky" />,
    label: "The science",
  },
  hint: {
    box: "border-butter/60 bg-butter-2/50 text-ink",
    icon: <Lightbulb className="size-4 text-caramel-2" />,
    label: "Hint",
  },
  warn: {
    box: "border-rose/30 bg-rose-2/60 text-ink",
    icon: <AlertTriangle className="size-4 text-rose" />,
    label: "Careful",
  },
  success: {
    box: "border-sage/30 bg-sage-2/70 text-ink",
    icon: <CheckCircle2 className="size-4 text-sage" />,
    label: "Nice work",
  },
};

export function Callout({
  tone,
  title,
  children,
  className,
}: {
  tone: Tone;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const s = styles[tone];
  return (
    <div className={cn("rounded-xl border px-3.5 py-3 text-sm leading-relaxed", s.box, className)}>
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-2">
        {s.icon}
        {title ?? s.label}
      </div>
      <div>{children}</div>
    </div>
  );
}
