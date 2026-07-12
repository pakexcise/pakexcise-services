import { createLegalPage } from "@/features/legal-pages/lib/create-legal-page";

const { generateMetadata, default: DisclaimerPage } = createLegalPage({
  slug: "disclaimer",
  breadcrumbLabel: { en: "Disclaimer"}});

export { generateMetadata };
export default DisclaimerPage;
