import { requireAuth } from "@/server/permissions/rbac";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth("ADMIN");

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container-site py-8">{children}</div>
    </div>
  );
}
