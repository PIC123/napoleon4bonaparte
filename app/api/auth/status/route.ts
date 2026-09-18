import { AUTH_COOKIE, gateEnabled, isValidSession } from "@/lib/auth";

export const runtime = "nodejs";

/** Reports whether the gate is on and whether this browser's cookie is valid. */
export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.split(/;\s*/).find((c) => c.startsWith(`${AUTH_COOKIE}=`));
  const value = match ? match.slice(AUTH_COOKIE.length + 1) : undefined;
  return Response.json(
    { gate: gateEnabled(), authenticated: await isValidSession(value) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
