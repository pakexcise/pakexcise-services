import { AgentShell } from "@/components/agent/agent-shell";
import { agentNavItems } from "@/config/agent-nav";
import { isTempPhoneEmail } from "@/features/auth/lib/user-identity";
import { requireAgentModuleEnabled } from "@/features/settings/lib/feature-gates";
import { formatPhoneForDisplay } from "@/lib/validations/phone";
import { getCurrentUser } from "@/server/auth/current-user";
import { requireAgent } from "@/server/permissions/guards";
import { enforcePortalAccess } from "@/server/permissions/portal-access";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAgentModuleEnabled();
  await enforcePortalAccess(requireAgent, "/agent/dashboard");
  const user = await getCurrentUser();

  const displayEmail =
    user?.email && !isTempPhoneEmail(user.email) ? user.email : "";
  const rawPhone = user?.phone ?? "";
  const displayPhone = rawPhone ? formatPhoneForDisplay(rawPhone) : "";
  const contactLine = displayEmail || displayPhone;
  const displayName = user?.name?.trim() || contactLine || "Agent";

  return (
    <AgentShell
      navItems={agentNavItems}
      userName={displayName}
      userContactLine={contactLine}
    >
      {children}
    </AgentShell>
  );
}
