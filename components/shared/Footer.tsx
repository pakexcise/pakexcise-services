import type { Route } from "next";
import Link from "next/link";
import { Clock, Mail, Phone } from "lucide-react";
import { getTranslations } from "@/lib/i18n/t";

import { SocialLinks } from "@/components/marketing/social-links";
import { FooterProvinceLinks } from "@/components/marketing/footer-province-links";
import { SiteLogo } from "@/components/shared/SiteLogo";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { resolveFooterSocialLinks } from "@/features/marketing/lib/resolve-footer-social-links";
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
import { buildTelHref } from "@/lib/contact/build-tel-href";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-service-message";
import {
  getActiveSocialLinks,
  getFooterLegalPages,
  getFooterRegions,
  getFooterServices,
} from "@/server/repositories";

function FooterLink({
  href,
  children,
  external = false,
  ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  ariaLabel?: string;
}) {
  const className =
    "inline-block text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href as Route} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

function FooterNavSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <nav className={className} aria-label={title}>
      <h2 className="mb-3 text-sm font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <ul className="space-y-1.5">{children}</ul>
    </nav>
  );
}

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const locale = "en";
  const year = new Date().getFullYear();

  let services: Awaited<ReturnType<typeof getFooterServices>> = [];
  let regions: Awaited<ReturnType<typeof getFooterRegions>> = [];
  let socialLinks: Awaited<ReturnType<typeof getActiveSocialLinks>> = [];
  let description = t("description");
  let contactEmail = "";
  let contactPhone = "";
  let supportDays = "";
  let supportHours = "";
  let whatsappHref = "";
  let whatsappChannelUrl = "";
  let whatsappLabel = t("whatsapp");
  let whatsappChannelLabel = t("whatsappChannel");
  let whatsappChannelLabelEn = t("whatsappChannel");
  let showBlog = true;
  let showReviews = true;
  let showWhatsappChannel = true;
  let footerLogoPath: string | undefined;
  let logoDarkPath: string | undefined;
  let legalPages: Awaited<ReturnType<typeof getFooterLegalPages>> = [];

  try {
    const [
      servicesResult,
      regionsResult,
      socialResult,
      legalPagesResult,
      business,
      featureFlags,
      branding,
      publicUi,
    ] = await Promise.all([
      getFooterServices(),
      getFooterRegions(),
      getActiveSocialLinks(),
      getFooterLegalPages(),
      getBusinessSettings(),
      getFeatureFlagSettings(),
      getBrandingSettings(),
      getPublicUiSettings(),
    ]);

    services = servicesResult;
    regions = regionsResult;
    socialLinks = socialResult;
    legalPages = legalPagesResult;
    showBlog = featureFlags.blogEnabled;
    showReviews = featureFlags.reviewsEnabled;
    showWhatsappChannel = featureFlags.whatsappChannelEnabled;

    const localized = localizeGlobalSiteContent(business, publicUi);
    description = localized.footerDescription || description;
    whatsappLabel = localized.footerWhatsappLabel || whatsappLabel;
    whatsappChannelLabel =
      localized.footerWhatsappChannelLabel || whatsappChannelLabel;
    whatsappChannelLabelEn = publicUi.footerWhatsappChannelLabelEn;
    supportDays = localized.supportDays;
    supportHours = localized.supportHours;
    contactEmail = resolveSupportEmail(business);
    contactPhone = resolvePhoneDisplayNumber(business);
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

  const emailLabel = t("emailAria", { email: contactEmail });
  const phoneLabel = t("phoneAria", { phone: contactPhone });
  const footerSocialLinks = resolveFooterSocialLinks({
    links: socialLinks,
    whatsappChatHref: whatsappHref,
    whatsappChannelUrl,
    showWhatsappChannel,
    channelLabelEn: whatsappChannelLabelEn,
  });

  return (
    <footer className="border-t bg-linear-to-b from-muted/20 to-muted/40">
      <div className="container-site grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-5 sm:col-span-2 lg:col-span-4">
          <SiteLogo
            size="footer"
            footerLogoPath={footerLogoPath}
            logoDarkPath={logoDarkPath}
          />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          {footerSocialLinks.length > 0 ? (
            <SocialLinks
              links={footerSocialLinks}
              title={t("followUs")}
              variant="footer"
            />
          ) : null}
        </div>

        <FooterNavSection
          title={t("servicesTitle")}
          className="lg:col-span-2"
        >
          {services.length === 0 ? (
            <li className="text-sm text-muted-foreground">{t("servicesEmpty")}</li>
          ) : (
            services.map((service) => (
              <li key={service.id}>
                <FooterLink href={`/services/${service.slug}`}>
                  {service.nameEn ?? ""}
                </FooterLink>
              </li>
            ))
          )}
        </FooterNavSection>

        <FooterProvinceLinks
          title={t("regionsTitle")}
          className="lg:col-span-2"
          emptyMessage={t("regionsEmpty")}
          provinces={regions.map((region) => ({
            id: region.id,
            slug: region.slug,
            name: region.nameEn ?? "",
          }))}
        />

        <FooterNavSection title={t("exploreTitle")} className="lg:col-span-2">
          {showBlog ? (
            <li>
              <FooterLink href="/blog">{tNav("blog")}</FooterLink>
            </li>
          ) : null}
          {showReviews ? (
            <li>
              <FooterLink href="/reviews">{tNav("reviews")}</FooterLink>
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
        </FooterNavSection>

        <nav className="lg:col-span-2" aria-label={t("contactTitle")}>
          <h2 className="mb-3 text-sm font-semibold tracking-tight text-foreground">
            {t("contactTitle")}
          </h2>
          <ul className="space-y-3">
            <li>
              <a
                href={`mailto:${contactEmail}`}
                aria-label={emailLabel}
                title={emailLabel}
                className="group inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Mail className="size-3.5" aria-hidden="true" />
                </span>
                <span>{contactEmail}</span>
              </a>
            </li>
            <li>
              <a
                href={buildTelHref(contactPhone)}
                aria-label={phoneLabel}
                title={phoneLabel}
                className="group inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Phone className="size-3.5" aria-hidden="true" />
                </span>
                <span>{contactPhone}</span>
              </a>
            </li>
            <li>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={whatsappLabel}
                title={whatsappLabel}
                className="group inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-[#25D366] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/40 rounded-sm"
                data-analytics-event="click_whatsapp"
                data-analytics-placement="footer_whatsapp"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-[#25D366]/15 text-[#25D366] transition-colors group-hover:bg-[#25D366]/20">
                  <WhatsAppIcon className="size-3.5" />
                </span>
                <span>{whatsappLabel}</span>
              </a>
            </li>
            {whatsappChannelUrl && showWhatsappChannel ? (
              <li>
                <a
                  href={whatsappChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={whatsappChannelLabel}
                  title={whatsappChannelLabel}
                  className="group inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-[#25D366] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/40 rounded-sm"
                  data-analytics-event="click_whatsapp"
                  data-analytics-placement="footer_whatsapp_channel"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-[#25D366]/15 text-[#25D366] transition-colors group-hover:bg-[#25D366]/20">
                    <WhatsAppIcon className="size-3.5" />
                  </span>
                  <span>{whatsappChannelLabel}</span>
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
        </nav>
      </div>

      <div className="border-t border-border/60">
        <div className="container-site flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
          <nav aria-label={t("legal")}>
            <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:justify-start">
              {legalPages.map((link) => (
                <li key={link.slug}>
                  <FooterLink href={`/${link.slug}`}>
                    {link.titleEn ?? ""}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-center text-xs text-muted-foreground sm:text-right">
            {t("copyright", { year })}
          </p>
        </div>
      </div>
    </footer>
  );
}
