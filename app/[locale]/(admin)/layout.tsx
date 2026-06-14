import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminNavForPermissions } from "@/config/admin";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { requireAdminPortal } from "@/server/permissions/guards";
import { enforcePortalAccess } from "@/server/permissions/portal-access";
import { getCachedEffectivePermissions } from "@/server/permissions/effective-permissions";

export async function generateMetadata(): Promise<Metadata> {
  return adminMetadata("Admin");
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await enforcePortalAccess(
    requireAdminPortal,
    "/admin/dashboard",
  );
  const navItems = getAdminNavForPermissions(
    await getCachedEffectivePermissions(user.id, user.role),
  );

  return (
    <AdminShell
      navItems={navItems}
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
