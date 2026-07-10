import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Nastaliq_Urdu } from "next/font/google";
import { cookies } from "next/headers";

import "@/app/globals.css";
import {
  GoogleAnalyticsScripts,
  GoogleTagManagerHead,
  GoogleTagManagerNoScript,
} from "@/components/analytics/google-tags";
import { BrandThemeStyles } from "@/components/theme/BrandThemeStyles";
import { shouldAllowSearchIndexing } from "@/config/env.server";
import {
  resolveAppleIconPath,
  resolveFaviconPath,
} from "@/features/settings/lib/branding-resolvers";
import { getBrandingSettings } from "@/features/settings/lib/public-settings-cache";
import { defaultLocale, LOCALE_COOKIE_NAME } from "@/i18n/config";
import { isValidLocale } from "@/i18n/locale";

function getGoogleSiteVerification(): string | undefined {
  const token = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  return token || undefined;
}

function getBingSiteVerification(): string | undefined {
  const token = process.env.BING_SITE_VERIFICATION?.trim();
  return token || undefined;
}

function buildSearchMetadata(icons: Metadata["icons"]): Metadata {
  const googleVerification = getGoogleSiteVerification();
  const bingVerification = getBingSiteVerification();

  const verification: NonNullable<Metadata["verification"]> = {};

  if (googleVerification) {
    verification.google = googleVerification;
  }

  if (bingVerification) {
    verification.other = {
      "msvalidate.01": bingVerification,
    };
  }

  return {
    icons,
    ...(Object.keys(verification).length > 0 ? { verification } : {}),
  };
}

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

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBrandingSettings();
  const favicon = resolveFaviconPath(branding);
  const appleIcon = resolveAppleIconPath(branding);

  const icons: Metadata["icons"] = {
    icon: favicon,
    shortcut: favicon,
    apple: appleIcon,
  };

  if (!shouldAllowSearchIndexing()) {
    return {
      icons,
      robots: {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
        },
      },
    };
  }

  return buildSearchMetadata(icons);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const locale =
    cookieLocale && isValidLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const direction = locale === "ur" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={direction}
      translate="no"
      data-brand-theme=""
      suppressHydrationWarning
    >
      <head>
        <meta name="google" content="notranslate" />
        <meta httpEquiv="Content-Language" content={locale} />
        <GoogleTagManagerHead />
        <GoogleAnalyticsScripts />
        <BrandThemeStyles />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoNastaliq.variable} min-h-screen bg-background font-sans text-foreground antialiased ${locale === "ur" ? "font-urdu" : ""}`}
        data-locale={locale}
        suppressHydrationWarning
      >
        <GoogleTagManagerNoScript />
        {children}
      </body>
    </html>
  );
}
