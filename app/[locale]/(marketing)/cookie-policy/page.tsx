import { createLegalPage } from "@/features/legal-pages/lib/create-legal-page";

const { generateMetadata, default: CookiePolicyPage } = createLegalPage({
  slug: "cookie-policy",
  breadcrumbLabel: { en: "Cookie Policy", ur: "کوکی پالیسی" },
});

export { generateMetadata };
export default CookiePolicyPage;
