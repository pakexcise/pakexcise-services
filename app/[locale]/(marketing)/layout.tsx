import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";
import { LegalDisclaimer } from "@/components/shared/LegalDisclaimer";
import { getSettingValue } from "@/server/repositories";

type WhatsAppSettings = {
  phoneNumber?: string;
  defaultMessage?: string;
};

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let whatsappSettings: WhatsAppSettings | null = null;

  try {
    whatsappSettings = await getSettingValue<WhatsAppSettings>("whatsapp");
  } catch {
    whatsappSettings = null;
  }

  return (
    <>
      <LegalDisclaimer />
      <Header
        whatsappPhone={whatsappSettings?.phoneNumber}
        whatsappMessage={whatsappSettings?.defaultMessage}
      />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
