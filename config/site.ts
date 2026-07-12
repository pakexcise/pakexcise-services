import { getPublicAppUrl } from "@/config/env.shared";

export const siteConfig = {
  name: "PakExcise.com",
  legalName: "PakExcise Private Facilitation Services",
  description:
    "Private excise facilitation service for Pakistan. Not affiliated with any government body.",
  url: getPublicAppUrl(),
  defaultLocale: "en" as const,
  locales: ["en"] as const,
  defaultTheme: "system" as const,
  colors: {
    primary: "#2159BA",
    secondary: "#FAC515",
  },
  contact: {
    email: "support@pakexcise.com",
    phone: "+92 300 0000000",
    whatsapp: "923000000000",
    whatsappMessage:
      "Hello PakExcise, I need help with an excise facilitation service.",
  },
} as const;

export type SiteLocale = (typeof siteConfig.locales)[number];
