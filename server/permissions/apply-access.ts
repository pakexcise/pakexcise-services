import "server-only";

import type { CurrentUser } from "@/server/auth/current-user";
import { getCurrentUser } from "@/server/auth/current-user";

export type ApplyAccessResult =
  | { allowed: true; user: CurrentUser }
  | { allowed: false; reason: "UNAUTHORIZED" | "FORBIDDEN" | "AGENT_NOT_APPROVED" };

export async function getApplyAccess(): Promise<ApplyAccessResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { allowed: false, reason: "UNAUTHORIZED" };
  }

  if (user.role === "CUSTOMER") {
    return { allowed: true, user };
  }

  if (user.role === "AGENT") {
    if (
      user.agentProfile?.approvalStatus === "APPROVED" &&
      user.agentProfile.isActive
    ) {
      return { allowed: true, user };
    }

    return { allowed: false, reason: "AGENT_NOT_APPROVED" };
  }

  return { allowed: false, reason: "FORBIDDEN" };
}
