import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminNavForRole } from "@/config/admin";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { requireAdminPortal } from "@/server/permissions/guards";

export async function generateMetadata(): Promise<Metadata> {
  return adminMetadata("Admin");
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminPortal();
  const navItems = getAdminNavForRole(user.role);

  return (
    <AdminShell
      navItems={navItems}
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
