import { NextRequest, NextResponse } from "next/server";

const userSessionCookies = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

function hasUserSession(request: NextRequest) {
  return userSessionCookies.some((cookieName) =>
    Boolean(request.cookies.get(cookieName)?.value),
  );
}

function hasAdminSession(request: NextRequest) {
  return Boolean(request.cookies.get("admin_token")?.value);
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userIsSignedIn = hasUserSession(request);
  const adminIsSignedIn = hasAdminSession(request);

  if (
    pathname.startsWith("/dashboard") ||
    pathname === "/subscriptionPage"
  ) {
    if (!userIsSignedIn) {
      const response = redirectTo(request, "/auth/login");
      response.headers.set("x-paycollect-protection", "user-auth-required");
      return response;
    }
  }

  if (pathname.startsWith("/admin/dashboard") && !adminIsSignedIn) {
    const response = redirectTo(request, "/admin/auth/login");
    response.headers.set("x-paycollect-protection", "admin-auth-required");
    return response;
  }

  if (
    (pathname === "/admin/auth/login" || pathname === "/admin/auth/signup") &&
    adminIsSignedIn
  ) {
    return redirectTo(request, "/admin/dashboard");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
