import { requireAuth } from "@/server/permissions/rbac";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth("CUSTOMER");

  return (
    <div className="min-h-screen bg-background">
      <div className="container-site py-8">{children}</div>
    </div>
  );
}
