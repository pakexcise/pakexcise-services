import { requireApprovedAgent } from "@/server/permissions/guards";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireApprovedAgent();

  return (
    <div className="min-h-screen bg-background">
      <div className="container-site py-8">{children}</div>
    </div>
  );
}
