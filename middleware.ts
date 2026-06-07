import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { LOCALE_COOKIE_NAME, routing } from "./i18n/routing";
import { isValidLocale } from "./i18n/locale";

const handleI18nRouting = createMiddleware(routing);

const legacyLocalePrefixPattern = /^\/(en|ur)(\/.*)?$/;

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

export default function middleware(request: NextRequest) {
  const legacyRedirect = redirectLegacyLocalePrefix(request);

  if (legacyRedirect) {
    return legacyRedirect;
  }

  const response = handleI18nRouting(withoutAcceptLanguage(request));

  return syncLocaleCookie(response, request);
}

export const config = {
  matcher: ["/", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
