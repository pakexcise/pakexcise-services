import type { GuestLeadDetail } from "@/server/repositories/guest-lead-repository";
import type { SupportRequestEditorValues } from "@/features/guest-leads/admin/components/support-request-editor-form";

export function emptySupportRequestEditorValues(): SupportRequestEditorValues {
  return {
    serviceId: "",
    source: "GUEST_FORM",
    status: "NEW",
    fullName: "",
    phone: "",
    email: "",
    regionNameEn: "",
    regionNameUr: "",
    cityName: "",
    vehicleInfo: "",
    licenseInfo: "",
    message: "",
    adminNotes: "",
    locale: "en",
  };
}

export function leadToEditorValues(lead: GuestLeadDetail): SupportRequestEditorValues {
  return {
    serviceId: lead.service?.id ?? "",
    source: lead.source,
    status: lead.status,
    fullName: lead.fullName,
    phone: lead.phone,
    email: lead.email ?? "",
    regionNameEn: lead.regionNameEn ?? "",
    regionNameUr: lead.regionNameUr ?? "",
    cityName: lead.cityName ?? "",
    vehicleInfo: lead.vehicleInfo ?? "",
    licenseInfo: lead.licenseInfo ?? "",
    message: lead.message ?? "",
    adminNotes: lead.adminNotes ?? "",
    locale: lead.locale === "ur" ? "ur" : "en",
  };
}
