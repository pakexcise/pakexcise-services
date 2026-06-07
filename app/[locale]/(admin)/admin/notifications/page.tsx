import { createAdminListPage } from "@/features/admin/lib/create-admin-list-page";

const { generateMetadata, default: AdminNotificationsPage } = createAdminListPage({
  navKey: "notifications",
  titleKey: "resources.notifications.title",
  descriptionKey: "resources.notifications.description",
  emptyTitleKey: "resources.notifications.emptyTitle",
  emptyDescriptionKey: "resources.notifications.emptyDescription",
});

export { generateMetadata };
export default AdminNotificationsPage;
