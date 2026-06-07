import { createAdminListPage } from "@/features/admin/lib/create-admin-list-page";

const { generateMetadata, default: AdminAuditLogsPage } = createAdminListPage({
  navKey: "auditLogs",
  titleKey: "resources.auditLogs.title",
  descriptionKey: "resources.auditLogs.description",
  emptyTitleKey: "resources.auditLogs.emptyTitle",
  emptyDescriptionKey: "resources.auditLogs.emptyDescription",
});

export { generateMetadata };
export default AdminAuditLogsPage;
