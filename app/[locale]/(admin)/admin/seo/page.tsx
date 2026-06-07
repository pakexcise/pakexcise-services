import { createAdminListPage } from "@/features/admin/lib/create-admin-list-page";

const { generateMetadata, default: AdminSeoPage } = createAdminListPage({
  navKey: "seo",
  titleKey: "resources.seo.title",
  descriptionKey: "resources.seo.description",
  emptyTitleKey: "resources.seo.emptyTitle",
  emptyDescriptionKey: "resources.seo.emptyDescription",
});

export { generateMetadata };
export default AdminSeoPage;
