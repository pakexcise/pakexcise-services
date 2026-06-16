import type { ContactInquiryDetail } from "@/server/repositories/contact-inquiry-repository";
import type { ContactInquiryEditorValues } from "@/features/contact-inquiries/admin/components/contact-inquiry-editor-form";

export function emptyContactInquiryEditorValues(): ContactInquiryEditorValues {
  return {
    serviceInterest: "",
    status: "NEW",
    fullName: "",
    phone: "",
    email: "",
    regionName: "",
    cityName: "",
    message: "",
    adminNotes: "",
    locale: "en",
  };
}

export function inquiryToEditorValues(
  inquiry: ContactInquiryDetail,
): ContactInquiryEditorValues {
  return {
    serviceInterest: inquiry.serviceInterest,
    status: inquiry.status,
    fullName: inquiry.fullName,
    phone: inquiry.phone,
    email: inquiry.email ?? "",
    regionName: inquiry.regionName ?? "",
    cityName: inquiry.cityName ?? "",
    message: inquiry.message ?? "",
    adminNotes: inquiry.adminNotes ?? "",
    locale: inquiry.locale === "ur" ? "ur" : "en",
  };
}
