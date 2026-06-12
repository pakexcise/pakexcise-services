import "server-only";

import type { CurrentUser } from "@/server/auth/current-user";
import { getCurrentUser } from "@/server/auth/current-user";

export type ApplyAccessResult =
  | { allowed: true; user: CurrentUser }
  | { allowed: false; reason: "UNAUTHORIZED" }
  | { allowed: false; reason: "AGENT_NOT_APPROVED"; user: CurrentUser }
  | { allowed: false; reason: "FORBIDDEN"; user: CurrentUser };

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
      user.agentProfile?.isActive &&
      user.agentProfile.approvalStatus !== "REJECTED"
    ) {
      return { allowed: true, user };
    }

    return { allowed: false, reason: "AGENT_NOT_APPROVED", user };
  }

  return { allowed: false, reason: "FORBIDDEN", user };
}
