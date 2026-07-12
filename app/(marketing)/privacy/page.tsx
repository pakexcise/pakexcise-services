import { createContentPage } from "@/features/marketing/lib/content-page";

const { generateMetadata, default: PrivacyPage } = createContentPage({
  pageKey: "privacy",
  path: "/privacy",
  breadcrumbLabel: { en: "Privacy Policy"}});

export { generateMetadata };
export default PrivacyPage;
