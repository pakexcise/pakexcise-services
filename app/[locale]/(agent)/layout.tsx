import { requireAuth } from "@/server/permissions/rbac";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth("AGENT");

  return (
    <div className="min-h-screen bg-background">
      <div className="container-site py-8">{children}</div>
    </div>
  );
}
