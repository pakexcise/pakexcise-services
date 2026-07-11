import type { Metadata } from "next";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminNavForPermissions } from "@/config/admin";
import { buildLoginRedirectUrl } from "@/config/auth";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { isAuthError } from "@/lib/errors/auth-errors";
import { requireAdminPortal } from "@/server/permissions/guards";
import { enforcePortalAccess } from "@/server/permissions/portal-access";
import { getCachedEffectivePermissions } from "@/server/permissions/effective-permissions";
import { getAdminNavBadgeCounts } from "@/server/repositories/admin-badge-repository";
import type { CurrentUser } from "@/server/auth/current-user";

export async function generateMetadata(): Promise<Metadata> {
  return adminMetadata("Admin");
}

const EMPTY_BADGES = {
  unreadNotifications: 0,
  pendingApplications: 0,
} as const;

const LOGIN_HREF = buildLoginRedirectUrl("/admin/dashboard") as Route;

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

async function loadAdminUser(): Promise<CurrentUser> {
  try {
    const result = await Promise.race([
      enforcePortalAccess(requireAdminPortal, "/admin/dashboard").then(
        (user) => ({ status: "ok" as const, user }),
      ),
      new Promise<{ status: "timeout" }>((resolve) => {
        setTimeout(() => resolve({ status: "timeout" }), 12000);
      }),
    ]);

    if (result.status === "timeout") {
      console.error("[admin-layout] timed out: admin-auth after 12000ms");
      redirect(LOGIN_HREF);
    }

    return result.user;
  } catch (error) {
    if (isAuthError(error)) {
      redirect(LOGIN_HREF);
    }
    throw error;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await loadAdminUser();

  const [permissions, badgeCounts] = await Promise.all([
    withTimeout(
      getCachedEffectivePermissions(user.id, user.role),
      5000,
      [],
      "effective-permissions",
    ),
    withTimeout(
      getAdminNavBadgeCounts(user.id),
      5000,
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
