import { AUTH_COOKIE, COOKIE_MAX_AGE, gateEnabled, passwordMatches, sessionToken } from "@/lib/auth";

export const runtime = "nodejs";

const attempts = new Map<string, { count: number; reset: number }>();
const LIMIT = { windowMs: 15 * 60 * 1000, max: 10 };

function tooManyAttempts(req: Request): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || a.reset < now) {
    attempts.set(ip, { count: 1, reset: now + LIMIT.windowMs });
    return false;
  }
  a.count += 1;
  return a.count > LIMIT.max;
}

export async function POST(req: Request) {
  if (!gateEnabled()) {
    return Response.json({ ok: true, note: "Gate is disabled: LAB_PASSWORD is not set." });
  }
  if (tooManyAttempts(req)) {
    return Response.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!(await passwordMatches(password))) {
    return Response.json({ error: "That password isn't right." }, { status: 401 });
  }

  const token = await sessionToken();
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `${AUTH_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}${secure}`,
    },
  });
}
