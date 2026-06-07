import { createAdminListPage } from "@/features/admin/lib/create-admin-list-page";

const { generateMetadata, default: AdminGuidesPage } = createAdminListPage({
  navKey: "guides",
  titleKey: "resources.guides.title",
  descriptionKey: "resources.guides.description",
  emptyTitleKey: "resources.guides.emptyTitle",
  emptyDescriptionKey: "resources.guides.emptyDescription",
  createLabelKey: "resources.guides.create",
});

export { generateMetadata };
export default AdminGuidesPage;
