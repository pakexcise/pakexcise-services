import type { Metadata, Route } from "next";
import { notFound, redirect } from "next/navigation";

import { GuestRequestForm } from "@/components/marketing/guest-request-form";
import { PageHero } from "@/components/marketing/page-hero";
import { redirectRepository, serviceRepository } from "@/server/repositories";

import { requireSubmitRequestEnabled } from "@/features/settings/lib/feature-gates";
import { getFormsSettings } from "@/features/settings/lib/public-settings-cache";
import { getServiceAssignedRegions } from "@/features/services/lib/service-regions";

export const dynamic = "force-dynamic";

type GuestRequestPageProps = {
  params: Promise<{ serviceSlug: string }>;
};

export async function generateMetadata({
  params}: GuestRequestPageProps): Promise<Metadata> {
  const { serviceSlug } = await params;
  const locale = "en";
  const service = await serviceRepository.findPublicDetailBySlug(serviceSlug);

  if (!service) {
    return {};
  }

  const name = service.nameEn ?? "";

  return {
    title:
      `Service request — ${name} | PakExcise.com`,
    robots: { index: false, follow: false }};
}

export default async function GuestRequestPage({ params }: GuestRequestPageProps) {
  await requireSubmitRequestEnabled();

  const { serviceSlug } = await params;
  const locale = "en";
const service = await serviceRepository.findPublicDetailBySlug(serviceSlug);

  if (!service) {
    const slugRedirect = await redirectRepository.findActiveByOldSlug(serviceSlug);

    if (slugRedirect) {
      redirect(`/request/${slugRedirect.newSlug}` as Route);
    }

    notFound();
  }

        const formsSettings = await getFormsSettings();
  const submitSuccessDescription =
    formsSettings.submitRequestSuccessMessageEn;

  const name = service.nameEn ?? "";
  const assignedRegions = getServiceAssignedRegions(service);
  const regionOptions = assignedRegions.map((region) =>
    region.nameEn ?? "",
  );

  const categorySlug = service.category?.slug ?? "";
  const showVehicleField =
    categorySlug.includes("vehicle") || service.slug.includes("vehicle");
  const showLicenseField =
    categorySlug.includes("license") || service.slug.includes("license");

  return (
    <>
      <PageHero
        title={`Request help with ${name}`}
        description={"Tell us what you need and our support team will reach out on WhatsApp. No account required."}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Excise facilitation services", href: "/services" },
          { label: name, href: `/services/${service.slug}` },
          { label: "Submit request" }]}
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
            formIntro: "You are submitting a support request for",
            contactSection: "Contact details",
            contactSectionHint: "We will use these details to reach you on WhatsApp.",
            locationSection: "Location",
            detailsSection: "Additional details",
            fullName: "Full name",
            phone: "WhatsApp / mobile number",
            phoneHint: "Pakistani mobile format: 03XX-XXXXXXX (11 digits).",
            phonePlaceholder: "03XX-XXXXXXX",
            email: "Email",
            optional: "optional",
            region: "Province / region",
            regionPlaceholder: "Select your province",
            city: "City",
            vehicleInfo: "Vehicle details",
            vehiclePlaceholder: "Registration number, make, model, etc.",
            licenseInfo: "License details",
            licensePlaceholder: "License number or type, if relevant",
            message: "Your message",
            messagePlaceholder: "Share any details that help us assist you faster.",
            submit: "Submit request",
            submitting: "Submitting…",
            successTitle: "Request submitted",
            successDescription: submitSuccessDescription,
            backToService: "Back to service",
            error: "Could not submit your request. Please try again.",
            whatsappFollowUp: "Please keep your WhatsApp available so our team can reach you.",
            validationSummary: "Please fix the following:",
            errors: {
              fullNameRequired: "Enter your full name (at least 2 characters).",
              fullNameTooLong: "Full name is too long.",
              phoneInvalid: "Enter a valid Pakistani mobile number (03XX-XXXXXXX).",
              emailInvalid: "Enter a valid email address."}}}
        />
      </div>
    </>
  );
}
