import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/src/lib/auth/session";

// Next.js 16 Proxy is the request guard convention that replaces middleware.ts.
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/admin/login" || path === "/api/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (token && (await verifyAdminToken(token))) return NextResponse.next();

  if (path.startsWith("/api/admin/")) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("returnTo", path);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
