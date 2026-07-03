import { NextResponse } from "next/server";

import { getAppEnv } from "@/config/env.server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    app: "pakexcise",
    env: getAppEnv(),
    timestamp: new Date().toISOString(),
  });
}
