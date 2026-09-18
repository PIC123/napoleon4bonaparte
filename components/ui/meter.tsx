import { cn } from "@/lib/utils";

interface MeterProps {
  label: string;
  value: number; // 0..1
  display?: string;
  tone?: "caramel" | "sage" | "rose" | "sky";
  className?: string;
}

const tones = {
  caramel: "bg-caramel",
  sage: "bg-sage",
  rose: "bg-rose",
  sky: "bg-sky",
};

export function Meter({ label, value, display, tone = "caramel", className }: MeterProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-xs">
        <span className="text-ink-2">{label}</span>
        <span className="font-mono text-ink-3 tabular-nums">{display ?? `${pct}%`}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-cream-2">
        <div
          className={cn("h-full rounded-full transition-all duration-500", tones[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
