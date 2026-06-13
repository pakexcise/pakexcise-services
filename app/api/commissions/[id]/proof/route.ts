import { NextResponse } from "next/server";

import { handleCommissionProofUrl } from "@/features/commissions/lib/commission-proof-view";
import { z } from "zod";
import { getCurrentUser } from "@/server/auth/current-user";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

const commissionIdParamSchema = z.string().cuid();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const user = await getCurrentUser();

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await enforceRateLimit(serverActionRateLimit, `commission-proof:${user.id}`);
  } catch {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await context.params;
  const idParsed = commissionIdParamSchema.safeParse(id);

  if (!idParsed.success) {
    return NextResponse.json({ error: "Invalid commission id" }, { status: 400 });
  }

  const result = await handleCommissionProofUrl(user, idParsed.data);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result);
}
