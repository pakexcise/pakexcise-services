import { createAdminListPage } from "@/features/admin/lib/create-admin-list-page";

const { generateMetadata, default: AdminCustomersPage } = createAdminListPage({
  navKey: "customers",
  titleKey: "resources.customers.title",
  descriptionKey: "resources.customers.description",
  emptyTitleKey: "resources.customers.emptyTitle",
  emptyDescriptionKey: "resources.customers.emptyDescription",
});

export { generateMetadata };
export default AdminCustomersPage;
