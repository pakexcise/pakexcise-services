import { MarketingAnalytics } from "@/components/analytics/MarketingAnalytics";
import { MarketingSiteJsonLd } from "@/components/marketing/marketing-site-json-ld";
import { MaintenanceView } from "@/components/marketing/maintenance-view";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { LegalDisclaimer } from "@/components/shared/LegalDisclaimer";
import { WhatsAppFAB } from "@/components/shared/WhatsAppFAB";
import { brandingAssets } from "@/config/branding";
import { localizeGlobalSiteContent } from "@/features/settings/lib/global-site-content";
import { getPublicSettings } from "@/features/settings/lib/public-settings-cache";
import {
  resolveWhatsappDefaultMessage,
  resolveWhatsappLinkNumber,
} from "@/features/settings/lib/resolve-public-contact";
import { siteChromeShellClassName } from "@/lib/styles/site-chrome";

/** Align marketing chrome with page ISR so public HTML can be cached. */
export const revalidate = 3600;

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publicSettings = await getPublicSettings();

  const { business, publicUi, branding, features } = publicSettings;
  const localized = localizeGlobalSiteContent(business, publicUi);
  const maintenanceMessage = features.maintenanceMessageEn;
  const logoPreloadHref = branding.logoPath?.trim() || brandingAssets.logo;

  const headerProps = {
    embedded: true as const,
    whatsappPhone: resolveWhatsappLinkNumber(business),
    whatsappMessage: resolveWhatsappDefaultMessage(business),
    whatsappLabel: localized.headerWhatsappLabel,
    headerWhatsappEnabled: publicUi.headerWhatsappEnabled,
    announcementBarEnabled: publicUi.announcementBarEnabled,
    announcementBarText: localized.announcementText,
    logoPath: branding.logoPath,
    logoDarkPath: branding.logoDarkPath,
  };

  const fab = (
    <WhatsAppFAB
      phoneNumber={
        features.floatingWhatsappEnabled
          ? resolveWhatsappLinkNumber(business)
          : null
      }
      message={
        features.floatingWhatsappEnabled
          ? localized.floatingWhatsappMessage
          : null
      }
      position={publicUi.floatingWhatsappPosition}
      ariaLabel="Chat on WhatsApp"
    />
  );

  const logoPreload = (
    <link rel="preload" as="image" href={logoPreloadHref} fetchPriority="high" />
  );

  if (features.maintenanceMode) {
    return (
      <>
        {logoPreload}
        <MarketingSiteJsonLd />
        <MarketingAnalytics />
        <div className={siteChromeShellClassName}>
          <LegalDisclaimer bannerText={localized.disclaimer} embedded />
          <Header {...headerProps} />
        </div>
        <main id="main-content">
          <MaintenanceView message={maintenanceMessage} />
        </main>
        <Footer />
        {fab}
      </>
    );
  }

  return (
    <>
      {logoPreload}
      <MarketingSiteJsonLd />
      <MarketingAnalytics />
      <div className={siteChromeShellClassName}>
        <LegalDisclaimer bannerText={localized.disclaimer} embedded />
        <Header {...headerProps} />
      </div>
      <main id="main-content">{children}</main>
      <Footer />
      {fab}
    </>
  );
}
