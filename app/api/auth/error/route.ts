import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  appendSearchParams,
  buildLoginUrl,
} from "@/features/auth/lib/auth-url";

function normalizeAuthError(error: string | null): string {
  if (!error) {
    return "auth_error";
  }

  const lower = error.toLowerCase();

  if (
    lower.includes("callback") ||
    lower.includes("social") ||
    lower === "access_denied"
  ) {
    return "social_auth_failed";
  }

  if (lower === "internal_server_error" || lower === "auth_error") {
    return lower;
  }

  return "auth_error";
}

export function GET(request: NextRequest): NextResponse {
  const error = request.nextUrl.searchParams.get("error");
  const callbackUrl = request.nextUrl.searchParams.get("callbackUrl") ?? undefined;

  const redirectTarget = appendSearchParams(buildLoginUrl({ callbackUrl }), {
    error: normalizeAuthError(error),
  });

  return NextResponse.redirect(new URL(redirectTarget, request.nextUrl.origin));
}
