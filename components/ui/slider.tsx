"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  hint?: string;
  format?: (v: number) => string;
  onChange: (v: number) => void;
  disabled?: boolean;
  className?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  hint,
  format,
  onChange,
  disabled,
  className,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const id = React.useId();
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        <span className="font-mono text-xs text-ink-2 tabular-nums">
          {format ? format(value) : `${value}${unit}`}
        </span>
      </div>
      <input
        id={id}
        type="range"
        className="lab-range"
        style={{ ["--pct" as string]: `${pct}%` }}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint && <p className="text-xs text-ink-3">{hint}</p>}
    </div>
  );
}
