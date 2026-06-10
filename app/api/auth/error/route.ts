import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { authConfig } from "@/config/auth";

export function GET(request: NextRequest): NextResponse {
  const error = request.nextUrl.searchParams.get("error") ?? "auth_error";
  const loginUrl = new URL(authConfig.loginPath, request.nextUrl.origin);
  loginUrl.searchParams.set("error", error);

  return NextResponse.redirect(loginUrl);
}
