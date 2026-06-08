import { NextRequest, NextResponse } from "next/server";

import { verifySessionToken, SESSION_COOKIE } from "@/lib/session-token";

const publicPaths = [
  "/login",
  "/signup",
  "/password-reset",
];

const publicApiPrefixes = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/password-reset",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  const isPublicPage = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const isPublicApi = publicApiPrefixes.some((path) => pathname.startsWith(path));

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = session ? "/dashboard" : "/login";
    return NextResponse.redirect(url);
  }

  if (session && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (!session && !isPublicPage && !isPublicApi) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
