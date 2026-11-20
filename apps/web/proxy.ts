import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "admino_session";

// Optimistic redirects only. The API checks the session on every request.
export function proxy(request: NextRequest) {
  const signedIn = request.cookies.has(SESSION_COOKIE);
  const { pathname } = request.nextUrl;
  if (!signedIn && pathname.startsWith("/app")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (signedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/app", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login", "/register"],
};
