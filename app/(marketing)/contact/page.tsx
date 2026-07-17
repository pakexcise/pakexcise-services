import { copy, createT } from "@/messages";
import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";
import { notFound } from "next/navigation";

import { ContactInquiryFormSection } from "@/components/marketing/contact-inquiry-form";
import { ContactMethodsSidebar } from "@/components/marketing/contact-methods-sidebar";
import { ContactSupportOptionsSection } from "@/components/marketing/contact-support-options";
import { MarketingCta } from "@/components/marketing/marketing-cta";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { SocialLinks } from "@/components/marketing/social-links";
import {
  getContactPageSettings,
  localizeContactPageSettings} from "@/features/contact-page/lib/contact-page-settings-cache";
import { getFeatureFlagSettings, getFormsSettings } from "@/features/settings/lib/public-settings-cache";
import { buildBreadcrumbJsonLd, buildBusinessContactPoints, buildContactPageJsonLd } from "@/features/seo/lib/metadata";
import { getBusinessSettings } from "@/features/settings/lib/public-settings-cache";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-service-message";
import { resolveMetadataFromSeo, resolveVisibleH1 } from "@/features/seo/lib/resolve-metadata";
import { absoluteUrl } from "@/lib/utils";
import { getActiveSocialLinks, regionRepository, seoMetaRepository } from "@/server/repositories";

/** Contact page settings are cached; ISR keeps TTFB low while admin changes refresh hourly. */
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = "en";
  const [settings, seo] = await Promise.all([
    getContactPageSettings(),
    seoMetaRepository.findByPageKey("contact")]);

  return await resolveMetadataFromSeo({
    locale,
    path: "/contact",
    seo,
    fallbacks: {
      title: {
        en: settings.seo.metaTitleEn},
      description: {
        en: settings.seo.metaDescriptionEn},
      h1: {
        en: seo?.h1En ?? settings.heroTitleEn}}});
}

