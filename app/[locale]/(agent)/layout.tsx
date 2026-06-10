import { AgentPortalNav } from "@/components/agent/AgentPortalNav";
import { isApprovedActiveAgent } from "@/features/agents/lib/is-approved-agent";
import { requireAgentModuleEnabled } from "@/features/settings/lib/feature-gates";
import { requireAgent } from "@/server/permissions/guards";
import { enforcePortalAccess } from "@/server/permissions/portal-access";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAgentModuleEnabled();
  const user = await enforcePortalAccess(requireAgent, "/agent/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <div className="container-site space-y-6 py-8">
        <AgentPortalNav isApproved={isApprovedActiveAgent(user)} />
        {children}
      </div>
    </div>
  );
}
