/**
 * Shared-password access gate.
 *
 * One password lives in LAB_PASSWORD. A successful login sets an HttpOnly
 * cookie whose value is an HMAC of a fixed message keyed by the password, so
 * changing the password in Vercel invalidates every existing session. Uses
 * Web Crypto only, so the same code runs in proxy.ts and in route handlers.
 *
 * If LAB_PASSWORD is unset the gate is off (handy for local development).
 */

export const AUTH_COOKIE = "napoleon_lab_session";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function gateEnabled(): boolean {
  return Boolean(process.env.LAB_PASSWORD);
}

async function hmac(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sessionToken(): Promise<string> {
  return hmac(process.env.LAB_PASSWORD ?? "", "napoleon-lab-session-v1");
}

/** Constant-time string comparison so timing doesn't leak the password. */
export function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export async function passwordMatches(candidate: string): Promise<boolean> {
  const expected = process.env.LAB_PASSWORD ?? "";
  if (!expected) return false;
  // Compare HMACs rather than raw strings so lengths don't leak either.
  const [a, b] = await Promise.all([hmac("napoleon-lab-compare", candidate), hmac("napoleon-lab-compare", expected)]);
  return safeEqual(a, b);
}

export async function isValidSession(cookieValue: string | undefined): Promise<boolean> {
  if (!gateEnabled()) return true;
  if (!cookieValue) return false;
  return safeEqual(cookieValue, await sessionToken());
}
