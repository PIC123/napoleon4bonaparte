"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace(next);
        router.refresh();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Something went wrong. Try again.");
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-ink">Access password</span>
        <div className="flex items-center gap-2 rounded-xl border border-line bg-cream/60 px-3 focus-within:border-caramel/60">
          <KeyRound className="size-4 shrink-0 text-ink-3" />
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter the password you were given"
            className="h-11 w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
          />
        </div>
      </label>
      {error && (
        <p role="alert" className="rounded-xl border border-rose/30 bg-rose-2/60 px-3 py-2 text-sm text-ink">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={!password || busy}>
        {busy ? "Checking…" : "Enter the lab"} <ArrowRight />
      </Button>
    </form>
  );
}
