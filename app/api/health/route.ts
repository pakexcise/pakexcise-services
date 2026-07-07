import { NextResponse } from "next/server";

import { getAppEnv } from "@/config/env.server";
import { resolveBuildId } from "@/lib/build-id";
import { isSesConfigured } from "@/server/notifications/ses/config";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    app: "pakexcise",
    env: getAppEnv(),
    buildId: resolveBuildId(),
    email: {
      provider: "aws-ses",
      configured: isSesConfigured(),
    },
    timestamp: new Date().toISOString(),
  });
}
