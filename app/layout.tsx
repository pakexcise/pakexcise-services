import { Geist, Geist_Mono, Noto_Nastaliq_Urdu } from "next/font/google";
import { cookies } from "next/headers";

import "@/app/globals.css";
import { defaultLocale, LOCALE_COOKIE_NAME } from "@/i18n/config";
import { isValidLocale } from "@/i18n/locale";

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
      suppressHydrationWarning
    >
      <head>
        <meta name="google" content="notranslate" />
        <meta httpEquiv="Content-Language" content={locale} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoNastaliq.variable} min-h-screen bg-background font-sans text-foreground antialiased ${locale === "ur" ? "font-urdu" : ""}`}
        data-locale={locale}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
