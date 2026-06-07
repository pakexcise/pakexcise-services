import { createAdminListPage } from "@/features/admin/lib/create-admin-list-page";

const { generateMetadata, default: AdminBlogPage } = createAdminListPage({
  navKey: "blog",
  titleKey: "resources.blog.title",
  descriptionKey: "resources.blog.description",
  emptyTitleKey: "resources.blog.emptyTitle",
  emptyDescriptionKey: "resources.blog.emptyDescription",
  createLabelKey: "resources.blog.create",
});

export { generateMetadata };
export default AdminBlogPage;
