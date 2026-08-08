import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/auth.config";

const { auth } = NextAuth(authConfig);

/**
 * Next.js 16: `middleware.ts` renamed to `proxy.ts`.
 * Protects /admin/* (except login) with Auth.js JWT session.
 */
export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isLogin = req.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isLogin && !req.auth) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (isLogin && req.auth) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
