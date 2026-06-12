import { createMarketingPage } from "@/features/marketing/lib/create-marketing-page";

const { generateMetadata, default: PrivacyPolicyPage } = createMarketingPage({
  pageKey: "privacy-policy",
  path: "/privacy-policy",
  breadcrumbLabel: { en: "Privacy policy", ur: "رازداری کی پالیسی" },
  showCta: false,
});

export { generateMetadata };
export default PrivacyPolicyPage;
