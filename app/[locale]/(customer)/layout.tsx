import { getTranslations } from "next-intl/server";

import { CustomerShell } from "@/components/customer/customer-shell";
import type { CustomerShellLabels } from "@/components/customer/customer-shell-labels";
import { isTempPhoneEmail } from "@/features/auth/lib/user-identity";
import { formatPhoneForDisplay } from "@/lib/validations/phone";
import { getCurrentUser } from "@/server/auth/current-user";
import { requireCustomerPortal } from "@/server/permissions/guards";
import { enforcePortalAccess } from "@/server/permissions/portal-access";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await enforcePortalAccess(requireCustomerPortal, "/customer/dashboard");
  const [user, tNav, tShell] = await Promise.all([
    getCurrentUser(),
    getTranslations("customer.nav"),
    getTranslations("customer.shell"),
  ]);

  const displayEmail =
    user?.email && !isTempPhoneEmail(user.email) ? user.email : "";
  const rawPhone = user?.phone ?? "";
  const displayPhone = rawPhone ? formatPhoneForDisplay(rawPhone) : "";
  const contactLine = displayEmail || displayPhone;
  const displayName = user?.name?.trim() || contactLine || "Customer";

  const labels: CustomerShellLabels = {
    shell: {
      portalLabel: tShell("portalLabel"),
      openMenu: tShell("openMenu"),
      signOut: tShell("signOut"),
    },
    nav: {
      ariaLabel: tNav("ariaLabel"),
      accountSection: tNav("accountSection"),
      quickSection: tNav("quickSection"),
      dashboard: tNav("dashboard"),
      profile: tNav("profile"),
      newApplication: tNav("newApplication"),
      services: tNav("services"),
      track: tNav("track"),
    },
  };

  return (
    <CustomerShell
      userName={displayName}
      userContactLine={contactLine}
      labels={labels}
    >
      {children}
    </CustomerShell>
  );
}
