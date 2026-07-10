import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { GuestRequestForm } from "@/components/marketing/guest-request-form";
import { PageHero } from "@/components/marketing/page-hero";
import { pickLocalized } from "@/lib/i18n/content";
import { redirectRepository, serviceRepository } from "@/server/repositories";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { redirect } from "@/i18n/navigation";
import { requireSubmitRequestEnabled } from "@/features/settings/lib/feature-gates";
import { getFormsSettings } from "@/features/settings/lib/public-settings-cache";
import { getServiceAssignedRegions } from "@/features/services/lib/service-regions";

export const dynamic = "force-dynamic";

type GuestRequestPageProps = {
  params: Promise<{ serviceSlug: string }>;
};

export async function generateMetadata({
  params,
}: GuestRequestPageProps): Promise<Metadata> {
  const { serviceSlug } = await params;
  const locale = await getCurrentLocale();
  const service = await serviceRepository.findPublicDetailBySlug(serviceSlug);

  if (!service) {
    return {};
  }

  const name = pickLocalized(locale, {
    en: service.nameEn,
    ur: service.nameUr,
  });

  return {
    title:
      locale === "ur"
        ? `سروس درخواست — ${name} | PakExcise.com`
        : `Service request — ${name} | PakExcise.com`,
    robots: { index: false, follow: false },
  };
}

export default async function GuestRequestPage({ params }: GuestRequestPageProps) {
  await requireSubmitRequestEnabled();

  const { serviceSlug } = await params;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const service = await serviceRepository.findPublicDetailBySlug(serviceSlug);

  if (!service) {
    const slugRedirect = await redirectRepository.findActiveByOldSlug(serviceSlug);

    if (slugRedirect) {
      redirect({
        href: `/request/${slugRedirect.newSlug}`,
        locale,
      });
    }

    notFound();
  }

  const t = await getTranslations("marketing");
  const tNav = await getTranslations("nav");
  const tGuest = await getTranslations("marketing.guestRequest");
  const formsSettings = await getFormsSettings();
  const submitSuccessDescription =
    locale === "ur"
      ? formsSettings.submitRequestSuccessMessageUr
      : formsSettings.submitRequestSuccessMessageEn;

  const name = pickLocalized(locale, {
    en: service.nameEn,
    ur: service.nameUr,
  });
  const assignedRegions = getServiceAssignedRegions(service);
  const regionOptions = assignedRegions.map((region) =>
    pickLocalized(locale, { en: region.nameEn, ur: region.nameUr }),
  );

  const categorySlug = service.category?.slug ?? "";
  const showVehicleField =
    categorySlug.includes("vehicle") || service.slug.includes("vehicle");
  const showLicenseField =
    categorySlug.includes("license") || service.slug.includes("license");

  return (
    <>
      <PageHero
        title={tGuest("title", { service: name })}
        description={tGuest("description")}
        breadcrumbs={[
          { label: tNav("home"), href: "/" },
          { label: t("services.title"), href: "/services" },
          { label: name, href: `/services/${service.slug}` },
          { label: tGuest("breadcrumb") },
        ]}
      />

      <div className="container-site py-10 md:py-12">
        <GuestRequestForm
          serviceSlug={service.slug}
          serviceName={name}
          locale={locale}
          showVehicleField={showVehicleField}
          showLicenseField={showLicenseField}
          regionOptions={regionOptions}
          labels={{
            formIntro: tGuest("formIntro"),
            contactSection: tGuest("contactSection"),
            contactSectionHint: tGuest("contactSectionHint"),
            locationSection: tGuest("locationSection"),
            detailsSection: tGuest("detailsSection"),
            fullName: tGuest("fullName"),
            phone: tGuest("phone"),
            phoneHint: tGuest("phoneHint"),
            phonePlaceholder: tGuest("phonePlaceholder"),
            email: tGuest("email"),
            optional: tGuest("optional"),
            region: tGuest("region"),
            regionPlaceholder: tGuest("regionPlaceholder"),
            city: tGuest("city"),
            vehicleInfo: tGuest("vehicleInfo"),
            vehiclePlaceholder: tGuest("vehiclePlaceholder"),
            licenseInfo: tGuest("licenseInfo"),
            licensePlaceholder: tGuest("licensePlaceholder"),
            message: tGuest("message"),
            messagePlaceholder: tGuest("messagePlaceholder"),
            submit: tGuest("submit"),
            submitting: tGuest("submitting"),
            successTitle: tGuest("successTitle"),
            successDescription: submitSuccessDescription,
            backToService: tGuest("backToService"),
            error: tGuest("error"),
            whatsappFollowUp: tGuest("whatsappFollowUp"),
            validationSummary: tGuest("validationSummary"),
            errors: {
              fullNameRequired: tGuest("errors.fullNameRequired"),
              fullNameTooLong: tGuest("errors.fullNameTooLong"),
              phoneInvalid: tGuest("errors.phoneInvalid"),
              emailInvalid: tGuest("errors.emailInvalid"),
            },
          }}
        />
      </div>
    </>
  );
}
