import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { authConfig, buildLoginRedirectUrl } from "@/config/auth";
import { LOCALE_COOKIE_NAME, routing } from "./i18n/routing";
import { isValidLocale } from "./i18n/locale";
import { applySecurityHeaders } from "@/server/security/headers";

const handleI18nRouting = createMiddleware(routing);

const legacyLocalePrefixPattern = /^\/(en|ur)(\/.*)?$/;

const protectedRoutePrefixes = [
  authConfig.customerPathPrefix,
  authConfig.agentPathPrefix,
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

function withoutAcceptLanguage(request: NextRequest): NextRequest {
  const headers = new Headers(request.headers);
  headers.delete("accept-language");

  return new NextRequest(request.url, {
    method: request.method,
    headers,
  });
}

function syncLocaleCookie(response: NextResponse, request: NextRequest): NextResponse {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;

  if (cookieLocale && isValidLocale(cookieLocale)) {
    response.cookies.set(LOCALE_COOKIE_NAME, cookieLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
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

export default function proxy(request: NextRequest) {
  const legacyRedirect = redirectLegacyLocalePrefix(request);

  if (legacyRedirect) {
    return applySecurityHeaders(legacyRedirect);
  }

  const authRedirect = protectPrivateRoutes(request);

  if (authRedirect) {
    return applySecurityHeaders(authRedirect);
  }

  const response = handleI18nRouting(withoutAcceptLanguage(request));

  return applySecurityHeaders(syncLocaleCookie(response, request));
}

export const config = {
  matcher: ["/", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
