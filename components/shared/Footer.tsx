import { Mail, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { SocialLinks } from "@/components/marketing/social-links";
import { SiteLogo } from "@/components/shared/SiteLogo";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import {
  getActiveServices,
  getActiveSocialLinks,
} from "@/server/repositories";

const legalLinks = [
  { href: "/privacy-policy", key: "privacy" },
  { href: "/terms-and-conditions", key: "terms" },
  { href: "/disclaimer", key: "disclaimer" },
  { href: "/refund-policy", key: "refund" },
  { href: "/payment-policy", key: "paymentPolicy" },
  { href: "/cookie-policy", key: "cookiePolicy" },
] as const;

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const locale = await getCurrentLocale();
  const year = new Date().getFullYear();

  let services: Awaited<ReturnType<typeof getActiveServices>> = [];
  let socialLinks: Awaited<ReturnType<typeof getActiveSocialLinks>> = [];

  try {
    [services, socialLinks] = await Promise.all([
      getActiveServices(6),
      getActiveSocialLinks(),
    ]);
  } catch {
    services = [];
    socialLinks = [];
  }

  return (
    <footer className="border-t bg-muted/30 dark:bg-muted/20">
      <div className="container-site grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 sm:col-span-2 lg:col-span-1">
          <SiteLogo imageClassName="max-h-9" />
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">{t("servicesTitle")}</h2>
          {services.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("servicesEmpty")}</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {services.map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {locale === "ur" ? service.nameUr : service.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">{t("contactTitle")}</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="inline-flex items-center gap-2 hover:text-foreground"
              >
                <Mail className="size-4 shrink-0" aria-hidden="true" />
                {siteConfig.contact.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 hover:text-foreground"
              >
                <Phone className="size-4 shrink-0" aria-hidden="true" />
                {siteConfig.contact.phone}
              </a>
            </li>
            <li>
              <Link href="/contact" className="hover:text-foreground">
                {tNav("contact")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold">{t("legal")}</h2>
          <ul className="space-y-2 text-sm">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Separator />
      <div className="container-site py-4">
        <SocialLinks
          links={socialLinks}
          locale={locale}
          title={t("connect")}
          emptyMessage={t("socialEmpty")}
        />
      </div>

      <Separator />
      <div className="container-site py-4 text-center text-xs text-muted-foreground">
        {t("copyright", { year })}
      </div>
    </footer>
  );
}
