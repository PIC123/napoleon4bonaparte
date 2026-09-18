import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in · Napoleon Lab",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Only allow same-site relative redirects.
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/lab";

  return (
    <div className="paper-grain flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-butter text-lg shadow-soft">🥐</span>
          <span className="font-display text-xl font-semibold text-ink">Napoleon Lab</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-24">
        <div className="w-full max-w-md rounded-3xl border border-line bg-paper p-8 shadow-lift">
          <span className="inline-flex rounded-full border border-line bg-cream px-3 py-1 text-xs font-semibold uppercase tracking-wide text-caramel-2">
            Invite only
          </span>
          <h1 className="font-display mt-4 text-3xl font-semibold leading-tight text-ink">Welcome to the bench</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            This lab is open to invited students. Enter the shared password to come in.
          </p>
          <div className="mt-6">
            <LoginForm next={target} />
          </div>
          <p className="mt-5 text-xs text-ink-3">Don&apos;t have the password? Ask whoever invited you.</p>
        </div>
      </main>
    </div>
  );
}
