import { createMarketingPage } from "@/features/marketing/lib/create-marketing-page";

const { generateMetadata, default: DocumentsPage } = createMarketingPage({
  pageKey: "documents",
  path: "/documents",
  breadcrumbLabel: { en: "Documents"},
  applyHref: "/services"});

export { generateMetadata };
export default DocumentsPage;
