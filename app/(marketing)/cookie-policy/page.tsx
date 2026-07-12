import { createLegalPage } from "@/features/legal-pages/lib/create-legal-page";

const { generateMetadata, default: CookiePolicyPage } = createLegalPage({
  slug: "cookie-policy",
  breadcrumbLabel: { en: "Cookie Policy"}});

export { generateMetadata };
export default CookiePolicyPage;
