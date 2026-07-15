import { NextResponse } from "next/server";

import { getAppEnv } from "@/config/env.server";
import { resolveBuildId } from "@/lib/build-id";
import { isBrevoConfigured } from "@/server/notifications/brevo/config";
import { isSesConfigured } from "@/server/notifications/ses/config";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    app: "pakexcise",
    env: getAppEnv(),
    buildId: resolveBuildId(),
    email: {
      primary: "brevo",
      fallback: "aws-ses",
      brevoConfigured: isBrevoConfigured(),
      sesConfigured: isSesConfigured(),
    },
    timestamp: new Date().toISOString(),
  });
}
