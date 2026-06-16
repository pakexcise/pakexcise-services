import { NextIntlClientProvider } from "next-intl";

import {
  generateNotFoundMetadata,
  NotFoundPageView,
} from "@/components/marketing/not-found-page";
import { ChunkLoadRecovery } from "@/components/shared/chunk-load-recovery";
import { DocumentLocaleSync } from "@/components/shared/DocumentLocaleSync";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import type { Locale } from "@/i18n/config";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export const generateMetadata = generateNotFoundMetadata;

async function loadMessages(locale: Locale) {
  return (await import(`@/i18n/messages/${locale}.json`)).default;
}

export default async function GlobalNotFoundPage() {
  const locale = await getCurrentLocale();
  const messages = await loadMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ChunkLoadRecovery />
      <DocumentLocaleSync />
      <ThemeProvider>
        <NotFoundPageView />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
