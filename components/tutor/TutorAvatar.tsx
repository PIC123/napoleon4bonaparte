"use client";

import type { TutorStatus } from "./useTutor";
import { cn } from "@/lib/utils";

/**
 * Pip: a small butter-pat character in a chef's hat. Pure SVG + CSS, so it
 * costs nothing and animates while the model is thinking or streaming.
 */
export function TutorAvatar({ status, size = 56, className }: { status: TutorStatus; size?: number; className?: string }) {
  const talking = status === "talking";
  const thinking = status === "thinking";
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 64 64" width={size} height={size} className="avatar-bob overflow-visible">
        {/* shadow */}
        <ellipse cx="32" cy="60" rx="16" ry="3" fill="rgba(42,36,32,0.12)" />
        {/* body */}
        <rect x="12" y="24" width="40" height="32" rx="12" fill="#f4cf5a" />
        <rect x="12" y="24" width="40" height="32" rx="12" fill="url(#pipShine)" />
        {/* cheeks */}
        <circle cx="22" cy="44" r="3" fill="#f2a56b" opacity="0.7" />
        <circle cx="42" cy="44" r="3" fill="#f2a56b" opacity="0.7" />
        {/* eyes */}
        <g className="avatar-eye">
          <circle cx="25" cy="38" r="2.6" fill="#2a2420" />
          <circle cx="39" cy="38" r="2.6" fill="#2a2420" />
          <circle cx="26" cy="37" r="0.9" fill="#fff" />
          <circle cx="40" cy="37" r="0.9" fill="#fff" />
        </g>
        {/* mouth */}
        {talking ? (
          <ellipse cx="32" cy="47" rx="3.2" ry="2.4" fill="#2a2420" className="avatar-mouth-talk" />
        ) : (
          <path d="M28 46 Q32 50 36 46" stroke="#2a2420" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        )}
        {/* chef's hat */}
        <rect x="18" y="16" width="28" height="9" rx="2.5" fill="#fff" stroke="#e7dfd2" strokeWidth="1" />
        <circle cx="22" cy="13" r="7" fill="#fff" stroke="#e7dfd2" strokeWidth="1" />
        <circle cx="32" cy="10" r="8" fill="#fff" stroke="#e7dfd2" strokeWidth="1" />
        <circle cx="42" cy="13" r="7" fill="#fff" stroke="#e7dfd2" strokeWidth="1" />
        <rect x="19" y="15" width="26" height="6" fill="#fff" />
        <defs>
          <linearGradient id="pipShine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      {thinking && (
        <div className="absolute -right-1 -top-1 flex gap-0.5 rounded-full border border-line bg-paper px-1.5 py-1 shadow-soft">
          <span className="avatar-dot size-1.5 rounded-full bg-caramel" />
          <span className="avatar-dot size-1.5 rounded-full bg-caramel" />
          <span className="avatar-dot size-1.5 rounded-full bg-caramel" />
        </div>
      )}
    </div>
  );
}
