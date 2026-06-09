import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";

import { auth } from "@/server/auth";
import { getRequestMetaFromHeaders } from "@/server/auth/session";
import {
  checkRateLimit,
  loginRateLimit,
} from "@/server/security/rate-limit";

const handler = toNextJsHandler(auth);

async function withLoginRateLimit(
  request: NextRequest,
  method: "GET" | "POST",
): Promise<Response> {
  const meta = getRequestMetaFromHeaders(request.headers);
  const identifier = `auth:${meta.ipAddress ?? "anonymous"}`;
  const limit = await checkRateLimit(loginRateLimit, identifier);

  if (!limit.success) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  return handler[method](request);
}

export async function GET(request: NextRequest): Promise<Response> {
  return withLoginRateLimit(request, "GET");
}

export async function POST(request: NextRequest): Promise<Response> {
  return withLoginRateLimit(request, "POST");
}
