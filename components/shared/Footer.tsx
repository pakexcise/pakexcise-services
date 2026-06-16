import { Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { SocialLinks } from "@/components/marketing/social-links";
import { SiteLogo } from "@/components/shared/SiteLogo";
import { localizeGlobalSiteContent } from "@/features/settings/lib/global-site-content";
import {
  getBrandingSettings,
  getBusinessSettings,
  getFeatureFlagSettings,
  getPublicUiSettings,
} from "@/features/settings/lib/public-settings-cache";
import {
  resolvePhoneDisplayNumber,
  resolveSupportEmail,
  resolveWhatsappChannelUrl,
  resolveWhatsappDefaultMessage,
  resolveWhatsappLinkNumber,
} from "@/features/settings/lib/resolve-public-contact";
import { Link } from "@/i18n/navigation";
import { buildTelHref } from "@/lib/contact/build-tel-href";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-service-message";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import {
  getFeaturedServices,
  getActiveSocialLinks,
  regionRepository,
} from "@/server/repositories";

const legalLinks = [
  { href: "/privacy-policy", key: "privacy" },
  { href: "/terms-and-conditions", key: "terms" },
  { href: "/disclaimer", key: "disclaimer" },
  { href: "/refund-policy", key: "refund" },
  { href: "/payment-policy", key: "paymentPolicy" },
  { href: "/cookie-policy", key: "cookiePolicy" },
] as const;

function FooterLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const className =
    "text-sm text-muted-foreground transition-colors hover:text-foreground";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const locale = await getCurrentLocale();
  const year = new Date().getFullYear();

  let services: Awaited<ReturnType<typeof getFeaturedServices>> = [];
  let regions: Awaited<ReturnType<typeof regionRepository.listPublic>> = [];
  let socialLinks: Awaited<ReturnType<typeof getActiveSocialLinks>> = [];
  let description = t("description");
  let contactEmail = "";
  let contactPhone = "";
  let supportDays = "";
  let supportHours = "";
  let privateNotice = t("privateNotice");
  let whatsappHref = "";
  let whatsappChannelUrl = "";
  let showBlog = true;
  let showGuides = true;
  let showWhatsappChannel = true;
  let footerLogoPath: string | undefined;
  let logoDarkPath: string | undefined;

  try {
    const [
      servicesResult,
      regionsResult,
      socialResult,
      business,
      featureFlags,
      branding,
      publicUi,
    ] = await Promise.all([
      getFeaturedServices(6),
      regionRepository.listPublic(),
      getActiveSocialLinks(),
      getBusinessSettings(),
      getFeatureFlagSettings(),
      getBrandingSettings(),
      getPublicUiSettings(),
    ]);

    services = servicesResult;
    regions = regionsResult.slice(0, 6);
    socialLinks = socialResult;
    showBlog = featureFlags.blogEnabled;
    showGuides = featureFlags.guidesEnabled;
    showWhatsappChannel = featureFlags.whatsappChannelEnabled;

    const localized = localizeGlobalSiteContent(business, locale, publicUi);
    description = localized.footerDescription || description;
    privateNotice = localized.disclaimer || privateNotice;
    contactEmail = resolveSupportEmail(business);
    contactPhone = resolvePhoneDisplayNumber(business);
    supportDays = localized.supportDays;
    supportHours = localized.supportHours;
    whatsappChannelUrl = resolveWhatsappChannelUrl(business);
    whatsappHref = buildWhatsAppUrl(
      resolveWhatsappLinkNumber(business),
      resolveWhatsappDefaultMessage(business, locale),
    );
    footerLogoPath = branding.footerLogoPath;
    logoDarkPath = branding.logoDarkPath;
  } catch {
    services = [];
    regions = [];
    socialLinks = [];
  }

  return (
    <footer className="border-t bg-linear-to-b from-muted/20 to-muted/40">
      <div className="container-site grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-5 sm:col-span-2 lg:col-span-4">
          <SiteLogo
            imageClassName="max-h-9"
            footerLogoPath={footerLogoPath}
            logoDarkPath={logoDarkPath}
          />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          {socialLinks.length > 0 ? (
            <SocialLinks
              links={socialLinks}
              locale={locale}
              title={t("followUs")}
              variant="footer"
            />
          ) : null}
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold tracking-tight">{t("servicesTitle")}</h2>
          {services.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("servicesEmpty")}</p>
          ) : (
            <ul className="space-y-2.5">
              {services.map((service) => (
                <li key={service.id}>
                  <FooterLink href={`/services/${service.slug}`}>
                    {locale === "ur" ? service.nameUr : service.nameEn}
                  </FooterLink>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold tracking-tight">{t("regionsTitle")}</h2>
          {regions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("regionsEmpty")}</p>
          ) : (
            <ul className="space-y-2.5">
              {regions.map((region) => (
                <li key={region.id}>
                  <FooterLink href={`/regions/${region.slug}`}>
                    {locale === "ur" ? region.nameUr : region.nameEn}
                  </FooterLink>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold tracking-tight">{t("exploreTitle")}</h2>
          <ul className="space-y-2.5">
            {showBlog ? (
              <li>
                <FooterLink href="/blog">{tNav("blog")}</FooterLink>
              </li>
            ) : null}
            {showGuides ? (
              <li>
                <FooterLink href="/guides">{tNav("guides")}</FooterLink>
              </li>
            ) : null}
            <li>
              <FooterLink href="/faqs">{tNav("faqs")}</FooterLink>
            </li>
            <li>
              <FooterLink href="/about">{tNav("about")}</FooterLink>
            </li>
            <li>
              <FooterLink href="/contact">{tNav("contact")}</FooterLink>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold tracking-tight">{t("contactTitle")}</h2>
          <ul className="space-y-3">
            <li>
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="size-3.5" aria-hidden="true" />
                </span>
                {contactEmail}
              </a>
            </li>
            <li>
              <a
                href={buildTelHref(contactPhone)}
                className="inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Phone className="size-3.5" aria-hidden="true" />
                </span>
                {contactPhone}
              </a>
            </li>
            <li>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                data-analytics-event="click_whatsapp"
                data-analytics-placement="footer_whatsapp"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-[#25D366]/15 text-[#25D366]">
                  <MessageCircle className="size-3.5" aria-hidden="true" />
                </span>
                {t("whatsapp")}
              </a>
            </li>
            {whatsappChannelUrl && showWhatsappChannel ? (
              <li>
                <a
                  href={whatsappChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-[#25D366]/15 text-[#25D366]">
                    <MessageCircle className="size-3.5" aria-hidden="true" />
                  </span>
                  {t("whatsappChannel")}
                </a>
              </li>
            ) : null}
            <li className="inline-flex items-start gap-2.5 text-sm text-muted-foreground">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock className="size-3.5" aria-hidden="true" />
              </span>
              <span className="pt-1 leading-relaxed">
                {supportDays}
                <br />
                {supportHours}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-5 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:justify-start">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <FooterLink href={link.href}>{t(link.key)}</FooterLink>
              </li>
            ))}
          </ul>
          <div className="space-y-1 text-center sm:text-right">
            <p>{t("copyright", { year })}</p>
            <p>{privateNotice}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
