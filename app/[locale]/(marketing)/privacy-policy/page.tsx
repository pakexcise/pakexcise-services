import { createLegalPage } from "@/features/legal-pages/lib/create-legal-page";

const { generateMetadata, default: PrivacyPolicyPage } = createLegalPage({
  slug: "privacy-policy",
  breadcrumbLabel: { en: "Privacy Policy", ur: "رازداری کی پالیسی" },
});

export { generateMetadata };
export default PrivacyPolicyPage;
