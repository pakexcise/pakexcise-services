import { createMarketingPage } from "@/features/marketing/lib/create-marketing-page";

const { generateMetadata, default: TermsPage } = createMarketingPage({
  pageKey: "terms-and-conditions",
  path: "/terms-and-conditions",
  breadcrumbLabel: { en: "Terms and conditions", ur: "شرائط و ضوابط" },
  showCta: false,
});

export { generateMetadata };
export default TermsPage;
