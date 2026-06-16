import type { AdminApplicationDetail } from "@/server/repositories/application-repository";
import type { ApplicationEditorValues } from "@/features/applications/admin/components/application-editor-form";

export function emptyApplicationEditorValues(): ApplicationEditorValues {
  return {
    userId: "",
    serviceId: "",
    agentId: "",
    status: "SUBMITTED",
    locale: "en",
    adminNotes: "",
    statusChangeNote: "",
  };
}

export function applicationToEditorValues(
  application: AdminApplicationDetail,
): ApplicationEditorValues {
  return {
    userId: application.user.id,
    serviceId: application.service.id,
    agentId: application.agent?.id ?? "",
    status: application.status,
    locale: application.locale === "ur" ? "ur" : "en",
    adminNotes: application.adminNotes ?? "",
    statusChangeNote: "",
  };
}
