import { MaintenanceView } from "@/components/marketing/maintenance-view";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { LegalDisclaimer } from "@/components/shared/LegalDisclaimer";
import { applyMarketingPathRedirect } from "@/features/redirects/lib/path-redirects";
import { localizeGlobalSiteContent } from "@/features/settings/lib/global-site-content";
import { getPublicSettings } from "@/features/settings/lib/public-settings-cache";
import {
  resolveWhatsappDefaultMessage,
  resolveWhatsappLinkNumber,
} from "@/features/settings/lib/resolve-public-contact";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { siteChromeShellClassName } from "@/lib/styles/site-chrome";
import { headers } from "next/headers";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();
  await applyMarketingPathRedirect(headerStore.get("x-pakexcise-pathname"));

  const [locale, publicSettings] = await Promise.all([
    getCurrentLocale(),
    getPublicSettings(),
  ]);

  const { business, publicUi, branding, features } = publicSettings;
  const localized = localizeGlobalSiteContent(business, locale, publicUi);
  const maintenanceMessage =
    locale === "ur"
      ? features.maintenanceMessageUr
      : features.maintenanceMessageEn;

  const headerProps = {
    embedded: true as const,
    whatsappPhone: resolveWhatsappLinkNumber(business),
    whatsappMessage: resolveWhatsappDefaultMessage(business, locale),
    whatsappLabel: localized.headerWhatsappLabel,
    headerWhatsappEnabled: publicUi.headerWhatsappEnabled,
    announcementBarEnabled: publicUi.announcementBarEnabled,
    announcementBarText: localized.announcementText,
    logoPath: branding.logoPath,
    logoDarkPath: branding.logoDarkPath,
  };

  if (features.maintenanceMode) {
    return (
      <>
        <div className={siteChromeShellClassName}>
          <LegalDisclaimer bannerText={localized.disclaimer} embedded />
          <Header {...headerProps} />
        </div>
        <main id="main-content">
          <MaintenanceView message={maintenanceMessage} />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className={siteChromeShellClassName}>
        <LegalDisclaimer bannerText={localized.disclaimer} embedded />
        <Header {...headerProps} />
      </div>
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
