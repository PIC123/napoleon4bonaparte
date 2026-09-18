import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, gateEnabled, isValidSession } from "@/lib/auth";

/**
 * Gate the lab and the tutor API behind the shared password. The landing
 * page and the login page stay public.
 */
export async function proxy(request: NextRequest) {
  if (!gateEnabled()) return NextResponse.next();

  const cookie = request.cookies.get(AUTH_COOKIE)?.value;
  const ok = await isValidSession(cookie);
  if (ok) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Sign in to use the lab." }, { status: 401 });
  }
  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname + search);
  // A cookie that exists but doesn't verify means the password was rotated (or tampered).
  if (cookie) login.searchParams.set("reason", "session");
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/lab/:path*", "/api/tutor/:path*"],
};
