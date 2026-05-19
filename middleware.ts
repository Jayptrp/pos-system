import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isApiPage = req.nextUrl.pathname.startsWith("/api");
    const isAuthPage = req.nextUrl.pathname.startsWith("/login");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return null;
    }

    if (!isAuth) {
      if (isApiPage) {
        return NextResponse.json(
          { ok: false, error: { code: "UNAUTHORIZED", message: "Please log in" } },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => true, // middleware function above handles the logic
    },
  }
);

export const config = {
  matcher: [
    "/api/((?!auth).*)",
    "/categories/:path*",
    "/debug/:path*",
    "/orders/:path*",
    "/payments/:path*",
    "/inventory-logs/:path*",
  ],
};
