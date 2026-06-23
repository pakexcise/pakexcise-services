import { createLegalPage } from "@/features/legal-pages/lib/create-legal-page";

const { generateMetadata, default: TermsAndConditionsPage } = createLegalPage({
  slug: "terms-and-conditions",
  breadcrumbLabel: { en: "Terms and Conditions", ur: "شرائط و ضوابط" },
});

export { generateMetadata };
export default TermsAndConditionsPage;
