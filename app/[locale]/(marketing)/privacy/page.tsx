import { createContentPage } from "@/features/marketing/lib/content-page";

const { generateMetadata, default: PrivacyPage } = createContentPage({
  pageKey: "privacy",
  path: "/privacy",
  breadcrumbLabel: { en: "Privacy Policy", ur: "رازداری کی پالیسی" },
});

export { generateMetadata };
export default PrivacyPage;
