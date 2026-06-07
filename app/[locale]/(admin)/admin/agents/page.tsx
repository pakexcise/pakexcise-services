import { createAdminListPage } from "@/features/admin/lib/create-admin-list-page";

const { generateMetadata, default: AdminAgentsPage } = createAdminListPage({
  navKey: "agents",
  titleKey: "resources.agents.title",
  descriptionKey: "resources.agents.description",
  emptyTitleKey: "resources.agents.emptyTitle",
  emptyDescriptionKey: "resources.agents.emptyDescription",
});

export { generateMetadata };
export default AdminAgentsPage;
