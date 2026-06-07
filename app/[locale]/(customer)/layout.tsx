import { requireCustomerPortal } from "@/server/permissions/guards";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireCustomerPortal();

  return (
    <div className="min-h-screen bg-background">
      <div className="container-site py-8">{children}</div>
    </div>
  );
}