export default async function ContactPage() {
  const locale = "en";
const [settings, seo, socialLinks, regions, featureFlags, formsSettings, businessSettings, tContact, tNav, tOptions] =
    await Promise.all([
    getContactPageSettings(),
    seoMetaRepository.findByPageKey("contact"),
    getActiveSocialLinks(),
    regionRepository.listPublic(),
    getFeatureFlagSettings(),
    getFormsSettings(),
    getBusinessSettings(),
    getTranslations("marketing.contact"),
    getTranslations("nav"),
    getTranslations("marketing.contact.options")]);

  if (!settings.isPageActive) {
    notFound();
  }

  const content = localizeContactPageSettings(settings, locale);
  const heroTitle = resolveVisibleH1(seo, content.heroTitle);
  const regionOptions = regions.map((region) =>
    region.nameEn ?? "",
  );
  const contactSuccessDescription =
    formsSettings.contactSuccessMessageEn;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: tContact("breadcrumb"), url: absoluteUrl("/contact") }]);
  const contactPageJsonLd = buildContactPageJsonLd({
    pageUrl: absoluteUrl("/contact"),
    pageName: heroTitle,
    description: content.heroDescription,
    organizationName: businessSettings.siteName,
    baseUrl: absoluteUrl("/"),
    sameAs: socialLinks.map((link) => link.url),
    contactPoints: buildBusinessContactPoints({
      phone: settings.phoneNumber ?? businessSettings.phoneDisplayNumber,
      email: settings.supportEmail ?? businessSettings.businessEmail,
      whatsappUrl: settings.whatsappNumber
        ? buildWhatsAppUrl(
            settings.whatsappNumber,
            settings.whatsappPrefillMessage ?? "",
          )
        : null,
      whatsappChannelUrl: settings.whatsappChannelUrl})});

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, contactPageJsonLd]} />
      <PageHero
        title={heroTitle}
        description={content.heroDescription}
        breadcrumbs={[
          { label: tNav("home"), href: "/" },
          { label: tContact("breadcrumb") }]}
      />

      <div className="container-site space-y-12 py-10 md:space-y-14 md:py-12">
        <ContactSupportOptionsSection
          whatsappPhone={settings.whatsappNumber}
          whatsappMessage={settings.whatsappPrefillMessage}
          labels={{
            sectionTitle: tOptions("title"),
            sectionDescription: tOptions("description"),
            whatsappTitle: tOptions("whatsappTitle"),
            whatsappDescription: tOptions("whatsappDescription"),
            whatsappCta: tOptions("whatsappCta"),
            requestTitle: tOptions("requestTitle"),
            requestDescription: tOptions("requestDescription"),
            requestCta: tOptions("requestCta"),
            accountTitle: tOptions("accountTitle"),
            accountDescription: tOptions("accountDescription"),
            accountCta: tOptions("accountCta"),
            fastestBadge: tOptions("fastestBadge"),
            trackingBadge: tOptions("trackingBadge")}}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-8">
            {featureFlags.contactFormEnabled ? (
            <ContactInquiryFormSection
              heading={content.formHeading}
              description={content.formDescription}
              locale={locale}
              serviceOptions={content.serviceInterestOptions}
              regionOptions={regionOptions}
              labels={{
                fullName: tContact("form.fullName"),
                phone: tContact("form.phone"),
                phoneHint: tContact("form.phoneHint"),
                phonePlaceholder: tContact("form.phonePlaceholder"),
                email: tContact("form.email"),
                optional: tContact("form.optional"),
                serviceInterest: tContact("form.serviceInterest"),
                servicePlaceholder: tContact("form.servicePlaceholder"),
                region: tContact("form.region"),
                regionPlaceholder: tContact("form.regionPlaceholder"),
                city: tContact("form.city"),
                message: tContact("form.message"),
                messagePlaceholder: tContact("form.messagePlaceholder"),
                submit: tContact("form.submit"),
                submitting: tContact("form.submitting"),
                successTitle: tContact("form.successTitle"),
                successDescription: contactSuccessDescription,
                validationSummary: tContact("form.validationSummary"),
                errors: {
                  fullNameRequired: tContact("form.errors.fullNameRequired"),
                  fullNameTooLong: tContact("form.errors.fullNameTooLong"),
                  phoneInvalid: tContact("form.errors.phoneInvalid"),
                  emailInvalid: tContact("form.errors.emailInvalid"),
                  serviceRequired: tContact("form.errors.serviceRequired"),
                  messageTooLong: tContact("form.errors.messageTooLong")}}}
            />
            ) : null}

            {socialLinks.length > 0 ? (
              <section className="space-y-3 rounded-2xl border bg-muted/20 p-5 sm:p-6">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold">{content.socialHeading}</h2>
                  <p className="text-sm text-muted-foreground">{content.socialDescription}</p>
                </div>
                <SocialLinks links={socialLinks} variant="icons" />
              </section>
            ) : null}
          </div>

          <ContactMethodsSidebar
            phoneNumber={settings.phoneNumber}
            whatsappNumber={settings.whatsappNumber}
            supportEmail={settings.supportEmail}
            supportDays={content.supportDays}
            supportHours={content.supportHours}
            whatsappChannelUrl={settings.whatsappChannelUrl}
            whatsappPrefillMessage={settings.whatsappPrefillMessage}
            whatsappCard={content.whatsappCard}
            callCard={content.callCard}
            emailCard={content.emailCard}
            whatsappChannelCard={content.whatsappChannelCard}
            supportHoursCard={content.supportHoursCard}
          />
        </div>

        {settings.ctaIsActive ? (
          <MarketingCta
            title={content.ctaTitle}
            description={content.ctaDescription}
            applyLabel={content.ctaViewServicesLabel}
            applyHref="/services"
            whatsappLabel={content.ctaWhatsappLabel}
            whatsappPhone={settings.whatsappNumber}
            whatsappMessage={settings.whatsappPrefillMessage}
          />
        ) : null}
      </div>
    </>
  );
}
