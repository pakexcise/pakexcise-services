import { createMarketingPage } from "@/features/marketing/lib/create-marketing-page";

const { generateMetadata, default: CookiePolicyPage } = createMarketingPage({
  pageKey: "cookie-policy",
  path: "/cookie-policy",
  breadcrumbLabel: { en: "Cookie policy", ur: "کوکی پالیسی" },
  showCta: false,
});

export { generateMetadata };
export default CookiePolicyPage;
