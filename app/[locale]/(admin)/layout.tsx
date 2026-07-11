import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminNavForPermissions } from "@/config/admin";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { requireAdminPortal } from "@/server/permissions/guards";
import { enforcePortalAccess } from "@/server/permissions/portal-access";
import { getCachedEffectivePermissions } from "@/server/permissions/effective-permissions";
import { getAdminNavBadgeCounts } from "@/server/repositories/admin-badge-repository";

export async function generateMetadata(): Promise<Metadata> {
  return adminMetadata("Admin");
}

const EMPTY_BADGES = {
  unreadNotifications: 0,
  pendingApplications: 0,
} as const;

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => {
          console.error(`[admin-layout] timed out: ${label} after ${ms}ms`);
          resolve(fallback);
        }, ms);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
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

  const [permissions, badgeCounts] = await Promise.all([
    withTimeout(
      getCachedEffectivePermissions(user.id, user.role),
      8000,
      [],
      "effective-permissions",
    ),
    withTimeout(
      getAdminNavBadgeCounts(user.id),
      8000,
      { ...EMPTY_BADGES },
      "nav-badges",
    ),
  ]);

  const navItems = getAdminNavForPermissions(permissions, {
    isSuperAdmin: user.role === "SUPER_ADMIN",
  });

  return (
    <AdminShell
      navItems={navItems}
      badgeCounts={badgeCounts}
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
