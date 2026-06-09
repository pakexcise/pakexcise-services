import { requireApprovedAgent } from "@/server/permissions/guards";
import { enforcePortalAccess } from "@/server/permissions/portal-access";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await enforcePortalAccess(requireApprovedAgent, "/agent/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <div className="container-site py-8">{children}</div>
    </div>
  );
}
