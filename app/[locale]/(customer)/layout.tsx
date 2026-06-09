import { CustomerPortalNav } from "@/components/customer/CustomerPortalNav";
import { LegalDisclaimer } from "@/components/shared/LegalDisclaimer";
import { requireCustomerPortal } from "@/server/permissions/guards";
import { enforcePortalAccess } from "@/server/permissions/portal-access";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await enforcePortalAccess(requireCustomerPortal, "/customer/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <LegalDisclaimer />
      <div className="container-site space-y-6 py-8">
        <CustomerPortalNav />
        {children}
      </div>
    </div>
  );
}
