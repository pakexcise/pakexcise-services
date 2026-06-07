import { createAdminListPage } from "@/features/admin/lib/create-admin-list-page";

const { generateMetadata, default: AdminRegionsPage } = createAdminListPage({
  navKey: "regions",
  titleKey: "resources.regions.title",
  descriptionKey: "resources.regions.description",
  emptyTitleKey: "resources.regions.emptyTitle",
  emptyDescriptionKey: "resources.regions.emptyDescription",
  createLabelKey: "resources.regions.create",
});

export { generateMetadata };
export default AdminRegionsPage;
