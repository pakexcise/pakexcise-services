import type { CurrentUser } from "@/server/auth/current-user";

/** Active agent portal access — no admin pre-approval required; only rejected/inactive agents are blocked. */
export function isApprovedActiveAgent(user: CurrentUser): boolean {
  const profile = user.agentProfile;

  return (
    user.role === "AGENT" &&
    Boolean(profile?.isActive) &&
    profile?.approvalStatus !== "REJECTED"
  );
}
