import { createLegalPage } from "@/features/legal-pages/lib/create-legal-page";

const { generateMetadata, default: DisclaimerPage } = createLegalPage({
  slug: "disclaimer",
  breadcrumbLabel: { en: "Disclaimer", ur: "ڈس کلیمر" },
});

export { generateMetadata };
export default DisclaimerPage;
