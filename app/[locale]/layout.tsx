import { Geist, Geist_Mono, Noto_Nastaliq_Urdu } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import "@/app/globals.css";
import { WhatsAppFAB } from "@/components/shared/WhatsAppFAB";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import {
  buildLocalBusinessJsonLd,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "@/features/seo/lib/metadata";
import { routing, type Locale } from "@/i18n/config";
import { absoluteUrl } from "@/lib/utils";
import { getSettingValue } from "@/server/repositories";
import { getCurrentLocale, isValidLocale } from "@/server/i18n/get-locale";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoNastaliq = Noto_Nastaliq_Urdu({
  variable: "--font-noto-nastaliq",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

type WhatsAppSettings = {
  phoneNumber?: string;
  defaultMessage?: string;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const dynamic = "force-dynamic";

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: routeLocale } = await params;

  if (!isValidLocale(routeLocale)) {
    notFound();
  }

  const locale: Locale = await getCurrentLocale();
  const direction = locale === "ur" ? "rtl" : "ltr";

  setRequestLocale(locale);
  const messages = await getMessages();

  let whatsappSettings: WhatsAppSettings | null = null;

  try {
    whatsappSettings = await getSettingValue<WhatsAppSettings>("whatsapp");
  } catch {
    whatsappSettings = null;
  }

  const baseUrl = absoluteUrl("/");
  const siteJsonLd = [
    buildOrganizationJsonLd(baseUrl),
    buildWebSiteJsonLd(baseUrl),
    buildLocalBusinessJsonLd(baseUrl),
  ];

  return (
    <html
      lang={locale}
      dir={direction}
      translate="no"
      suppressHydrationWarning
    >
      <head>
        <meta name="google" content="notranslate" />
        <meta httpEquiv="Content-Language" content={locale} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoNastaliq.variable} min-h-screen bg-background font-sans text-foreground antialiased ${locale === "ur" ? "font-urdu" : ""}`}
        data-locale={locale}
      >
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
            <WhatsAppFAB
              phoneNumber={whatsappSettings?.phoneNumber}
              message={whatsappSettings?.defaultMessage}
            />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
