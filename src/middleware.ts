import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isLogin = req.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isLogin && !req.auth) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (isLogin && req.auth) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
