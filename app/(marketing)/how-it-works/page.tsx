import { createMarketingPage } from "@/features/marketing/lib/create-marketing-page";

const { generateMetadata, default: HowItWorksPage } = createMarketingPage({
  pageKey: "how-it-works",
  path: "/how-it-works",
  breadcrumbLabel: { en: "How it works"}});

export { generateMetadata };
export default HowItWorksPage;
