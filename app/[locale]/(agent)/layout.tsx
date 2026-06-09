import { AgentPortalNav } from "@/components/agent/AgentPortalNav";
import { LegalDisclaimer } from "@/components/shared/LegalDisclaimer";
import { isApprovedActiveAgent } from "@/features/agents/lib/is-approved-agent";
import { requireAgent } from "@/server/permissions/guards";
import { enforcePortalAccess } from "@/server/permissions/portal-access";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await enforcePortalAccess(requireAgent, "/agent/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <LegalDisclaimer />
      <div className="container-site space-y-6 py-8">
        <AgentPortalNav isApproved={isApprovedActiveAgent(user)} />
        {children}
      </div>
    </div>
  );
}
