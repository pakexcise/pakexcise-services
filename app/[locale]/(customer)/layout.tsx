import { CustomerShell } from "@/components/customer/customer-shell";
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
  const user = await getCurrentUser();

  const displayEmail =
    user?.email && !isTempPhoneEmail(user.email) ? user.email : "";
  const rawPhone = user?.phone ?? "";
  const displayPhone = rawPhone ? formatPhoneForDisplay(rawPhone) : "";
  const contactLine = displayEmail || displayPhone;
  const displayName = user?.name?.trim() || contactLine || "Customer";

  return (
    <CustomerShell userName={displayName} userContactLine={contactLine}>
      {children}
    </CustomerShell>
  );
}
