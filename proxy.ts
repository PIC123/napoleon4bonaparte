import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, gateEnabled, isValidSession } from "@/lib/auth";

/**
 * Gate the lab and the tutor API behind the shared password. The landing
 * page and the login page stay public.
 */
export async function proxy(request: NextRequest) {
  if (!gateEnabled()) return NextResponse.next();

  const ok = await isValidSession(request.cookies.get(AUTH_COOKIE)?.value);
  if (ok) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Sign in to use the lab." }, { status: 401 });
  }
  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/lab/:path*", "/api/tutor/:path*"],
};
