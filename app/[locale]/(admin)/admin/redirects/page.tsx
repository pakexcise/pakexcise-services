import { createAdminListPage } from "@/features/admin/lib/create-admin-list-page";

const { generateMetadata, default: AdminRedirectsPage } = createAdminListPage({
  navKey: "redirects",
  titleKey: "resources.redirects.title",
  descriptionKey: "resources.redirects.description",
  emptyTitleKey: "resources.redirects.emptyTitle",
  emptyDescriptionKey: "resources.redirects.emptyDescription",
  createLabelKey: "resources.redirects.create",
});

export { generateMetadata };
export default AdminRedirectsPage;
