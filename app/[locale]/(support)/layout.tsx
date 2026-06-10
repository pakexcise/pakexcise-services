import { SupportShell } from "@/components/support/support-shell";
import { supportNavItems } from "@/config/support";
import { getCurrentUser } from "@/server/auth/current-user";
import { requireSupportPortal } from "@/server/permissions/guards";
import { enforcePortalAccess } from "@/server/permissions/portal-access";

export default async function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await enforcePortalAccess(requireSupportPortal, "/support/dashboard");
  const user = await getCurrentUser();

  const displayName = user?.name?.trim() || user?.email || "Support";
  const displayEmail = user?.email ?? "";

  return (
    <SupportShell
      navItems={supportNavItems}
      userName={displayName}
      userEmail={displayEmail}
    >
      {children}
    </SupportShell>
  );
}
