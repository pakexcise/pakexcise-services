import type { CurrentUser } from "@/server/auth/current-user";

export function isApprovedActiveAgent(user: CurrentUser): boolean {
  return (
    user.role === "AGENT" &&
    user.agentProfile?.approvalStatus === "APPROVED" &&
    user.agentProfile.isActive
  );
}
