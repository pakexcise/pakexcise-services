import { NextRequest, NextResponse } from "next/server";

import { authConfig, buildLoginRedirectUrl } from "@/config/auth";
import { applySecurityHeaders } from "@/server/security/headers";

/** Legacy bilingual URL prefixes — permanently redirect to clean English paths. */
const legacyLocalePrefixPattern = /^\/(en|ur)(\/.*)?$/;

const protectedRoutePrefixes = [
  authConfig.customerPathPrefix,
  authConfig.agentPathPrefix,
  authConfig.supportPathPrefix,
  authConfig.adminPathPrefix,
] as const;

function redirectLegacyLocalePrefix(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const match = legacyLocalePrefixPattern.exec(pathname);

  if (!match) {
    return null;
  }

  const cleanPath = match[2] ?? "/";
  const url = request.nextUrl.clone();
  url.pathname = cleanPath === "" ? "/" : cleanPath;

  return NextResponse.redirect(url, 308);
}

function withPathnameHeader(request: NextRequest): NextRequest {
  const headers = new Headers(request.headers);
  headers.delete("accept-language");
  headers.set("x-pakexcise-pathname", request.nextUrl.pathname);

  return new NextRequest(request.url, {
    method: request.method,
    headers,
  });
}

function hasAuthSessionCookie(request: NextRequest): boolean {
  return authConfig.sessionCookieNames.some((cookieName) =>
    Boolean(request.cookies.get(cookieName)?.value),
  );
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function protectPrivateRoutes(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  if (!isProtectedRoute(pathname)) {
    return null;
  }

  if (hasAuthSessionCookie(request)) {
    return null;
  }

  const loginUrl = request.nextUrl.clone();
  const redirectTarget = buildLoginRedirectUrl(pathname);
  const queryIndex = redirectTarget.indexOf("?");

  loginUrl.pathname = authConfig.loginPath;
  loginUrl.search =
    queryIndex >= 0 ? redirectTarget.slice(queryIndex + 1) : "";

  return NextResponse.redirect(loginUrl);
}

function preventAuthPageCaching(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const { pathname } = request.nextUrl;

  if (
    pathname.includes("/signup") ||
    pathname.includes("/login") ||
    pathname.includes("/auth")
  ) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate",
    );
  }

  return response;
}

function clearLegacyLocaleCookie(response: NextResponse): NextResponse {
  response.cookies.set("NEXT_LOCALE", "", {
    path: "/",
    maxAge: 0,
  });
  return response;
}

export default function proxy(request: NextRequest) {
  const legacyRedirect = redirectLegacyLocalePrefix(request);

  if (legacyRedirect) {
    return applySecurityHeaders(clearLegacyLocaleCookie(legacyRedirect));
  }

  const authRedirect = protectPrivateRoutes(request);

  if (authRedirect) {
    return applySecurityHeaders(authRedirect);
  }

  const response = NextResponse.next({
    request: {
      headers: withPathnameHeader(request).headers,
    },
  });

  return applySecurityHeaders(
    preventAuthPageCaching(request, clearLegacyLocaleCookie(response)),
  );
}

export const config = {
  matcher: ["/", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
