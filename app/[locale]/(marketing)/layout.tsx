import { MaintenanceView } from "@/components/marketing/maintenance-view";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { LegalDisclaimer } from "@/components/shared/LegalDisclaimer";
import { getPublicSettings } from "@/features/settings/lib/public-settings-cache";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, publicSettings] = await Promise.all([
    getCurrentLocale(),
    getPublicSettings(),
  ]);

  const { business, features } = publicSettings;
  const disclaimerText =
    locale === "ur" ? business.disclaimerUr : business.disclaimerEn;
  const maintenanceMessage =
    locale === "ur"
      ? features.maintenanceMessageUr
      : features.maintenanceMessageEn;

  if (features.maintenanceMode) {
    return (
      <>
        <LegalDisclaimer bannerText={disclaimerText} />
        <Header
          whatsappPhone={business.whatsappNumber}
          whatsappMessage={business.whatsappDefaultMessage}
        />
        <main id="main-content">
          <MaintenanceView message={maintenanceMessage} />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <LegalDisclaimer bannerText={disclaimerText} />
      <Header
        whatsappPhone={business.whatsappNumber}
        whatsappMessage={business.whatsappDefaultMessage}
      />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
