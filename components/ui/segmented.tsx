"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface SegmentedProps<T extends string> {
  label?: string;
  value: T | null;
  options: Option<T>[];
  onChange: (v: T) => void;
  columns?: 2 | 3;
  className?: string;
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  columns = 2,
  className,
}: SegmentedProps<T>) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <p className="text-sm font-medium text-ink">{label}</p>}
      <div
        className={cn(
          "grid gap-2",
          columns === 3 ? "grid-cols-3" : "grid-cols-2",
        )}
        role="radiogroup"
        aria-label={label}
      >
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left transition-all",
                active
                  ? "border-caramel bg-butter-2/70 shadow-soft"
                  : "border-line bg-paper hover:border-caramel/40 hover:bg-cream-2",
              )}
            >
              <div className="text-sm font-medium text-ink">{o.label}</div>
              {o.description && (
                <div className="text-[11px] leading-snug text-ink-3">
                  {o.description}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
