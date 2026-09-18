"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontal, Sparkles, Square, Trash2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TutorAvatar } from "./TutorAvatar";
import { useTutor } from "./useTutor";
import { cn } from "@/lib/utils";

export function TutorPanel() {
  const { messages, status, mode, send, stop, clear, suggested } = useTutor();
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const submit = () => {
    if (!draft.trim() || status !== "idle") return;
    send(draft);
    setDraft("");
    inputRef.current?.focus();
  };

  return (
    <aside className="flex h-full flex-col bg-paper" aria-label="Tutor chat">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <TutorAvatar status={status} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-ink">Pip</h2>
            <Badge tone={mode === "offline" ? "rose" : "sage"}>
              {mode === "offline" ? (
                <>
                  <WifiOff className="size-3" /> offline
                </>
              ) : (
                <>
                  <Sparkles className="size-3" /> tutor
                </>
              )}
            </Badge>
          </div>
          <p className="truncate text-xs text-ink-3">
            {status === "thinking" ? "Thinking it over…" : status === "talking" ? "Answering…" : "Guides without spoiling. Ask anything."}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={clear} title="Clear conversation" aria-label="Clear conversation">
          <Trash2 />
        </Button>
      </header>

      <div ref={listRef} className="nice-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "rounded-br-md bg-caramel text-white"
                  : m.scripted
                    ? "rounded-bl-md border border-dashed border-line bg-cream/70 text-ink-2"
                    : "rounded-bl-md bg-cream-2 text-ink",
              )}
            >
              {m.content ? <RichText text={m.content} /> : <span className="inline-block h-4 w-14 animate-pulse rounded bg-line" />}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-line px-4 pt-3 pb-4">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {suggested.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              disabled={status !== "idle"}
              className="rounded-full border border-line bg-paper px-2.5 py-1 text-left text-[11px] text-ink-2 transition hover:border-caramel/50 hover:bg-butter-2/50 hover:text-ink disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2 rounded-2xl border border-line bg-cream/60 p-1.5 focus-within:border-caramel/50">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            placeholder="Ask Pip a question… (Enter to send)"
            className="nice-scroll max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-ink placeholder:text-ink-3 focus:outline-none"
          />
          {status === "idle" ? (
            <Button size="icon" onClick={submit} disabled={!draft.trim()} aria-label="Send">
              <SendHorizontal />
            </Button>
          ) : (
            <Button size="icon" variant="secondary" onClick={stop} aria-label="Stop">
              <Square />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}

/** Tiny renderer: paragraphs, bullets, **bold**. Enough for a tutor, no markdown dependency. */
function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-2">
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        const isList = lines.length > 1 && lines.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l));
        if (isList) {
          return (
            <ul key={i} className="ml-4 list-disc space-y-0.5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*([-*•]|\d+[.)])\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{inline(b)}</p>;
      })}
    </div>
  );
}

function inline(s: string) {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}
