import { createContentPage } from "@/features/marketing/lib/content-page";

const { generateMetadata, default: TermsPage } = createContentPage({
  pageKey: "terms",
  path: "/terms",
  breadcrumbLabel: { en: "Terms of Service"}});

export { generateMetadata };
export default TermsPage;
